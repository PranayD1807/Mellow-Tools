import { ApiResponse } from "@/models/ApiResponse";
import privateClient from "../client/private.client";
import { handleApiError } from "@/helper/error.helper";
import { JobApplication, CreateJobApplicationData } from "@/models/JobApplication";

const jobApplicationEndpoints = {

    create: "job-applications",
    get: "job-applications/{id}",
    update: "job-applications/{id}",
    delete: "job-applications/{id}",
    getStats: "job-applications/stats",
    bulkUpdate: "job-applications/bulk-update",
};

const jobApplicationApi = {
    getStats: async (): Promise<ApiResponse<{ total: number; Applied: number; Interviewing: number; Offer: number; Rejected: number }>> => {
        try {
            const response = await privateClient.get<ApiResponse<{ total: number; Applied: number; Interviewing: number; Offer: number; Rejected: number }>>(jobApplicationEndpoints.getStats);
            return {
                status: response.data.status,
                data: response.data.data || { total: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 },
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },
    getAll: async (params: { search?: string; status?: string; sort?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<JobApplication[]>> => {
        try {
            // Note: Server-side search/sort on encrypted fields (company, role, etc.) is not possible.
            // We pass status and dates through, but search is handled client-side via Iterative Search.
            const queryParams = new URLSearchParams();
            queryParams.append("fields", "-user");

            // Status is unencrypted, so we can filter by it on server
            if (params.status && params.status !== "all") queryParams.append("status", params.status);

            // Dates are unencrypted, so we can sort by them on server
            if (params.sort) queryParams.append("sort", params.sort);

            if (params.page) queryParams.append("page", params.page.toString());
            if (params.limit) queryParams.append("limit", params.limit.toString());

            const endpoint = `job-applications?${queryParams.toString()}`;
            const response = await privateClient.get<ApiResponse<JobApplication[]>>(endpoint);

            const decryptedApps = await Promise.all(
                response.data.data.map(async (app) =>
                    Object.assign(new JobApplication(), app).decrypt()
                )
            );

            return {
                status: response.data.status,
                data: decryptedApps,
                results: response.data.results || 0,
                totalResults: response.data.totalResults || 0,
                totalPages: response.data.totalPages || 0,
                page: response.data.page || 1,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    // Raw version for migration - returns data without auto-decryption
    getAllRaw: async (params: { search?: string; status?: string; sort?: string; page?: number; limit?: number } = {}): Promise<ApiResponse<JobApplication[]>> => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append("fields", "-user");

            if (params.status && params.status !== "all") queryParams.append("status", params.status);
            if (params.sort) queryParams.append("sort", params.sort);
            if (params.page) queryParams.append("page", params.page.toString());
            if (params.limit) queryParams.append("limit", params.limit.toString());

            const endpoint = `job-applications?${queryParams.toString()}`;
            const response = await privateClient.get<ApiResponse<JobApplication[]>>(endpoint);

            const rawApps = response.data.data.map((app) =>
                Object.assign(new JobApplication(), app)
            );

            return {
                status: response.data.status,
                data: rawApps,
                results: response.data.results || 0,
                totalResults: response.data.totalResults || 0,
                totalPages: response.data.totalPages || 0,
                page: response.data.page || 1,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    get: async (id: string): Promise<ApiResponse<JobApplication | null>> => {
        try {
            const endpoint = jobApplicationEndpoints.get.replace("{id}", id);
            const response = await privateClient.get<ApiResponse<JobApplication>>(endpoint);

            let decryptedApp: JobApplication | null = null;
            if (response.data.data) {
                decryptedApp = await Object.assign(new JobApplication(), response.data.data).decrypt();
            }

            return {
                status: response.data.status,
                data: decryptedApp,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    create: async (data: Partial<CreateJobApplicationData>): Promise<ApiResponse<JobApplication | null>> => {
        try {
            const instance = Object.assign(new CreateJobApplicationData(), data);
            const encryptedData = await instance.encrypt();

            const response = await privateClient.post<ApiResponse<JobApplication>>(
                jobApplicationEndpoints.create,
                encryptedData
            );

            return {
                status: response.data.status,
                data: response.data.data
                    ? await Object.assign(new JobApplication(), response.data.data).decrypt()
                    : null,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    update: async (
        id: string,
        data: Partial<CreateJobApplicationData>
    ): Promise<ApiResponse<JobApplication | null>> => {
        try {
            const instance = Object.assign(new CreateJobApplicationData(), data);
            const encryptedData = await instance.encrypt();

            const endpoint = jobApplicationEndpoints.update.replace("{id}", id);
            const response = await privateClient.patch<ApiResponse<JobApplication>>(
                endpoint,
                encryptedData
            );

            return {
                status: response.data.status,
                data: response.data.data
                    ? await Object.assign(new JobApplication(), response.data.data).decrypt()
                    : null,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        try {
            const endpoint = jobApplicationEndpoints.delete.replace("{id}", id);
            const response = await privateClient.delete<ApiResponse<null>>(endpoint);

            return {
                status: response.data.status,
                data: null,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },

    bulkUpdate: async (updates: Array<{ id: string; data: Partial<CreateJobApplicationData> }>): Promise<ApiResponse<{ matchedCount: number; modifiedCount: number }>> => {
        try {
            const response = await privateClient.patch<ApiResponse<{ matchedCount: number; modifiedCount: number }>>(
                jobApplicationEndpoints.bulkUpdate,
                { updates }
            );
            return {
                status: response.data.status,
                data: response.data.data,
            };
        } catch (err: unknown) {
            return handleApiError(err);
        }
    },
};

export default jobApplicationApi;
