import { Router } from "express";
import {
    signup,
    signin,
    updatePassword,
    getInfo,
    refreshToken,
    generate2FA,
    verify2FA,
    validate2FA,
    disable2FA,
    migrateEncryption,
    updateEncryptionStatus
} from "../controllers/user.controller.js";
import { signinValidator, signupValidator, updatePasswordValidator } from "../validators/user.validator.js";
import { verifyJWT } from "../middlewares/token.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User Management
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - displayName
 *               - encryptedAESKey
 *               - passwordKeySalt
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *               encryptedAESKey:
 *                 type: string
 *               passwordKeySalt:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/signin", signinValidator, signin);
router.post("/signup", signupValidator, signup);
router.post("/update-password", verifyJWT, updatePasswordValidator, updatePassword);
/**
 * @swagger
 * /auth/get-info:
 *   post:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved
 *       401:
 *         description: Unauthorized
 */
router.post("/get-info", verifyJWT, getInfo);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       400:
 *         description: Invalid token
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /auth/migrate-encryption:
 *   post:
 *     summary: Migrate encryption keys
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - encryptedAESKey
 *               - passwordKeySalt
 *             properties:
 *               password:
 *                 type: string
 *               encryptedAESKey:
 *                 type: string
 *               passwordKeySalt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Encryption migrated
 *       400:
 *         description: Validation error
 */
router.post("/migrate-encryption", verifyJWT, migrateEncryption);

/**
 * @swagger
 * /auth/update-encryption-status:
 *   post:
 *     summary: Update encryption status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptionStatus
 *             properties:
 *               encryptionStatus:
 *                 type: string
 *                 enum: [UNENCRYPTED, MIGRATED, ENCRYPTED]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 */
router.post("/update-encryption-status", verifyJWT, updateEncryptionStatus);

// 2FA Routes

/**
 * @swagger
 * /auth/2fa/generate:
 *   post:
 *     summary: Generate 2FA secret and QR code
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QR code generated
 */
router.post("/2fa/generate", verifyJWT, generate2FA);

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     summary: Verify 2FA token to enable 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA enabled
 *       400:
 *         description: Invalid token
 */
router.post("/2fa/verify", verifyJWT, verify2FA);

/**
 * @swagger
 * /auth/2fa/validate:
 *   post:
 *     summary: Validate 2FA token for login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *             properties:
 *               userId:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validated
 *       400:
 *         description: Invalid token
 */
router.post("/2fa/validate", validate2FA);

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled
 */
router.post("/2fa/disable", verifyJWT, disable2FA);

export default router;