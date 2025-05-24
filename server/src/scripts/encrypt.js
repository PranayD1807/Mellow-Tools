// Encrypt all user data
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import textTemplateModel from "../models/textTemplate.model.js";
import bookmarkModel from "../models/bookmark.model.js";
import noteModel from "../models/note.model.js";

dotenv.config({ path: "../../.env" });


const TEMP_PASSWORD = process.env.TEMP_PASS;
const SALT_LENGTH = 16;
const IV_LENGTH = 16;

// --- UTILS ---
function generateAESKey() {
    return crypto.randomBytes(32);
}

function generateSalt() {
    return crypto.randomBytes(SALT_LENGTH).toString("base64");
}

function deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, Buffer.from(salt, "base64"), 100000, 32, "sha256");
}

function encryptAESKey(aesKey, derivedKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", derivedKey, iv);
    const encrypted = Buffer.concat([cipher.update(aesKey), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString("base64");
}

function encryptValue(value, aesKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString("base64");
}

async function generateAndSaveUserAESKey(user, tempPassword) {
    const aesKey = generateAESKey();
    const tempKeySalt = generateSalt();
    const derivedKey = deriveKey(tempPassword, tempKeySalt);
    const encryptedAESKey = encryptAESKey(aesKey, derivedKey);

    user.encryptedAESKey = encryptedAESKey;
    user.passwordKeySalt = tempKeySalt;
    user.encryptionStatus = "MIGRATED";
    await user.save();

    return aesKey;
}

async function migrateCollectionEncryption(model, fields, userId, aesKey) {
    const docs = await model.find({ user: userId });

    for (const doc of docs) {
        for (const field of fields) {
            if (doc[field]) {
                doc[field] = encryptValue(doc[field], aesKey);
            }
        }
        await doc.save();
    }
}

(async () => {
    const DB = process.env.DATABASE.replace(
        "<PASSWORD>",
        process.env.MONGODB_PASSWORD
    );

    await mongoose
        .connect(DB, {
            dbName: process.env.NODE_ENV === "PROD" ? "prod" : "dev"
        })
        .then(() => console.log("DB connection successful! 👍\n"));

    const users = await userModel.find({ encryptionStatus: "UNENCRYPTED" });

    for (const user of users) {
        const aesKey = await generateAndSaveUserAESKey(user, TEMP_PASSWORD);
        await migrateCollectionEncryption(textTemplateModel, ["title", "content", "placeholders"], user._id, aesKey);
        await migrateCollectionEncryption(bookmarkModel, ["label", "note", "logoUrl", "url"], user._id, aesKey);
        await migrateCollectionEncryption(noteModel, ["title", "text"], user._id, aesKey);
        // Update User Status
        await userModel.updateOne(
            { _id: user._id },
            { encryptionStatus: "MIGRATED" }
        );

    }

    console.log("✅ All data encrypted.");
    mongoose.disconnect();
})();