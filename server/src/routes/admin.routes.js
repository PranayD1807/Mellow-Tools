import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

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
 *     description: Returns deep analytics and metrics mapping. Requires a valid admin secret header for authorization.
 *     tags: [Admin]
 *     parameters:
 *       - in: header
 *         name: x-admin-secret
 *         required: true
 *         schema:
 *           type: string
 *         description: Master admin secret key for panel authentication
 *     responses:
 *       200:
 *         description: Dashboard statistics returned successfully
 *       401:
 *         description: Invalid Admin Secret! Access Denied.
 */
router.get("/stats", verifyAdmin, getAdminStats);

export default router;
