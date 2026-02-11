import express from "express";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cors from "cors";
import dotenv from "dotenv";
import globalErrorHandler from "./src/controllers/error.controller.js";
import routes from "./src/routes/index.js";
import AppError from "./src/utils/appError.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/utils/swagger.js";

dotenv.config({ path: "./.env" });

const app = express();

// Limit requests from the same API
const limiter = rateLimit({
    max: 60000,
    windowMs: 60 * 60 * 1000, // in milliseconds
    message: "Too many requests from this IP, please try again in an hour!",
});

app.use(cors());
app.use("/api", limiter);
app.use(express.json());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
    hpp({
        whitelist: ["duration", "ratingsAverage", "maxGroupSize", "difficulty", "price"],
    })
);

app.use(express.urlencoded({ extended: false }));

// Serving static files
app.use(express.static(`${process.cwd()}/public`));

app.use((req, res, next) => {
    console.log(`Request : ${req.method} "${req.url}"`);
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", routes);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

export default app;