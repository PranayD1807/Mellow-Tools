/* eslint-disable @typescript-eslint/no-explicit-any */
import { AESKeyManager } from "./aesKeyManager.helper";
import Encryption from "./encryption.helper";
import noteApi from "@/api/modules/note.api";
import bookmarksApi from "@/api/modules/bookmarks.api";
import textTemplatesApi from "@/api/modules/textTemplates.api";
import jobApplicationApi from "@/api/modules/jobApplication.api";
import { TextNote } from "@/models/TextNote";
import { Bookmark } from "@/models/Bookmark";
import { TextTemplate } from "@/models/TextTemplate";
import { JobApplication } from "@/models/JobApplication";

export interface CollectionMigrationResult {
    collectionName: string;
    total: number;
    encrypted: number;
    alreadyEncrypted: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
}

export interface MigrationResult {
    success: boolean;
    collections: CollectionMigrationResult[];
    totalItems: number;
    totalEncrypted: number;
    totalAlreadyEncrypted: number;
    totalFailed: number;
}

export class DataMigrationHelper {
    /**
     * Attempts to detect if a field value is encrypted by trying to decrypt it.
     * Returns true if the value appears to be encrypted (decryption succeeds or fails with expected error).
     * Returns false if the value is plaintext.
     */
    static async isFieldEncrypted(
        value: any,
        aesKey: CryptoKey
    ): Promise<boolean> {
        // Handle null/undefined
        if (value === undefined || value === null) {
            return true; // Consider empty/null as "secure" for migration purposes
        }

        // Handle recursive structures
        if (Array.isArray(value)) {
            if (value.length === 0) return true;
            for (const item of value) {
                if (!(await this.isFieldEncrypted(item, aesKey))) {
                    return false;
                }
            }
            return true;
        }

        if (typeof value === "object" && value !== null) {
            const keys = Object.keys(value);
            if (keys.length === 0) return true;
            for (const key of keys) {
                if (!(await this.isFieldEncrypted(value[key], aesKey))) {
                    return false;
                }
            }
            return true;
        }

        // Handle string values (the ultimate target of encryption)
        if (typeof value !== "string") {
            return true; // Non-string primitives are not encrypted targets
        }

        if (!value) return true;

        // Very short strings are likely not encrypted
        if (value.length < 20) {
            return false;
        }

        return await Encryption.isEncrypted(value, aesKey);
    }

    /**
     * Checks if an entire object has any unencrypted fields based on the encryptFields list
     */
    static async hasUnencryptedFields(
        item: any,
        encryptFields: string[],
        aesKey: CryptoKey
    ): Promise<boolean> {
        for (const field of encryptFields) {
            const value = item[field];
            if (value !== undefined && value !== null) {
                const isEncrypted = await this.isFieldEncrypted(value, aesKey);
                if (!isEncrypted) {
                    return true; // Found at least one unencrypted field
                }
            }
        }
        return false;
    }

