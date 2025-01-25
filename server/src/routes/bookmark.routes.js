import { Router } from "express";
import { createBookmark, deleteBookmark, getAllBookmarks, getBookmark, updateBookmark } from "../controllers/bookmark.controller";

const router = Router();

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