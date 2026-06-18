import jsonwebtoken from "jsonwebtoken";
import userModel from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const verifyJWT = catchAsync(async (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) throw new AppError("Unauthorized.", 401);

    const token = bearerHeader.split(" ")[1];
    // This will throw and bubble up to globalErrorHandler if token is invalid/expired
    const tokenDecoded = jsonwebtoken.verify(
        token,
        process.env.TOKEN_SECRET
    );

    const user = await userModel.findById(tokenDecoded.data);
    if (!user) throw new AppError("Unauthorized.", 401);

    // Throttled update of lastActiveAt to avoid excessive DB writes.
    // Use user.isInit('lastActiveAt') to check if the field is physically initialized from the DB document.
    // Add hasIsInit check to prevent crashes on mocked user objects in unit tests.
    const now = new Date();
    const hasIsInit = typeof user.isInit === 'function';
    if (!hasIsInit || !user.isInit('lastActiveAt') || (now - new Date(user.lastActiveAt)) > 5 * 60 * 1000) {
        if (hasIsInit) {
            await userModel.updateOne({ _id: user._id }, { $set: { lastActiveAt: now } });
            user.lastActiveAt = now;
        }
    }

    req.user = user;
    next();
});

