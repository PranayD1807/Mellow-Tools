

import mongoose from "../server/node_modules/mongoose/index.js";
import dotenv from "dotenv";
import crypto from "crypto";
import User from "../server/src/models/user.model.js";
import Auth from "../server/src/models/auth.model.js";
import JobApplication from "../server/src/models/jobApplication.model.js";
import Bookmark from "../server/src/models/bookmark.model.js";
import Note from "../server/src/models/note.model.js";
import TextTemplate from "../server/src/models/textTemplate.model.js";

dotenv.config({ path: "../server/.env" });

const ITERATIONS = 600000;
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM

const arrayBufferToBase64 = (buffer) => {
    return buffer.toString('base64');
};

const base64ToBuffer = (base64) => {
    return Buffer.from(base64, 'base64');
};

const generateSalt = () => {
    return crypto.randomBytes(16).toString('base64');
};

const generateAESKey = () => {
    return crypto.randomBytes(KEY_LENGTH);
};

const deriveKey = (password, saltBase64) => {
    const salt = base64ToBuffer(saltBase64);
    return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
};

const encryptData = (text, key) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const tag = cipher.getAuthTag();



    const combined = Buffer.concat([iv, encrypted, tag]);
    return arrayBufferToBase64(combined);
};

const encryptAESKey = (keyToEncrypt, kek) => {

    return encryptData(keyToEncrypt, kek);
};


const seedFull = async () => {
    try {
        const DB = process.env.DATABASE.replace(
            "<PASSWORD>",
            process.env.MONGODB_PASSWORD
        );

        mongoose.set("strictQuery", true);
        await mongoose.connect(DB, {
            dbName: process.env.NODE_ENV === "PROD" ? "prod" : "dev",
        });
        console.log("DB connection successful! 👍");

        // Targeted user
        const email = "mellow@test.com";
        const password = "User@1234";

        let user = await User.findOne({ email });


        const masterKey = generateAESKey(); // The raw master key used to encrypt data
        const salt = generateSalt();
        const kek = deriveKey(password, salt);
        const encryptedAESKey = encryptAESKey(masterKey, kek);

        if (!user) {
            console.log("Creating new user...");
            user = new User({
                displayName: "Mellow User",
                email: email,
            });
            await user.save();
        } else {
            console.log("User exists.");
        }


        console.log("Resetting Auth and Keys...");
        await Auth.deleteMany({ user: user._id });
        const auth = new Auth({ user: user._id });
        auth.setPassword(password);
        auth.encryptedAESKey = encryptedAESKey;
        auth.passwordKeySalt = salt;
        auth.encryptionStatus = "ENCRYPTED";
        auth.isTwoFactorEnabled = false;
        await auth.save();

        console.log(`Seeding data for user: ${user.email} (${user._id})`);
        console.log("This might take a moment...");


        await JobApplication.deleteMany({ user: user._id });
        await Bookmark.deleteMany({ user: user._id });
        await Note.deleteMany({ user: user._id });
        await TextTemplate.deleteMany({ user: user._id });

        // --- SEED JOB APPLICATIONS ---
        const companies = ["Google", "Netflix", "Meta", "Amazon", "Spotify", "Apple", "Microsoft", "Uber", "Airbnb", "Stripe"];
        const roles = ["Frontend Engineer", "Backend Engineer", "Full Stack Dev", "SDE II", "Staff Engineer", "UI Engineer"];
        const locations = ["Remote", "NYC", "London", "San Francisco", "Bangalore", "Berlin"];
        const statuses = ["Applied", "Interviewing", "Offer", "Rejected"];

        const jobDocs = [];
        for (let i = 0; i < 500; i++) {
            const company = companies[i % companies.length];
            const role = roles[i % roles.length];

            jobDocs.push({
                user: user._id,
                company: encryptData(`${company} ${i}`, masterKey),
                role: encryptData(role, masterKey),
                location: encryptData(locations[i % locations.length], masterKey),
                status: statuses[i % statuses.length], // Unencrypted
                jobLink: encryptData(`https://jobs.${company.toLowerCase()}.com/${i}`, masterKey),
                appliedOn: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
                note: encryptData(`This is a generated note for application ${i}.`, masterKey),
                interviewStage: encryptData(`Stage ${i % 5}`, masterKey),
            });
        }
        await JobApplication.insertMany(jobDocs);
        console.log("- 500 Jobs seeded");

        // --- SEED BOOKMARKS ---
        const bookmarkDocs = [];
        for (let i = 0; i < 500; i++) {
            bookmarkDocs.push({
                user: user._id,
                label: encryptData(`Bookmark ${i}`, masterKey),
                url: encryptData(`https://example.com/${i}`, masterKey),
                logoUrl: encryptData(`https://via.placeholder.com/64?text=${i}`, masterKey),
                note: encryptData(`Generated bookmark ${i}`, masterKey),
            });
        }
        await Bookmark.insertMany(bookmarkDocs);
        console.log("- 500 Bookmarks seeded");

        // --- SEED NOTES ---
        const noteDocs = [];
        for (let i = 0; i < 500; i++) {
            noteDocs.push({
                user: user._id,
                title: encryptData(`Note Title ${i}`, masterKey),
                text: encryptData(`This is the content of note ${i}. It is encrypted!`, masterKey),
            });
        }
        await Note.insertMany(noteDocs);
        console.log("- 500 Notes seeded");

        // --- SEED TEXT TEMPLATES ---
        const templateDocs = [];
        for (let i = 0; i < 500; i++) {
            templateDocs.push({
                user: user._id,
                title: encryptData(`Template ${i}`, masterKey),
                content: encryptData(`Hello [Name], this is template ${i}.`, masterKey),
                placeholders: [
                    {
                        tag: encryptData("Name", masterKey),
                        defaultValue: encryptData("User", masterKey)
                    }
                ]
            });
        }
        await TextTemplate.insertMany(templateDocs);
        console.log("- 500 Text Templates seeded");

        console.log("Seeding complete! 🌱");

    } catch (err) {
        console.error("Seeding failed! 💥");
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("DB disconnected.");
        process.exit();
    }
};

seedFull();
