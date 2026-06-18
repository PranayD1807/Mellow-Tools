import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import feedbackModel from "../models/feedback.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mellowtools_feedbacks",
        allowed_formats: ["jpg", "png", "jpeg"]
    }
});

// Multer upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per image
        files: 2 // Max 2 files
    }
});

// Intercept storage._handleFile to keep track of uploaded files in req for cleanup in case subsequent uploads fail
const originalHandleFile = storage._handleFile;
storage._handleFile = function (req, file, cb) {
    originalHandleFile.call(this, req, file, (err, info) => {
        if (err) return cb(err);
        if (info && info.filename) {
            req.uploadedFeedbackImages = req.uploadedFeedbackImages || [];
            req.uploadedFeedbackImages.push(info.filename);
        }
        cb(null, info);
    });
};

const multerUpload = upload.array("images", 2);

export const uploadFeedbackImages = (req, res, next) => {
    req.uploadedFeedbackImages = [];
    
    multerUpload(req, res, async (err) => {
        if (err) {
            // Clean up any files already uploaded during this request
            if (req.uploadedFeedbackImages && req.uploadedFeedbackImages.length > 0) {
                for (const filename of req.uploadedFeedbackImages) {
                    try {
                        await cloudinary.uploader.destroy(filename);
                    } catch (cleanupErr) {
                        console.error(`Failed to clean up image ${filename} after upload failure:`, cleanupErr);
                    }
                }
            }

            // Map MulterError or Cloudinary validation errors to AppError 400
            let message = err.message || "File upload failed";

            if (
                err instanceof multer.MulterError ||
                (err.message && (
                    err.message.toLowerCase().includes("format") ||
                    err.message.toLowerCase().includes("limit") ||
                    err.message.toLowerCase().includes("type") ||
                    err.message.toLowerCase().includes("cloudinary") ||
                    err.message.toLowerCase().includes("invalid") ||
                    err.message.toLowerCase().includes("allowed")
                ))
            ) {
                return next(new AppError(message, 400));
            }

            return next(err);
        }
        next();
    });
};

export const createFeedback = catchAsync(async (req, res, next) => {
    const { text } = req.body;
    
    if (!text || text.trim() === "") {
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.filename) {
                    try {
                        await cloudinary.uploader.destroy(file.filename);
                    } catch (err) {
                        console.error(`Failed to delete orphaned image ${file.filename} from Cloudinary:`, err);
                    }
                }
            }
        }
        return next(new AppError("Feedback text is required.", 400));
    }

    const images = req.files ? req.files.map(file => file.path) : [];

    console.log(`[Feedback] Submitting feedback for user: ${req.user._id} with ${images.length} images.`);

    try {
        const feedback = new feedbackModel({
            user: req.user._id,
            text,
            images
        });

        await feedback.save();

        console.log(`[Feedback] Feedback successfully created with ID: ${feedback._id}`);

        res.status(201).json({
            status: "success",
            data: feedback
        });
    } catch (error) {
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.filename) {
                    try {
                        await cloudinary.uploader.destroy(file.filename);
                    } catch (err) {
                        console.error(`Failed to delete image ${file.filename} after save failure from Cloudinary:`, err);
                    }
                }
            }
        }
        return next(error);
    }
});

export const getFeedbacks = catchAsync(async (req, res) => {
    console.log(`[Feedback] Fetching all user feedbacks for admin: ${req.user._id}`);

    const feedbacks = await feedbackModel.find()
        .populate("user", "displayName email")
        .sort("-createdAt");

    console.log(`[Feedback] Success. Fetched ${feedbacks.length} feedbacks.`);

    res.status(200).json({
        status: "success",
        data: feedbacks
    });
});
