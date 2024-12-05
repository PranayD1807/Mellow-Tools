import express from "express";
const router = express.Router();
import AppError from "../utils/appError.js";
import { verifyJWT } from "../middlewares/token.middleware.js"

// routers
import contactRoutes from "./contact.routes.js";
import authRoutes from "./auth.routes.js";
import catchAsync from "../utils/catchAsync.js";

router.use("/auth", authRoutes);
router.use("/contacts", verifyJWT, contactRoutes)

// All routes
router.all("*", catchAsync((req, res, next) => {
    console.log(`Can't find ${req.originalUrl}`);
    throw (new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // anything you pass into next will be assumed to be an error
}));

export default router;