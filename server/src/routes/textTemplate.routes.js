import { Router } from "express";
import { createTextTemplate, deleteTextTemplate, getAllTextTemplates, getTextTemplate, updateTextTemplate, bulkUpdateTextTemplates } from "../controllers/textTemplate.controller.js";

const router = Router();

router.patch("/bulk-update", bulkUpdateTextTemplates);

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