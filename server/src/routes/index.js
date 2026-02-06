import express from "express";
const router = express.Router();
import AppError from "../utils/appError.js";
import { verifyJWT } from "../middlewares/token.middleware.js"
import catchAsync from "../utils/catchAsync.js";

import textTemplateRoutes from "./textTemplate.routes.js";
import authRoutes from "./auth.routes.js";
import noteRoutes from "./note.routes.js"
import bookmarkRoutes from "./bookmark.routes.js"
import jobApplicationRoutes from "./jobApplication.routes.js"

router.use("/auth", authRoutes);
router.use("/text-templates", verifyJWT, textTemplateRoutes);
router.use("/notes", verifyJWT, noteRoutes);
router.use("/bookmarks", verifyJWT, bookmarkRoutes);
router.use("/job-applications", verifyJWT, jobApplicationRoutes);

export default router;