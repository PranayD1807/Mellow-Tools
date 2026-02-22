import AppError from "../utils/appError.js";

export const verifyAdmin = (req, res, next) => {
    const adminSecret = req.headers["x-admin-secret"];
    // Using a fallback for local testing, but expect it in env in prod
    const expectedSecret = process.env.ADMIN_SECRET || "default_admin_secret_123";
    
    if (!adminSecret || adminSecret !== expectedSecret) {
        return next(new AppError("Admin access denied.", 403));
    }
    
    next();
};
