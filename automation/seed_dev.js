
import mongoose from "../server/node_modules/mongoose/index.js";
import dotenv from "dotenv";
import crypto from "crypto";
import User from "../server/src/models/user.model.js";
import Auth from "../server/src/models/auth.model.js";
import JobApplication from "../server/src/models/jobApplication.model.js";
import Bookmark from "../server/src/models/bookmark.model.js";
import Note from "../server/src/models/note.model.js";
import TextTemplate from "../server/src/models/textTemplate.model.js";

dotenv.config({ path: "../server/.env" });

const ITERATIONS = 600000;
const KEY_LENGTH = 32; // 256 bits

const arrayBufferToBase64 = (buffer) => {
    return buffer.toString('base64');
};

const base64ToBuffer = (base64) => {
    return Buffer.from(base64, 'base64');
};

const generateSalt = () => {
    return crypto.randomBytes(16).toString('base64');
};

const generateAESKey = () => {
    return crypto.randomBytes(KEY_LENGTH);
};

const deriveKey = (password, saltBase64) => {
    const salt = base64ToBuffer(saltBase64);
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
};

const encryptData = (text, key) => {
    const IV_LENGTH = 12;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const tag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, encrypted, tag]);
    return arrayBufferToBase64(combined);
};

const encryptAESKey = (keyToEncrypt, kek) => {
    // Encrypt the raw key bytes directly (not base64 encoded)
    // This matches what the client expects when decrypting
    const IV_LENGTH = 12;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', kek, iv);

    // Encrypt the raw key buffer directly
    let encrypted = cipher.update(keyToEncrypt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const tag = cipher.getAuthTag();

    // Combine: IV + encrypted key + auth tag
    const combined = Buffer.concat([iv, encrypted, tag]);
    return arrayBufferToBase64(combined);
};

const createUserWithData = async (userConfig) => {
    const { email, displayName, password, encryptionStatus, shouldEncryptData } = userConfig;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Creating user: ${email}`);
    console.log(`Encryption Status: ${encryptionStatus || 'NONE (old user)'}`);
    console.log(`Data will be: ${shouldEncryptData ? 'ENCRYPTED' : 'UNENCRYPTED'}`);
    console.log('='.repeat(60));

    // Delete existing user and data
    let user = await User.findOne({ email });
    if (user) {
        console.log("Deleting existing user and data...");
        await JobApplication.deleteMany({ user: user._id });
        await Bookmark.deleteMany({ user: user._id });
        await Note.deleteMany({ user: user._id });
        await TextTemplate.deleteMany({ user: user._id });
        await Auth.deleteMany({ user: user._id });
        await User.deleteOne({ _id: user._id });
    }

    // Create new user
    console.log("Creating new user...");
    user = new User({
        displayName: displayName,
        email: email,
    });
    await user.save();

    const auth = new Auth({ user: user._id });
    auth.setPassword(password);

    // Declare masterKey outside so maybeEncrypt can access it later
    let masterKey = null;

    // Only create encryption keys for migrated and encrypted users
    // Old users should NOT have these fields at all
    if (encryptionStatus) {
        masterKey = generateAESKey();
        const salt = generateSalt();
        const kek = deriveKey(password, salt);
        const encryptedAESKey = encryptAESKey(masterKey, kek);

        auth.encryptedAESKey = encryptedAESKey;
        auth.passwordKeySalt = salt;
        auth.encryptionStatus = encryptionStatus;
    }

    auth.isTwoFactorEnabled = false;
    await auth.save();

    // Seed data
    const companies = ["Google", "Netflix", "Meta", "Amazon", "Spotify", "Apple", "Microsoft", "Uber", "Airbnb", "Stripe"];
    const roles = ["Frontend Engineer", "Backend Engineer", "Full Stack Dev", "SDE II", "Staff Engineer", "UI Engineer"];
    const locations = ["Remote", "NYC", "London", "San Francisco", "Bangalore", "Berlin"];
    const statuses = ["Applied", "Interviewing", "Offer", "Rejected"];

    // Helper to conditionally encrypt (only if masterKey exists and shouldEncryptData is true)
    const maybeEncrypt = (text) => (shouldEncryptData && masterKey) ? encryptData(text, masterKey) : text;

    // Seed Job Applications
    console.log("Seeding Job Applications...");
    const jobDocs = [];
    for (let i = 0; i < 200; i++) {
        const company = companies[i % companies.length];
        const role = roles[i % roles.length];

        jobDocs.push({
            user: user._id,
            company: maybeEncrypt(`${company} ${i}`),
            role: maybeEncrypt(role),
            location: maybeEncrypt(locations[i % locations.length]),
            status: statuses[i % statuses.length],
            jobLink: maybeEncrypt(`https://jobs.${company.toLowerCase()}.com/${i}`),
            appliedOn: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
            note: maybeEncrypt(`This is a generated note for application ${i}.`),
            interviewStage: maybeEncrypt(`Stage ${i % 5}`),
        });
    }
    await JobApplication.insertMany(jobDocs);
    console.log("✅ 200 Job Applications seeded");

    // Seed Bookmarks
    console.log("Seeding Bookmarks...");
    const bookmarkDocs = [];
    for (let i = 0; i < 200; i++) {
        bookmarkDocs.push({
            user: user._id,
            label: maybeEncrypt(`Bookmark ${i}`),
            url: maybeEncrypt(`https://example.com/${i}`),
            logoUrl: maybeEncrypt(`https://via.placeholder.com/64?text=${i}`),
            note: maybeEncrypt(`Generated bookmark ${i}`),
        });
    }
    await Bookmark.insertMany(bookmarkDocs);
    console.log("✅ 200 Bookmarks seeded");

    // Seed Notes
    console.log("Seeding Notes...");
    const noteDocs = [];
    for (let i = 0; i < 200; i++) {
        noteDocs.push({
            user: user._id,
            title: maybeEncrypt(`Note Title ${i}`),
            text: maybeEncrypt(`This is the content of note ${i}.`),
        });
    }
    await Note.insertMany(noteDocs);
    console.log("✅ 200 Notes seeded");

    // Seed Text Templates
    console.log("Seeding Text Templates...");
    const templateDocs = [];
    for (let i = 0; i < 200; i++) {
        templateDocs.push({
            user: user._id,
            title: maybeEncrypt(`Template ${i}`),
            content: maybeEncrypt(`Hello [Name], this is template ${i}.`),
            placeholders: [
                {
                    tag: maybeEncrypt("Name"),
                    defaultValue: maybeEncrypt("User")
                }
            ]
        });
    }
    await TextTemplate.insertMany(templateDocs);
    console.log("✅ 200 Text Templates seeded");

    console.log(`✅ User ${email} created successfully!`);
};

