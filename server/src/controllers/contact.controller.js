import { createOne, updateOne, getAll, getOne, deleteOne } from "./handlerFactory.js";
import contactModel from "../models/contact.model.js";
import AppError from "../utils/appError.js";

export const createContact = (req, res, next) => {
    req.body.user = req.user.id;
    return createOne(contactModel)(req, res, next);
};

export const updateContact = (req, res, next) => {
    const userFilter = { user: req.user.id };
    return updateOne(contactModel, userFilter)(req, res, next);
};

export const getAllContacts = (req, res, next) => {
    let preFilter = { user: req.user.id };
    const { query } = req.query;

    if (query) {
        preFilter = {
            ...preFilter,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phoneNumber: { $regex: query, $options: "i" } },
            ],
        }
    }

    return getAll(contactModel, preFilter)(req, res, next);
};

export const getContact = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(contactModel, null, preFilter)(req, res, next);
};

export const deleteContact = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(contactModel, preFilter)(req, res, next);
};
