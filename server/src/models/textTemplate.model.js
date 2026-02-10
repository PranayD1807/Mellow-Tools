import mongoose, { Schema } from "mongoose";
import modelOptions from "./model.options.js";

const textTemplateSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    placeholders: [
        {
            tag: { type: String, required: true },
            defaultValue: { type: String },
        }
    ],
}, {
    ...modelOptions,
    toJSON: {
        virtuals: true, versionKey: false, transform: (_, ret) => {
            if (ret.placeholders) {
                ret.placeholders.forEach(placeholder => {
                    delete placeholder._id; 
                    delete placeholder.id; 
                });
            }
            return ret;
        }
    }
});

const textTemplateModel = mongoose.model("TextTemplate", textTemplateSchema);
export default textTemplateModel;
