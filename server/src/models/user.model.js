import mongoose from "mongoose";
import modelOptions from "./model.options.js";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
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
    // Salt value used for deriving passwordDerivedKey.
    passwordKeySalt: {
        type: String,
        required: true,
    },
    // Encrypted AES Key for E2E Encryption
    encryptedAESKey: {
        type: String,
        required: true,
    },
    encryptionStatus: {
        type: String,
        enum: ["UNENCRYPTED", "MIGRATED", "ENCRYPTED"],
        default: "UNENCRYPTED"
    }

}, modelOptions);

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");

    this.password = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        "sha512"
    ).toString("hex");
};

userSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        "sha512"
    ).toString("hex");

    return this.password === hash;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
