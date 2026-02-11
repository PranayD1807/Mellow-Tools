import { Router } from "express";
import { createBookmark, deleteBookmark, getAllBookmarks, getBookmark, updateBookmark, bulkUpdateBookmarks } from "../controllers/bookmark.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: Bookmark Management
 */

/**
 * @swagger
 * /bookmarks/bulk-update:
 *   patch:
 *     summary: Bulk update multiple bookmarks
 *     tags: [Bookmarks]
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
router.patch("/bulk-update", bulkUpdateBookmarks);

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get all bookmarks
 *     tags: [Bookmarks]
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
 *         description: List of bookmarks
 *   post:
 *     summary: Create a new bookmark
 *     tags: [Bookmarks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - url
 *             properties:
 *               label:
 *                 type: string
 *               url:
 *                 type: string
 *               note:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bookmark created
 */
router
    .route("/")
    .get(getAllBookmarks)
    .post(createBookmark);

/**
 * @swagger
 * /bookmarks/{id}:
 *   get:
 *     summary: Get a bookmark by ID
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark details
 *       404:
 *         description: Bookmark not found
 *   patch:
 *     summary: Update a bookmark
 *     tags: [Bookmarks]
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
 *               label:
 *                 type: string
 *               url:
 *                 type: string
 *               note:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark updated
 *   delete:
 *     summary: Delete a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Bookmark deleted
 */
router
    .route("/:id")
    .get(getBookmark)
    .patch(updateBookmark)
    .delete(deleteBookmark);

export default router;