import mongoose, { Schema } from "mongoose";
import modelOptions from "./model.options.js";

const noteSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        requried: true,
    },
    text: {
        type: String,
        required: true,
    },
}, {
    ...modelOptions,
});

const noteModel = mongoose.model("Note", noteSchema);
export default noteModel;
