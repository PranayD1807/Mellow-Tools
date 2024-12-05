import { Router } from "express";
import { getContact, deleteContact, getAllContacts, updateContact, createContact } from "../controllers/contact.controller.js";

const router = Router();

router
    .route("/")
    .get(getAllContacts)
    .post(createContact);

router
    .route("/:id")
    .get(getContact)
    .patch(updateContact)
    .delete(deleteContact);

export default router;