import AppError from "../utils/appError.js";

export const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

export const handleDuplicateFieldsDB = (err) => {
    const value = (err.message.match(/(["'])(\\?.)*?\1/) ?? ["unknown"])[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

export const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);

    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400);
};

export const handleJWTError = () =>
    new AppError("Invalid token. Please log in again!", 401);

export const handleJWTExpiredError = () =>
    new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    console.error("ERROR 💥", err);
    return res.status(err.statusCode).json({
        title: "Something went wrong!",
        msg: err.message,
    });
};

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith("/api")) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        console.error("ERROR 💥", err);
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            title: "Something went wrong!",
            msg: err.message,
        });
    }
    console.error("ERROR 💥", err);
    return res.status(err.statusCode).json({
        title: "Something went wrong!",
        msg: "Please try again later.",
    });
};

const globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.name = err.name || error.name; // Ensure name is preserved
    error.code = err.code || error.code; // Ensure code is preserved

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    if (process.env.NODE_ENV === "DEV" || process.env.NODE_ENV === "test") {
        sendErrorDev(error, req, res);
    } else if (process.env.NODE_ENV === "PROD") {
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);

        sendErrorProd(error, req, res);
    } else {
        // Fallback for any other environment
        sendErrorDev(error, req, res);
    }
};

export default globalErrorHandler;