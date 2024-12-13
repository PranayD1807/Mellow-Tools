import { createOne, updateOne, getAll, getOne, deleteOne } from "./handlerFactory.js";
import noteModel from "../models/note.model.js";

export const createNote = (req, res, next) => {
    req.body.user = req.user.id;
    return createOne(noteModel)(req, res, next);
};

export const updateNote = (req, res, next) => {
    const userFilter = { user: req.user.id };
    return updateOne(noteModel, userFilter)(req, res, next);
};

export const getAllNotes = (req, res, next) => {
    let preFilter = { user: req.user.id };
    const { query } = req.query;

    if (query) {
        preFilter = {
            ...preFilter,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { text: { $regex: query, $options: "i" } },
            ],
        }
    }

    return getAll(noteModel, preFilter)(req, res, next);
};

export const getNote = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(noteModel, null, preFilter)(req, res, next);
};

export const deleteNote = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(noteModel, preFilter)(req, res, next);
};
