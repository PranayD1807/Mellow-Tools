// Encrypt all user data
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import textTemplateModel from "../models/textTemplate.model.js";
import bookmarkModel from "../models/bookmark.model.js";
import noteModel from "../models/note.model.js";

dotenv.config();


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

async function encryptValue(value, aesKey) {
    if (typeof value === "string") {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
        const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
        return Buffer.concat([iv, encrypted]).toString("base64");
    }

    if (Array.isArray(value)) {
        const encryptedArr = [];
        for (const item of value) {
            encryptedArr.push(await encryptValue(item, aesKey));
        }
        return encryptedArr;
    }

    if (typeof value === "object" && value !== null) {
        const encryptedObj = {};
        for (const key of Object.keys(value)) {
            if (key === "_id" || key === "id") {
                encryptedObj[key] = value[key];
            } else {
                encryptedObj[key] = await encryptValue(value[key], aesKey);
            }
        }
        return encryptedObj;
    }

    return value;
}

async function generateAndSaveUserAESKey(user, tempPassword, session) {
    const aesKey = generateAESKey();
    const tempKeySalt = generateSalt();
    const derivedKey = deriveKey(tempPassword, tempKeySalt);
    const encryptedAESKey = encryptAESKey(aesKey, derivedKey);

    user.encryptedAESKey = encryptedAESKey;
    user.passwordKeySalt = tempKeySalt;

    await user.save({ session });

    return aesKey;
}

async function migrateCollectionEncryption(model, fields, userId, aesKey, session) {
    const docs = await model.find({ user: userId }).session(session);

    for (const doc of docs) {
        const plainDoc = doc.toObject(); // 🔑 Flatten mongoose document

        for (const field of fields) {
            const val = plainDoc[field];
            if (val) {
                doc[field] = await encryptValue(val, aesKey); // work on plain content
            }
        }

        await doc.save({ session });
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

    const users = await userModel.find({
        $or: [
            { encryptionStatus: { $exists: false } },
            { encryptionStatus: { $eq: "UNENCRYPTED" } }
        ]
    });


    for (const user of users) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            console.log(`😲 Updating User with user_id = ${user.id}`);

            const aesKey = await generateAndSaveUserAESKey(user, TEMP_PASSWORD, session);
            await migrateCollectionEncryption(textTemplateModel, ["title", "content", "placeholders"], user._id, aesKey, session);
            await migrateCollectionEncryption(bookmarkModel, ["label", "note", "logoUrl", "url"], user._id, aesKey, session);
            await migrateCollectionEncryption(noteModel, ["title", "text"], user._id, aesKey, session);

            await userModel.updateOne(
                { _id: user._id },
                { encryptionStatus: "MIGRATED" },
                { session }
            );

            await session.commitTransaction();
        } catch (err) {
            console.error("❌ Error during encryption for user:", user.id, err);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
    }

    console.log("✅ All data encrypted.");
    mongoose.disconnect();
})();