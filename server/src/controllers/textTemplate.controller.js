import { createOne, updateOne, getAll, getOne, deleteOne } from "./handlerFactory.js";
import textTemplateModel from "../models/textTemplate.model.js";

export const createTextTemplate = (req, res, next) => {
    req.body.user = req.user.id;
    return createOne(textTemplateModel)(req, res, next);
};

export const updateTextTemplate = (req, res, next) => {
    const userFilter = { user: req.user.id };
    return updateOne(textTemplateModel, userFilter)(req, res, next);
};

export const getAllTextTemplates = (req, res, next) => {
    let preFilter = { user: req.user.id };
    const { query } = req.query;

    if (query) {
        preFilter = {
            ...preFilter,
            title: { $regex: query, $options: "i" },
        }
    }

    return getAll(textTemplateModel, preFilter)(req, res, next);
};

export const getTextTemplate = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(textTemplateModel, null, preFilter)(req, res, next);
};

export const deleteTextTemplate = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(textTemplateModel, preFilter)(req, res, next);
};
