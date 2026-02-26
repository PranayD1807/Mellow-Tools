import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { verifyJWT } from "../middlewares/token.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator metrics and platform controls
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Retrieve lifetime platform statistics
 *     description: Returns deep analytics and metrics mapping. Requires an admin JWT.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics returned successfully
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Admin access denied.
 */
router.get("/stats", verifyJWT, verifyAdmin, getAdminStats);

export default router;