    /**
     * Migrates a single collection of items using batch updates
     */
    static async migrateCollection<T extends { id: string; encrypt: () => Promise<T> }>(
        collectionName: string,
        items: T[],
        encryptFields: string[],
        bulkUpdateFn: (updates: Array<{ id: string; data: any }>) => Promise<any>
    ): Promise<CollectionMigrationResult> {
        const result: CollectionMigrationResult = {
            collectionName,
            total: items.length,
            encrypted: 0,
            alreadyEncrypted: 0,
            failed: 0,
            errors: [],
        };

        const aesKey = await AESKeyManager.getAESKey();
        if (!aesKey) {
            console.error(`[Migration] CRITICAL: aesKey is undefined in migrateCollection for ${collectionName}`);
            throw new Error("AES key not available. Please log in again.");
        }
        console.log(`[Migration] Starting migration for ${collectionName}. aesKey type: ${aesKey.type}, algorithm: ${JSON.stringify(aesKey.algorithm)}`);

        const BATCH_SIZE = 50;
        const itemsToEncrypt: T[] = [];

        for (const item of items) {
            try {
                const needsEncryption = await this.hasUnencryptedFields(
                    item,
                    encryptFields,
                    aesKey
                );

                if (!needsEncryption) {
                    result.alreadyEncrypted++;
                    continue;
                }

                itemsToEncrypt.push(item);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Analysis failed";
                console.error(`[Migration] Analysis failed for item ${item.id} in ${collectionName}:`, error);
                result.failed++;
                result.errors.push({
                    id: item.id,
                    error: errorMessage,
                });
            }
        }

        // Process in batches
        for (let i = 0; i < itemsToEncrypt.length; i += BATCH_SIZE) {
            const batch = itemsToEncrypt.slice(i, i + BATCH_SIZE);
            try {
                const updates = batch.map((item) => {
                    const data: any = {};
                    encryptFields.forEach(field => {
                        data[field] = (item as any)[field];
                    });

                    return { id: item.id, data };
                });

                await bulkUpdateFn(updates);
                result.encrypted += batch.length;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Batch update failed";
                console.error(`[Migration] Batch update failed for ${collectionName}:`, error);
                result.failed += batch.length;
                batch.forEach(item => {
                    result.errors.push({
                        id: item.id,
                        error: errorMessage,
                    });
                });
            }
        }

        return result;
    }

