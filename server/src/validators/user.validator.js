import { body, validationResult } from "express-validator";
import userModel from "../models/user.model.js";

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
        });
    }
    next();
};

const passwordComplexity = (fieldName) => [
    body(fieldName)
        .isLength({ min: 8 }).withMessage(`${fieldName} minimum 8 characters`)
        .matches(/[a-z]/).withMessage(`${fieldName} must contain at least one lowercase letter`)
        .matches(/[A-Z]/).withMessage(`${fieldName} must contain at least one uppercase letter`)
        .matches(/[0-9]/).withMessage(`${fieldName} must contain at least one number`)
        .matches(/[@$!%*?&]/).withMessage(`${fieldName} must contain at least one special character (e.g., @$!%*?&)`),
];

const passwordValidation = [
    body("password").exists().withMessage("password is required"),
    ...passwordComplexity("password")
];

const confirmPasswordValidation = (passwordField, confirmField = "confirmPassword") => [
    body(confirmField)
        .exists().withMessage(`${confirmField} is required`)
        .custom((value, { req }) => {
            if (value !== req.body[passwordField])
                throw new Error(`${confirmField} does not match ${passwordField}`);
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
        .isLength({ min: 4 })
        .withMessage("username must be minimum 8 characters"),
    body("passwordKeySalt").exists().isString().withMessage("Something went wrong"),
    body("encryptedAESKey").exists().isString().withMessage("Something went wrong"),
    handleValidationErrors,
];

export const signinValidator = [
    body("email")
        .exists().withMessage("email is required")
        .isEmail().withMessage("invalid email format"),
    body("password").exists().withMessage("password is required"),
    handleValidationErrors,
];

export const updatePasswordValidator = [
    body("password").exists().withMessage("password is required"),
    body("newPassword").exists().withMessage("newPassword is required"),
    ...passwordComplexity("newPassword"),
    ...confirmPasswordValidation("newPassword", "confirmNewPassword"),
    handleValidationErrors,
];
