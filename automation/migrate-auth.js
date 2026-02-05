import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server directory
dotenv.config({ path: path.join(__dirname, "../server/.env") });

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.MONGODB_PASSWORD
);

// Define User Schema loosely to access all fields including hidden ones
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.model("User", userSchema);

// Define Auth Schema
const authSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false }
}, { collection: 'auths' });
const Auth = mongoose.model("Auth", authSchema);

async function migrate() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(DB, {
            dbName: process.env.NODE_ENV === "PROD" ? "prod" : "dev"
        });
        console.log("DB connection successful");

        // Find users that still have a password field
        const users = await User.find({ password: { $exists: true } });
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            console.log(`Processing user ${user._id}...`);
            // Check if Auth already exists
            let existingAuth = await Auth.findOne({ user: user._id });

            if (!existingAuth) {
                await Auth.create({
                    user: user._id,
                    password: user.password,
                    salt: user.salt
                });
                console.log(`  -> Created Auth record`);
            } else {
                console.log(`  -> Auth record already exists`);
            }

            // Remove password and salt from User
            await User.updateOne({ _id: user._id }, { $unset: { password: 1, salt: 1 } });
            console.log(`  -> Cleaned User record`);
        }
        console.log("Migration complete");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed", err);
        process.exit(1);
    }
}

migrate();
