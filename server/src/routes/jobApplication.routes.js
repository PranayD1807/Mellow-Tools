import express from "express";
import {
    createJobApplication,
    getAllJobApplications,
    getJobApplication,
    updateJobApplication,
    deleteJobApplication,
    getJobApplicationStats
} from "../controllers/jobApplication.controller.js";

const router = express.Router();

router.get("/stats", getJobApplicationStats);

router.post("/", createJobApplication);

router.get("/", getAllJobApplications);

router.get("/:id", getJobApplication);

router.patch("/:id", updateJobApplication);

router.delete("/:id", deleteJobApplication);

export default router;
