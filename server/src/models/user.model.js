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
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['mellow@example.com'];
    return adminEmails.includes(this.email);
});

userSchema.methods.getCleanData = function () {
    const user = this.toObject();
    return user;
};

const userModel = mongoose.model("User", userSchema);

export default userModel;
