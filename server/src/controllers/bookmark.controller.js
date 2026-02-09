import { createOne, updateOne, getAll, getOne, deleteOne, bulkUpdate } from "./handlerFactory.js";
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
    const preFilter = { user: req.user.id };
    const searchableFields = ['label', 'url', 'note'];
    return getAll(bookmarkModel, preFilter, searchableFields)(req, res, next);
};

export const getBookmark = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return getOne(bookmarkModel, null, preFilter)(req, res, next);
};

export const deleteBookmark = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return deleteOne(bookmarkModel, preFilter)(req, res, next);
};

export const bulkUpdateBookmarks = (req, res, next) => {
    const preFilter = { user: req.user.id };
    return bulkUpdate(bookmarkModel, preFilter)(req, res, next);
};
