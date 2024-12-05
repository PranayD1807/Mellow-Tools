import mongoose, { Schema } from "mongoose";
import modelOptions from "./model.options.js";

const contactSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contactName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
}, {
    ...modelOptions,
    validate: {
        validator: function (doc) {
            return doc.mobileNumber || doc.email;
        },
        message: "At least one of 'mobileNumber' or 'email' must be provided."
    }
});

const contactModel = mongoose.model("Contact", contactSchema);
export default contactModel;
