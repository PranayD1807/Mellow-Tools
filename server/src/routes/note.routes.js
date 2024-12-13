import { Router } from "express";
import { createNote, deleteNote, getAllNotes, getNote, updateNote } from "../controllers/note.controller.js";

const router = Router();

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