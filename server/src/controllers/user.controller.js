
import userModel from "../models/user.model.js";
import authModel from "../models/auth.model.js";
import jsonwebtoken from "jsonwebtoken";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import otplib from 'otplib';
const { authenticator } = otplib;
import QRCode from 'qrcode';

const generateTokens = (userId) => {
    const token = jsonwebtoken.sign(
        { data: userId },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h" }
    );

    const refreshToken = jsonwebtoken.sign(
        { data: userId },
        process.env.TOKEN_SECRET,
        { expiresIn: "7d" }
    );
    return { token, refreshToken };
};

export const signup = catchAsync(async (req, res) => {
    const { email, password, displayName } = req.body;

    const user = new userModel({ displayName, email });
    await user.save();

    const auth = new authModel({ user: user.id });
    auth.setPassword(password);
    auth.encryptedAESKey = encryptedAESKey;
    auth.passwordKeySalt = passwordKeySalt;
    await auth.save();

    const { token, refreshToken } = generateTokens(user.id);

    res.status(201).json({
        status: "success",
        data: user,
        token: token,
        refreshToken: refreshToken,
        message: "Signed-up successfully.",
    });
});

export const signin = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new AppError("User not exist", 400);

    const auth = await authModel.findOne({ user: user.id }).select("+password +salt +twoFactorSecret +isTwoFactorEnabled +encryptedAESKey +passwordKeySalt");

    if (!auth) throw new AppError("Authentication record missing. Contact support.", 500);

    if (!auth.validPassword(password)) throw new AppError("Wrong password", 400);

    if (auth.isTwoFactorEnabled) {
        return res.status(200).json({
            status: "2fa_required",
            userId: user.id,
            message: "Two-factor authentication required"
        });
    }

    const { token, refreshToken } = generateTokens(user.id);
    user.passwordKeySalt = auth.passwordKeySalt;
    user.encryptedAESKey = auth.encryptedAESKey;

    res.status(200).json({
        status: "success",
        data: user,
        message: "Signed-in successfully.",
        token: token,
        refreshToken: refreshToken,
    });
});

export const updatePassword = catchAsync(async (req, res) => {
    const { password, newPassword } = req.body;

    const auth = await authModel.findOne({ user: req.user.id }).select("+password +salt");
    if (!auth) throw new AppError("Unauthorized", 401);

    if (!auth.validPassword(password)) throw new AppError("Wrong password", 400);

    auth.setPassword(newPassword);
    await auth.save();

    res.status(200).json({
        status: "success",
        message: "Password updated successfully.",
    });
});

export const getInfo = catchAsync(async (req, res) => {
    const user = await userModel.findById(req.user.id);
    if (!user) throw new AppError("User not found", 404);

    const auth = await authModel.findOne({ user: req.user.id });
    const userData = user.getCleanData();
    userData.isTwoFactorEnabled = auth ? auth.isTwoFactorEnabled : false;

    res.status(200).json({
        status: "success",
        data: userData
    });
});

export const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("Refresh token required", 400);

    const decoded = jsonwebtoken.verify(refreshToken, process.env.TOKEN_SECRET);
    const user = await userModel.findById(decoded.data);
    if (!user) throw new AppError("User not found", 404);

    const { token: newToken } = generateTokens(user.id);

    res.status(200).json({
        status: "success",
        token: newToken,
        message: "Token refreshed successfully.",
    });
});

// 2FA Endpoints

export const generate2FA = catchAsync(async (req, res) => {
    const secret = authenticator.generateSecret();
    const auth = await authModel.findOne({ user: req.user.id });
    if (!auth) throw new AppError("User not found", 404);

    auth.twoFactorSecret = secret;
    await auth.save();

    const otpauth = authenticator.keyuri(req.user.email, "MellowTools", secret);
    const imageUrl = await QRCode.toDataURL(otpauth);

    res.status(200).json({
        status: "success",
        data: {
            secret,
            qrCode: imageUrl
        }
    });
});

export const verify2FA = catchAsync(async (req, res) => {
    const { token } = req.body;
    const auth = await authModel.findOne({ user: req.user.id }).select("+twoFactorSecret");
    if (!auth) throw new AppError("User not found", 404);

    const isValid = authenticator.check(token, auth.twoFactorSecret);
    if (!isValid) throw new AppError("Invalid verification code", 400);

    auth.isTwoFactorEnabled = true;
    await auth.save();

    res.status(200).json({
        status: "success",
        message: "Two-factor authentication enabled successfully."
    });
});

export const validate2FA = catchAsync(async (req, res) => {
    const { userId, token } = req.body;

    const user = await userModel.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const auth = await authModel.findOne({ user: userId }).select("+twoFactorSecret +isTwoFactorEnabled");
    if (!auth || !auth.isTwoFactorEnabled) throw new AppError("2FA not enabled", 400);

    const isValid = authenticator.check(token, auth.twoFactorSecret);
    if (!isValid) throw new AppError("Invalid code", 400);

    const tokens = generateTokens(userId);

    res.status(200).json({
        status: "success",
        data: user,
        message: "Signed-in successfully.",
        token: tokens.token,
        refreshToken: tokens.refreshToken
    });
});

export const disable2FA = catchAsync(async (req, res) => {
    const auth = await authModel.findOne({ user: req.user.id });
    if (!auth) throw new AppError("User not found", 404);

    auth.isTwoFactorEnabled = false;
    auth.twoFactorSecret = undefined;
    await auth.save();

    res.status(200).json({
        status: "success",
        message: "Two-factor authentication disabled."
    });
});
