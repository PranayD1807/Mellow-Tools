import catchAsync from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import APIFeatures from "./../utils/apiFeatures.js";

export function deleteOne(Model, preFilter = {}) {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete({ _id: req.params.id, ...preFilter });

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
        const doc = await Model.findByIdAndUpdate(
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
    return catchAsync(async (req, res, next) => {
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

export function getAll(Model, preFilter = {}) {
    return catchAsync(async (req, res, next) => {
        const features = new APIFeatures(Model.find(preFilter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const doc = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: "success",
            results: doc.length,
            data: doc,
        });
    });
}