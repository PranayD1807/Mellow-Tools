import mongoose from "mongoose";
import modelOptions from "./model.options.js";

const jobApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Applied", "Interviewing", "Offer", "Rejected"],
        default: "Applied"
    },
    jobLink: {
        type: String
    },
    appliedOn: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String
    },
    interviewStage: {
        type: String,
        default: "Shortlisted"
    },
    nextInterviewDate: {
        type: Date
    }
}, modelOptions);

const jobApplicationModel = mongoose.model("JobApplication", jobApplicationSchema);

export default jobApplicationModel;
