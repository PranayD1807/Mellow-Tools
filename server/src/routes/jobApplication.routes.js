import express from "express";
import {
    createJobApplication,
    getAllJobApplications,
    getJobApplication,
    updateJobApplication,
    deleteJobApplication,
    getJobApplicationStats,
    bulkUpdateJobApplications
} from "../controllers/jobApplication.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: JobApplications
 *   description: Job Application Management
 */

/**
 * @swagger
 * /job-applications/bulk-update:
 *   patch:
 *     summary: Bulk update multiple job applications
 *     tags: [JobApplications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     data:
 *                       type: object
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Bad Request
 */
router.patch("/bulk-update", bulkUpdateJobApplications);

/**
 * @swagger
 * /job-applications/stats:
 *   get:
 *     summary: Get job application statistics
 *     tags: [JobApplications]
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
router.get("/stats", getJobApplicationStats);

/**
 * @swagger
 * /job-applications:
 *   post:
 *     summary: Create a new job application
 *     tags: [JobApplications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company
 *               - role
 *               - location
 *             properties:
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *               jobLink:
 *                 type: string
 *               note:
 *                 type: string
 *               interviewStage:
 *                 type: string
 *               nextInterviewDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job application created
 *   get:
 *     summary: Get all job applications
 *     tags: [JobApplications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of job applications
 */
router.post("/", createJobApplication);

router.get("/", getAllJobApplications);

/**
 * @swagger
 * /job-applications/{id}:
 *   get:
 *     summary: Get a job application by ID
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job Application ID
 *     responses:
 *       200:
 *         description: Job application details
 *       404:
 *         description: Job application not found
 *   patch:
 *     summary: Update a job application
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               role:
 *                 type: string
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *               jobLink:
 *                 type: string
 *               note:
 *                 type: string
 *               interviewStage:
 *                 type: string
 *               nextInterviewDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Job application updated
 *   delete:
 *     summary: Delete a job application
 *     tags: [JobApplications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Job application deleted
 */
router.get("/:id", getJobApplication);

router.patch("/:id", updateJobApplication);

router.delete("/:id", deleteJobApplication);

export default router;
