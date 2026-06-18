import mongoose from "mongoose";
import modelOptions from "./model.options.js";

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    images: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 2;
            },
            message: "A maximum of 2 images are allowed per feedback."
        }
    }
}, modelOptions);

const feedbackModel = mongoose.model("Feedback", feedbackSchema);

export default feedbackModel;
