import "./loadEnv.js";
import mongoose from "mongoose";
import app from "./app.js";

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.MONGODB_PASSWORD
);

mongoose.set("strictQuery", true);

mongoose
    .connect(DB, {
        dbName: process.env.NODE_ENV === "PROD" ? "prod" : "dev"
    })
    .then(() => console.log("DB connection successful! 👍\n"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
    server.close(() => {
        console.log("💥 Process terminated!");
    });
});