import jobApplicationModel from "../models/jobApplication.model.js";
import { createOne, getAll, getOne, updateOne, deleteOne, bulkUpdate } from "./handlerFactory.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const parseDateParam = (value, name, isEnd) => {
    if (typeof value !== "string" || value.trim() === "") {
        throw new AppError(`Invalid ${name}: expected an ISO date`, 400);
    }
    const raw = value.trim();
    // Date-only values are treated as whole UTC days (inclusive end-of-day for endDate)
    const date = new Date(DATE_ONLY.test(raw) ? `${raw}${isEnd ? "T23:59:59.999Z" : "T00:00:00.000Z"}` : raw);
    if (Number.isNaN(date.getTime())) {
        throw new AppError(`Invalid ${name}: expected an ISO date`, 400);
    }
    return date;
};

// Builds a Mongo `appliedOn` condition from startDate/endDate query params (or null if none given)
export const buildAppliedOnRange = (query) => {
    const { startDate, endDate } = query;
    const range = {};
    if (startDate !== undefined) range.$gte = parseDateParam(startDate, "startDate", false);
    if (endDate !== undefined) range.$lte = parseDateParam(endDate, "endDate", true);
    if (range.$gte && range.$lte && range.$gte > range.$lte) {
        throw new AppError("startDate must not be after endDate", 400);
    }
    return Object.keys(range).length ? range : null;
};

export const getJobApplicationStats = catchAsync(async (req, res, _next) => {
    const match = { user: new mongoose.Types.ObjectId(req.user.id) };
    const appliedOn = buildAppliedOnRange(req.query);
    if (appliedOn) match.appliedOn = appliedOn;

    const stats = await jobApplicationModel.aggregate([
        {
            $match: match
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
    try {
        const appliedOn = buildAppliedOnRange(req.query);
        if (appliedOn) preFilter.appliedOn = appliedOn;
    } catch (err) {
        return next(err);
    }
    delete req.query.startDate;
    delete req.query.endDate;
    const searchableFields = ['company', 'role', 'location', 'status', 'note', 'interviewStage'];
    return getAll(jobApplicationModel, preFilter, searchableFields)(req, res, next);
};

export const getJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(jobApplicationModel, 'user', preFilter)(req, res, next);
};

export const updateJobApplication = (req, res, next) => {
    const userFilter = { user: req.user.id };
    const allowedFields = ['company', 'role', 'location', 'status', 'jobLink', 'appliedOn', 'note', 'interviewStage', 'nextInterviewDate'];
    return updateOne(jobApplicationModel, userFilter, allowedFields)(req, res, next);
};

export const deleteJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(jobApplicationModel, preFilter)(req, res, next);
};

export const bulkUpdateJobApplications = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return bulkUpdate(jobApplicationModel, preFilter)(req, res, next);
};
