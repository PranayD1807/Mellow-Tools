import express, { Router } from "express";
import {
    createNote,
    getAllNotes,
    getNote,
    updateNote,
    deleteNote,
    bulkUpdateNotes
} from "../controllers/note.controller.js";

const router = express.Router();

router.patch("/bulk-update", bulkUpdateNotes);

router
    .route("/")
    .get(getAllNotes)
    .post(createNote);

router
    .route("/:id")
    .get(getNote)
    .patch(updateNote)
    .delete(deleteNote);

export default router;