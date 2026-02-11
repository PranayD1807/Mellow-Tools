import { Router } from "express";
import { createTextTemplate, deleteTextTemplate, getAllTextTemplates, getTextTemplate, updateTextTemplate, bulkUpdateTextTemplates } from "../controllers/textTemplate.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TextTemplates
 *   description: Text Template Management
 */

/**
 * @swagger
 * /text-templates/bulk-update:
 *   patch:
 *     summary: Bulk update multiple text templates
 *     tags: [TextTemplates]
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
router.patch("/bulk-update", bulkUpdateTextTemplates);

/**
 * @swagger
 * /text-templates:
 *   get:
 *     summary: Get all text templates
 *     tags: [TextTemplates]
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
 *         description: List of text templates
 *   post:
 *     summary: Create a new text template
 *     tags: [TextTemplates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               placeholders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tag:
 *                       type: string
 *                     defaultValue:
 *                       type: string
 *     responses:
 *       201:
 *         description: Template created
 */
router
    .route("/")
    .get(getAllTextTemplates)
    .post(createTextTemplate);

/**
 * @swagger
 * /text-templates/{id}:
 *   get:
 *     summary: Get a text template by ID
 *     tags: [TextTemplates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template details
 *       404:
 *         description: Template not found
 *   patch:
 *     summary: Update a text template
 *     tags: [TextTemplates]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               placeholders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tag:
 *                       type: string
 *                     defaultValue:
 *                       type: string
 *     responses:
 *       200:
 *         description: Template updated
 *   delete:
 *     summary: Delete a text template
 *     tags: [TextTemplates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Template deleted
 */
router
    .route("/:id")
    .get(getTextTemplate)
    .patch(updateTextTemplate)
    .delete(deleteTextTemplate);

export default router;