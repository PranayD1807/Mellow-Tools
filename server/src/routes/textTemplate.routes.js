import { Router } from "express";
import { createTextTemplate, deleteTextTemplate, getAllTextTemplates, getTextTemplate, updateTextTemplate } from "../controllers/textTemplate.controller.js";

const router = Router();

router
    .route("/")
    .get(getAllTextTemplates)
    .post(createTextTemplate);

router
    .route("/:id")
    .get(getTextTemplate)
    .patch(updateTextTemplate)
    .delete(deleteTextTemplate);

export default router;