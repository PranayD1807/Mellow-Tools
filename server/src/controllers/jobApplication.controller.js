import jobApplicationModel from "../models/jobApplication.model.js";
import { createOne, getAll, getOne, updateOne, deleteOne, bulkUpdate } from "./handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";
import mongoose from "mongoose";

export const getJobApplicationStats = catchAsync(async (req, res, _next) => {
    const stats = await jobApplicationModel.aggregate([
        {
            $match: { user: new mongoose.Types.ObjectId(req.user.id) }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    // Format stats into a cleaner object
    const formattedStats = {
        total: 0,
        Applied: 0,
        Interviewing: 0,
        Offer: 0,
        Rejected: 0
    };

    stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
    });

    res.status(200).json({
        status: "success",
        data: formattedStats
    });
});

export const createJobApplication = (req, res, next) => {
    req.body.user = req.user.id;
    return createOne(jobApplicationModel)(req, res, next);
};

export const getAllJobApplications = (req, res, next) => {
    const preFilter = { user: req.user.id };
    const searchableFields = ['company', 'role', 'location', 'status', 'note', 'interviewStage'];
    return getAll(jobApplicationModel, preFilter, searchableFields)(req, res, next);
};

export const getJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(jobApplicationModel, 'user', preFilter)(req, res, next);
};

export const updateJobApplication = (req, res, next) => {
    const userFilter = { user: req.user.id };
    return updateOne(jobApplicationModel, userFilter)(req, res, next);
};

export const deleteJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(jobApplicationModel, preFilter)(req, res, next);
};

export const bulkUpdateJobApplications = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return bulkUpdate(jobApplicationModel, preFilter)(req, res, next);
};
