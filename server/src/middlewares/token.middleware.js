import jsonwebtoken from "jsonwebtoken";
import userModel from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const tokenDecode = (req) => {
    try {
        const bearerHeader = req.headers["authorization"];

        if (bearerHeader) {
            const token = bearerHeader.split(" ")[1];
            return jsonwebtoken.verify(
                token,
                process.env.TOKEN_SECRET
            );
        }

        return false;
    } catch {
        return false;
    }
};

export const verifyJWT = catchAsync(async (req, res, next) => {
    const tokenDecoded = tokenDecode(req);

    if (!tokenDecoded) throw new AppError("Unauthorized.", 401);
    const user = await userModel.findById(tokenDecoded.data);
    if (!user) throw new AppError("Unauthorized.", 401);
    req.user = user;
    next();
});

