import mongoose from "mongoose";
import modelOptions from "./model.options.js";

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

userSchema.virtual('isAdmin').get(function () {
    if (!this.email) return false;
    const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
        : ['mellow@example.com'];
    return adminEmails.includes(this.email.toLowerCase());
});

userSchema.methods.getCleanData = function () {
    const user = this.toObject();
    return user;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
