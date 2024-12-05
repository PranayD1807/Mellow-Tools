
import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const signup = catchAsync(async (req, res) => {

    const { email, password, displayName } = req.body;
    const checkUser = await userModel.findOne({ email });
    if (checkUser) throw new AppError("email already used", 400);

    const user = new userModel();

    user.displayName = displayName;
    user.email = email;
    user.setPassword(password);

    await user.save();

    const token = jsonwebtoken.sign(
        { data: user.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h" }
    );

    user.password = undefined;
    user.salt = undefined;
    
    res.status(201).json({
        status: "success",
        data: user,
        token: token,
        message: "Signed-up successfully.",
    });
});

export const signin = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel
        .findOne({ email })
        .select("username password salt id displayName email createdAt updatedAt");

    if (!user) throw new AppError("User not exist", 400);

    if (!user.validPassword(password)) throw new AppError("Wrong password", 400);

    const token = jsonwebtoken.sign(
        { data: user.id },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h" }
    );

    user.password = undefined;
    user.salt = undefined;

    res.status(200).json({
        status: "success",
        data: user,
        message: "Signed-in successfully.",
        token: token,
    });
});

export const updatePassword = catchAsync(async (req, res) => {

    const { password, newPassword } = req.body;

    const user = await userModel
        .findById(req.user.id)
        .select("password id salt");

    if (!user) throw new AppError("Unauthorized", 401);

    if (!user.validPassword(password)) throw new AppError("Wrong password", 400);

    user.setPassword(newPassword);

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password updated successfully.",
    });

});

export const getInfo = catchAsync(async (req, res) => {
    const user = await userModel.findById(req.user.id);

    if (!user) throw new AppError("User not found", 404);

    res.status(200).json({
        status: "success",
        data: user.getCleanData()
    });

});

