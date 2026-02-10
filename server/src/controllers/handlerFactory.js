import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import APIFeatures from "./../utils/apiFeatures.js";

export function deleteOne(Model, preFilter = {}) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findOneAndDelete({ _id: req.params.id, ...preFilter });

        if (!doc) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(204).json({
            status: "success",
            data: null,
        });
    });
}

export function updateOne(Model, preFilter = {}) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findOneAndUpdate(
            { _id: req.params.id, ...preFilter },
            req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: doc,
        });
    });
}

export function createOne(Model) {
    return catchAsync(async (req, res, _next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: "success",
            data: doc,
        });
    });
}

export function getOne(Model, popOptions, preFilter = {}) {
    return catchAsync(async (req, res, next) => {
        let query = Model.findOne({ _id: req.params.id, ...preFilter });
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError("No document found with that ID", 404));
        }

        res.status(200).json({
            status: "success",
            data: doc,
        });
    });
}

export function getAll(Model, preFilter = {}, searchableFields = []) {
    return catchAsync(async (req, res, _next) => {
        const features = new APIFeatures(Model.find(preFilter), req.query)
            .search(searchableFields)
            .filter()
            .sort()
            .limitFields();

        // Get total count for pagination
        const totalResults = await Model.countDocuments(features.query.getFilter());

        features.paginate();
        const doc = await features.query;

        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const totalPages = Math.ceil(totalResults / limit);

        res.status(200).json({
            status: "success",
            totalResults,
            totalPages,
            page,
            results: doc.length,
            data: doc,
        });
    });
}

export function bulkUpdate(Model, preFilter = {}) {
    return catchAsync(async (req, res, next) => {
        const { updates } = req.body; // Array of { id: string, data: object }

        if (!updates || !Array.isArray(updates)) {
            return next(new AppError("Updates must be an array of { id, data } objects", 400));
        }

        const bulkOps = updates.map((update) => ({
            updateOne: {
                filter: { _id: update.id, ...preFilter },
                update: { $set: update.data },
            },
        }));

        const result = await Model.bulkWrite(bulkOps);

        res.status(200).json({
            status: "success",
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
            },
        });
    });
}