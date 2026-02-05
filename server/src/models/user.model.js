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
    }
}, modelOptions);

userSchema.methods.getCleanData = function () {
    const user = this.toObject();
    return user;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
