import { body, validationResult } from "express-validator";
import userModel from "../models/user.model.js";

// Custom middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
        });
    }
    next();
};

// Reusable password validation function
const passwordValidation = [
    body("password")
        .exists().withMessage("password is required")
        .isLength({ min: 8 }).withMessage("password minimum 8 characters")
        .matches(/[a-z]/).withMessage("password must contain at least one lowercase letter")
        .matches(/[A-Z]/).withMessage("password must contain at least one uppercase letter")
        .matches(/[0-9]/).withMessage("password must contain at least one number")
        .matches(/[@$!%*?&]/).withMessage("password must contain at least one special character (e.g., @$!%*?&)"),
];

// Reusable confirm password validation function
const confirmPasswordValidation = (passwordField) => [
    body("confirmPassword")
        .exists().withMessage("confirmPassword is required")
        .isLength({ min: 8 }).withMessage("confirmPassword minimum 8 characters")
        .matches(/[a-z]/).withMessage("confirmPassword must contain at least one lowercase letter")
        .matches(/[A-Z]/).withMessage("confirmPassword must contain at least one uppercase letter")
        .matches(/[0-9]/).withMessage("confirmPassword must contain at least one number")
        .matches(/[@$!%*?&]/).withMessage("confirmPassword must contain at least one special character (e.g., @$!%*?&)")
        .custom((value, { req }) => {
            if (value !== req.body[passwordField])
                throw new Error("confirmPassword does not match password");
            return true;
        }),
];

export const signupValidator = [
    body("email")
        .exists().withMessage("email is required")
        .isEmail().withMessage("invalid email format")
        .custom(async (value) => {
            const user = await userModel.findOne({ email: value });
            if (user) return Promise.reject("email already used");
        }),
    ...passwordValidation,
    ...confirmPasswordValidation("password"),
    body("displayName")
        .exists().withMessage("username is required")
        .isLength({ min: 8 })
        .withMessage("username must be minimum 8 characters"),
    handleValidationErrors,
];

export const signinValidator = [
    body("email")
        .exists().withMessage("email is required")
        .isEmail().withMessage("invalid email format"),
    ...passwordValidation,
    handleValidationErrors,
];

export const updatePasswordValidator = [
    ...passwordValidation,
    ...confirmPasswordValidation("newPassword"),
    body("newPassword")
        .exists().withMessage("newPassword is required")
        .isLength({ min: 8 })
        .withMessage("newPassword minimum 8 characters"),
    handleValidationErrors,
];
