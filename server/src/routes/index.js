import express from "express";
const router = express.Router();
import AppError from "../utils/appError.js";
import { verifyJWT } from "../middlewares/token.middleware.js"
import catchAsync from "../utils/catchAsync.js";

// routers
import textTemplateRoutes from "./textTemplate.routes.js";
import authRoutes from "./auth.routes.js";
import noteRoutes from "./note.routes.js"

router.use("/auth", authRoutes);
router.use("/text-templates", verifyJWT, textTemplateRoutes);
router.use("/notes", verifyJWT, noteRoutes);

// All routes
router.all("*", catchAsync((req, res, next) => {
    console.log(`Can't find ${req.originalUrl}`);
    throw (new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // anything you pass into next will be assumed to be an error
}));

export default router;