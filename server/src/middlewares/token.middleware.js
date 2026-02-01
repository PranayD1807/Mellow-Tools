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
    req.user = user;
    next();
});

