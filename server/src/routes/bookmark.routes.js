import { Router } from "express";
import { createBookmark, deleteBookmark, getAllBookmarks, getBookmark, updateBookmark, bulkUpdateBookmarks } from "../controllers/bookmark.controller.js";

const router = Router();

router.patch("/bulk-update", bulkUpdateBookmarks);

router
    .route("/")
    .get(getAllBookmarks)
    .post(createBookmark);

router
    .route("/:id")
    .get(getBookmark)
    .patch(updateBookmark)
    .delete(deleteBookmark);

export default router;