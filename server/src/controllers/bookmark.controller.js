import { createOne, updateOne, getAll, getOne, deleteOne } from "./handlerFactory.js";
import bookmarkModel from "../models/bookmark.model.js";

export const createBookmark = (req, res, next) => {
    req.body.user = req.user.id;
    return createOne(bookmarkModel)(req, res, next);
};

export const updateBookmark = (req, res, next) => {
    const userFilter = { user: req.user.id };
    return updateOne(bookmarkModel, userFilter)(req, res, next);
};

export const getAllBookmarks = (req, res, next) => {
    let preFilter = { user: req.user.id };
    const { search } = req.query;

    if (search) {
        preFilter = {
            ...preFilter,
            label: { $regex: search, $options: "i" },
        };
        delete req.query.search;
    }

    return getAll(bookmarkModel, preFilter)(req, res, next);
};

export const getBookmark = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(bookmarkModel, null, preFilter)(req, res, next);
};

export const deleteBookmark = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(bookmarkModel, preFilter)(req, res, next);
};
