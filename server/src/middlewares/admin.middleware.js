import AppError from "../utils/appError.js";

export const verifyAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return next(new AppError("Admin access denied.", 403));
    }
    next();
};
