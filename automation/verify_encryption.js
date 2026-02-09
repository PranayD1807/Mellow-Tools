
import mongoose from "../server/node_modules/mongoose/index.js";
import dotenv from "dotenv";
import User from "../server/src/models/user.model.js";
import JobApplication from "../server/src/models/jobApplication.model.js";
import Note from "../server/src/models/note.model.js";

dotenv.config({ path: "../server/.env" });

const verify = async () => {
    try {
        const DB = process.env.DATABASE.replace(
            "<PASSWORD>",
            process.env.MONGODB_PASSWORD
        );

        await mongoose.connect(DB, {
            dbName: process.env.NODE_ENV === "PROD" ? "prod" : "dev",
        });
        console.log("DB connection successful!");

        const user = await User.findOne({ email: "old@test.com" });
        if (!user) {
            console.log("User old@test.com not found!");
            return;
        }

        console.log(`\nUser ID: ${user._id}`);

        const note = await Note.findOne({ user: user._id });
        if (note) {
            console.log("\nSample Note:");
            console.log("Title (raw):", note.title);
            console.log("Text (raw):", note.text);

            // Heuristic check for base64 GCM pattern (IV=12 bytes, tag=16 bytes, total >= 28 bytes)
            const looksEncrypted = (str) => {
                if (typeof str !== 'string') return false;
                if (str.length < 20) return false;
                try {
                    const buf = Buffer.from(str, 'base64');
                    // GCM IV (12) + some data + Tag (16)
                    return buf.length >= 28;
                } catch {
                    return false;
                }
            };

            console.log("Looks encrypted?", looksEncrypted(note.title));
        }

        const job = await JobApplication.findOne({ user: user._id });
        if (job) {
            console.log("\nSample Job Application:");
            console.log("Company (raw):", job.company);
            console.log("Looks encrypted?", looksEncrypted(job.company));
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

verify();
