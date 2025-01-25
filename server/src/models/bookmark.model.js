import mongoose, { Schema } from "mongoose";
import modelOptions from "./model.options.js";

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    label: {
        type: String,
        required: true,
    },
    note: {
        type: String,
    },
    url: {
        type: String,
        required: true,
    },
    logoUrl: {
        type: String,
        default: "https://i.ibb.co/xhcQL9Y/website.png"
    },
}, {
    ...modelOptions,
});

const bookmarkModel = mongoose.model("Bookmark", bookmarkSchema);
export default bookmarkModel;