const seedMultipleUsers = async () => {
    try {
        const DB = process.env.DATABASE.replace(
            "<PASSWORD>",
            process.env.MONGODB_PASSWORD
        );

        mongoose.set("strictQuery", true);
        await mongoose.connect(DB, {
            dbName: process.env.NODE_ENV === "PROD" ? "prod" : "dev",
        });
        console.log("DB connection successful! 👍\n");

        const password = "User@1234"; // Same password for all test users

        // User 1: Old user (no encryptionStatus field) with UNENCRYPTED data
        await createUserWithData({
            email: "old@test.com",
            displayName: "Old User",
            password: password,
            encryptionStatus: null, // No field at all
            shouldEncryptData: false, // Unencrypted data
        });

        // User 2: Migrated user with UNENCRYPTED data
        await createUserWithData({
            email: "migrated@test.com",
            displayName: "Migrated User",
            password: password,
            encryptionStatus: "MIGRATED",
            shouldEncryptData: false, // Unencrypted data
        });

        // User 3: Encrypted user with ENCRYPTED data
        await createUserWithData({
            email: "encrypted@test.com",
            displayName: "Encrypted User",
            password: password,
            encryptionStatus: "ENCRYPTED",
            shouldEncryptData: true, // Encrypted data
        });

        console.log("\n" + "=".repeat(60));
        console.log("🎉 ALL USERS SEEDED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log("\n📊 Test Users Summary:\n");
        console.log("1. Old User (old@test.com)");
        console.log("   - Password: User@1234");
        console.log("   - Encryption Status: NONE (field doesn't exist)");
        console.log("   - Data: UNENCRYPTED (2000 items)");
        console.log("   - Expected: Button should show\n");

        console.log("2. Migrated User (migrated@test.com)");
        console.log("   - Password: User@1234");
        console.log("   - Encryption Status: MIGRATED");
        console.log("   - Data: UNENCRYPTED (2000 items)");
        console.log("   - Expected: Button should show\n");

        console.log("3. Encrypted User (encrypted@test.com)");
        console.log("   - Password: User@1234");
        console.log("   - Encryption Status: ENCRYPTED");
        console.log("   - Data: ENCRYPTED (2000 items)");
        console.log("   - Expected: Button should be hidden\n");

        console.log("Total: 2400 items across 3 users");
        console.log("=".repeat(60));

    } catch (err) {
        console.error("\n❌ Seeding failed!");
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("\nDB disconnected.");
        process.exit();
    }
};

seedMultipleUsers();
