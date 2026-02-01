import jobApplicationModel from "../models/jobApplication.model.js";
import { createOne, getAll, getOne, updateOne, deleteOne } from "./handlerFactory.js";

export const createJobApplication = (req, res, next) => {
    req.body.user = req.user.id;
    return createOne(jobApplicationModel)(req, res, next);
};

export const getAllJobApplications = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getAll(jobApplicationModel, preFilter)(req, res, next);
};

export const getJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(jobApplicationModel, 'user', preFilter)(req, res, next);
};

export const updateJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return updateOne(jobApplicationModel, preFilter)(req, res, next);
};

export const deleteJobApplication = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(jobApplicationModel, preFilter)(req, res, next);
};
