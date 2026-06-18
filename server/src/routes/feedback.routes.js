import express from "express";
import { createFeedback, getFeedbacks, uploadFeedbackImages } from "../controllers/feedback.controller.js";

import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedbacks
 *   description: User feedbacks management
 */

/**
 * @swagger
 * /feedbacks:
 *   post:
 *     summary: Submit a new feedback
 *     description: Create a new feedback from authenticated user with up to 2 optional images.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Feedback successfully submitted.
 *       400:
 *         description: Invalid inputs or file limits exceeded.
 */
router.post("/", uploadFeedbackImages, createFeedback);

/**
 * @swagger
 * /feedbacks:
 *   get:
 *     summary: Retrieve all feedbacks (Admin only)
 *     description: Returns a list of all user feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of feedbacks.
 *       403:
 *         description: Forbidden. Admin access required.
 */
router.get("/", verifyAdmin, getFeedbacks);

export default router;
