import mongoose from "mongoose";
import modelOptions from "./model.options.js";
import crypto from "crypto";

const authSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    salt: {
        type: String,
        required: true,
        select: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    // Salt value used for deriving passwordDerivedKey.
    // Optional - only exists for users with encryption enabled
    passwordKeySalt: {
        type: String,
        required: false,
    },
    // Encrypted AES Key for E2E Encryption
    // Optional - only exists for users with encryption enabled
    encryptedAESKey: {
        type: String,
        required: false,
    },
    encryptionStatus: {
        type: String,
        enum: ["UNENCRYPTED", "MIGRATED", "ENCRYPTED"],
        default: "UNENCRYPTED"
    },
}, modelOptions);


authSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");

    this.password = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        "sha512"
    ).toString("hex");
};

authSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        "sha512"
    ).toString("hex");

    return this.password === hash;
};

const authModel = mongoose.model("Auth", authSchema);

export default authModel;