    /**
     * Migrates all user data across all collections using pagination
     */
    static async migrateAllData(): Promise<MigrationResult> {
        const collections: CollectionMigrationResult[] = [];
        const PAGE_SIZE = 100; // Process 100 items at a time for efficiency
        const SORT = "_id"; // Use stable sort to avoid pagination issues during updates

        // Migrate Notes with pagination
        try {
            const notesResult: CollectionMigrationResult = {
                collectionName: "Notes",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [],
            };

            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const notesResponse = await noteApi.getAllRaw({ page, limit: PAGE_SIZE, sort: SORT });
                if (notesResponse.data && notesResponse.data.length > 0) {
                    const notes = notesResponse.data.map((note: any) => {
                        const textNote = new TextNote();
                        Object.assign(textNote, note);
                        return textNote;
                    });

                    const pageResult = await this.migrateCollection(
                        "Notes",
                        notes,
                        ["title", "text"],
                        async (updates) => {
                            return await noteApi.bulkUpdate(updates);
                        }
                    );

                    // Accumulate results
                    notesResult.total += pageResult.total;
                    notesResult.encrypted += pageResult.encrypted;
                    notesResult.alreadyEncrypted += pageResult.alreadyEncrypted;
                    notesResult.failed += pageResult.failed;
                    notesResult.errors.push(...pageResult.errors);

                    // Check if there are more pages
                    hasMore = notesResponse.data.length === PAGE_SIZE;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            collections.push(notesResult);
        } catch (error) {
            collections.push({
                collectionName: "Notes",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [
                    {
                        id: "collection",
                        error: error instanceof Error ? error.message : "Failed to fetch notes",
                    },
                ],
            });
        }

        // Migrate Bookmarks with pagination
        try {
            const bookmarksResult: CollectionMigrationResult = {
                collectionName: "Bookmarks",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [],
            };

            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const bookmarksResponse = await bookmarksApi.getAllRaw({ page, limit: PAGE_SIZE, sort: SORT });
                if (bookmarksResponse.data && bookmarksResponse.data.length > 0) {
                    const bookmarks = bookmarksResponse.data.map((bookmark: any) => {
                        const bookmarkObj = new Bookmark();
                        Object.assign(bookmarkObj, bookmark);
                        return bookmarkObj;
                    });

                    const pageResult = await this.migrateCollection(
                        "Bookmarks",
                        bookmarks,
                        ["label", "note", "logoUrl", "url"],
                        async (updates) => {
                            return await bookmarksApi.bulkUpdate(updates);
                        }
                    );

                    // Accumulate results
                    bookmarksResult.total += pageResult.total;
                    bookmarksResult.encrypted += pageResult.encrypted;
                    bookmarksResult.alreadyEncrypted += pageResult.alreadyEncrypted;
                    bookmarksResult.failed += pageResult.failed;
                    bookmarksResult.errors.push(...pageResult.errors);

                    hasMore = bookmarksResponse.data.length === PAGE_SIZE;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            collections.push(bookmarksResult);
        } catch (error) {
            collections.push({
                collectionName: "Bookmarks",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [
                    {
                        id: "collection",
                        error:
                            error instanceof Error ? error.message : "Failed to fetch bookmarks",
                    },
                ],
            });
        }

        // Migrate Text Templates with pagination
        try {
            const templatesResult: CollectionMigrationResult = {
                collectionName: "Text Templates",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [],
            };

            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const templatesResponse = await textTemplatesApi.getAllRaw({ page, limit: PAGE_SIZE, sort: SORT });
                if (templatesResponse.data && templatesResponse.data.length > 0) {
                    const templates = templatesResponse.data.map((template: any) => {
                        const templateObj = new TextTemplate();
                        Object.assign(templateObj, template);
                        return templateObj;
                    });

                    const pageResult = await this.migrateCollection(
                        "Text Templates",
                        templates,
                        ["title", "content", "placeholders"],
                        async (updates) => {
                            return await textTemplatesApi.bulkUpdate(updates);
                        }
                    );

                    // Accumulate results
                    templatesResult.total += pageResult.total;
                    templatesResult.encrypted += pageResult.encrypted;
                    templatesResult.alreadyEncrypted += pageResult.alreadyEncrypted;
                    templatesResult.failed += pageResult.failed;
                    templatesResult.errors.push(...pageResult.errors);

                    hasMore = templatesResponse.data.length === PAGE_SIZE;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            collections.push(templatesResult);
        } catch (error) {
            collections.push({
                collectionName: "Text Templates",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [
                    {
                        id: "collection",
                        error:
                            error instanceof Error ? error.message : "Failed to fetch templates",
                    },
                ],
            });
        }

        // Migrate Job Applications with pagination
        try {
            const jobsResult: CollectionMigrationResult = {
                collectionName: "Job Applications",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [],
            };

            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const jobsResponse = await jobApplicationApi.getAllRaw({ page, limit: PAGE_SIZE, sort: SORT });
                if (jobsResponse.data && jobsResponse.data.length > 0) {
                    const jobs = jobsResponse.data.map((job: any) => {
                        const jobObj = new JobApplication();
                        Object.assign(jobObj, job);
                        return jobObj;
                    });

                    const pageResult = await this.migrateCollection(
                        "Job Applications",
                        jobs,
                        ["company", "role", "location", "jobLink", "note", "interviewStage"],
                        async (updates) => {
                            return await jobApplicationApi.bulkUpdate(updates);
                        }
                    );

                    // Accumulate results
                    jobsResult.total += pageResult.total;
                    jobsResult.encrypted += pageResult.encrypted;
                    jobsResult.alreadyEncrypted += pageResult.alreadyEncrypted;
                    jobsResult.failed += pageResult.failed;
                    jobsResult.errors.push(...pageResult.errors);

                    hasMore = jobsResponse.data.length === PAGE_SIZE;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            collections.push(jobsResult);
        } catch (error) {
            collections.push({
                collectionName: "Job Applications",
                total: 0,
                encrypted: 0,
                alreadyEncrypted: 0,
                failed: 0,
                errors: [
                    {
                        id: "collection",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Failed to fetch job applications",
                    },
                ],
            });
        }

        // Calculate totals
        const totalItems = collections.reduce((sum, c) => sum + c.total, 0);
        const totalEncrypted = collections.reduce((sum, c) => sum + c.encrypted, 0);
        const totalAlreadyEncrypted = collections.reduce(
            (sum, c) => sum + c.alreadyEncrypted,
            0
        );
        const totalFailed = collections.reduce((sum, c) => sum + c.failed, 0);

        return {
            success: totalFailed === 0,
            collections,
            totalItems,
            totalEncrypted,
            totalAlreadyEncrypted,
            totalFailed,
        };
    }
}
