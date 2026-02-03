
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../server/src/models/user.model.js";
import JobApplication from "../server/src/models/jobApplication.model.js";
import Bookmark from "../server/src/models/bookmark.model.js";
import Note from "../server/src/models/note.model.js";
import TextTemplate from "../server/src/models/textTemplate.model.js";

dotenv.config({ path: "../server/.env" });

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

        // Targeted user for testing
        const email = "test@test.com";
        let user = await User.findOne({ email });

        if (!user) {
            console.log("Creating new demo user...");
            user = new User({
                displayName: "Demo User",
                email: email,
            });
            user.setPassword("User@1234");
            await user.save();
        } else {
            console.log("User exists, resetting password for access...");
            user.setPassword("User@1234");
            await user.save();
        }

        console.log(`Seeding data for user: ${user.email} (${user._id})`);

        // --- CLEAR EXISTING DATA ---
        await JobApplication.deleteMany({ user: user._id });
        await Bookmark.deleteMany({ user: user._id });
        await Note.deleteMany({ user: user._id });
        await TextTemplate.deleteMany({ user: user._id });

        // --- SEED JOB APPLICATIONS ---
        const jobs = [
            {
                user: user._id,
                company: "Google",
                role: "Frontend Engineer",
                location: "Mountain View, CA",
                status: "Offer",
                jobLink: "https://careers.google.com/jobs/results/",
                appliedOn: new Date("2024-01-15"),
                note: "Received offer letter via email. Negotiating salary.",
                interviewStage: "Final Round",
            },
            {
                user: user._id,
                company: "Netflix",
                role: "Senior UI Engineer",
                location: "Los Gatos, CA (Remote)",
                status: "Interviewing",
                jobLink: "https://jobs.netflix.com/",
                appliedOn: new Date("2024-02-01"),
                note: "Scheduled system design round.",
                interviewStage: "System Design",
                nextInterviewDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
            },
            {
                user: user._id,
                company: "Meta",
                role: "Full Stack Developer",
                location: "Menlo Park, CA",
                status: "Rejected",
                jobLink: "https://www.metacareers.com/",
                appliedOn: new Date("2023-12-10"),
                note: "Rejected after onsite loop.",
                interviewStage: "Onsite",
            },
            {
                user: user._id,
                company: "Amazon",
                role: "SDE II",
                location: "Seattle, WA",
                status: "Applied",
                jobLink: "https://www.amazon.jobs/",
                appliedOn: new Date(),
                note: "Applied with referral from John Doe.",
                interviewStage: "Screening",
            },
            {
                user: user._id,
                company: "Spotify",
                role: "Web Developer",
                location: "New York, NY",
                status: "Interviewing",
                jobLink: "https://www.lifeatspotify.com/",
                appliedOn: new Date("2024-01-20"),
                note: "Recruiter screen went well.",
                interviewStage: "Technical Screen",
                nextInterviewDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
            },
            {
                user: user._id,
                company: "Airbnb",
                role: "Software Engineer, Host Platform",
                location: "San Francisco, CA",
                status: "Offer",
                jobLink: "https://careers.airbnb.com/",
                appliedOn: new Date("2024-01-05"),
                note: "Accepted offer! Start date: March 1st.",
                interviewStage: "Offer Extended",
            },
            {
                user: user._id,
                company: "Linear",
                role: "Frontend Developer",
                location: "Remote",
                status: "Interviewing",
                jobLink: "https://linear.app/careers",
                appliedOn: new Date("2024-02-05"),
                note: "Take-home assignment received.",
                interviewStage: "Take Home",
                nextInterviewDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            },
        ];
        await JobApplication.insertMany(jobs);
        console.log("- Jobs seeded");

        // --- SEED BOOKMARKS ---
        const bookmarks = [
            { user: user._id, label: "ChatGPT", url: "https://chat.openai.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" },
            { user: user._id, label: "YouTube", url: "https://youtube.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" },
            { user: user._id, label: "Chakra UI", url: "https://chakra-ui.com", logoUrl: "https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/media/logo-colored@2x.png?raw=true" },
            { user: user._id, label: "Google", url: "https://google.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" },
            { user: user._id, label: "Twitter", url: "https://twitter.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" }, // Still using bird for recognition or X? Old mockup had X.
            { user: user._id, label: "Reddit", url: "https://reddit.com", logoUrl: "https://www.redditinc.com/assets/images/site/reddit-logo.png" },
            { user: user._id, label: "Netflix", url: "https://netflix.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
            { user: user._id, label: "Amazon", url: "https://amazon.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
            { user: user._id, label: "StackOverflow", url: "https://stackoverflow.com", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Stack_Overflow_icon.svg" },
            { user: user._id, label: "Wikipedia", url: "https://wikipedia.org", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png" }
        ];
        await Bookmark.insertMany(bookmarks);
        console.log("- Bookmarks seeded");

        // --- SEED NOTES ---
        const notes = [
            {
                user: user._id,
                title: "Tell us something that's not on your resume.",
                text: "I once built an entire app just to prove a senior engineer wrong in a debate about \"the better approach.\" I also have a talent for turning team meetings into standup comedy shows while still getting the point across."
            },
            {
                user: user._id,
                title: "Your skills?",
                text: "I'm a black belt in debugging; I can spot a missing comma from 50 lines away. <br> My code reviews are as detailed as a forensic investigation—and twice as scathing. <br> I'm skilled in automating boring tasks so I can spend more time roasting engineers who still do things manually."
            },
            {
                user: user._id,
                title: "Your strengths and weaknesses?",
                text: "Strengths: I'm great at seeing the big picture in code and roasting every misplaced semicolon in it. I excel at turning poorly written documentation into something readable—after thoroughly mocking it. I also thrive under pressure; nothing motivates me more than an impending deadline and the chance to say \"I told you so.\" <br> Weaknesses: I have zero tolerance for spaghetti code and will complain about it loudly. I can be a bit too honest during code reviews—tears have been shed. I also have a dependency on caffeine that borders on a medical condition."
            },
            {
                user: user._id,
                title: "Why should we hire you?",
                text: "Because I bring more than just technical expertise—I bring entertainment, motivation, and a good laugh when your CI/CD pipeline inevitably breaks. I can spot bugs before they happen, roast bad ideas into better ones, and keep the team on their toes with a mix of sarcasm and brilliant solutions. Plus, I come with my own mechanical keyboard, so you know I mean business."
            }
        ];
        await Note.insertMany(notes);
        console.log("- Notes seeded");

        // --- SEED TEXT TEMPLATES ---
        const textTemplates = [
            {
                user: user._id,
                title: "Cover Letter",
                content: `[DATE]

[Company_Name]
[Company_Address]

Dear [Manager_Name],

I am writing to express my interest in the [Job_Title] position at [Company_Name] as advertised on [Source]. With my background in [Background] and experience in [Experience], I believe I can make a meaningful contribution to your team.

I have a deep interest in [Interest], which aligns well with my professional values and career goals. I am particularly drawn to [Company_Name] because of [Reason].

In my previous role at Google, I successfully enjoyed making coffee for my colleagues. This experience has allowed me to develop a strong skill set in team bonding, communication and wasting time, and I am confident that these will allow me to thrive in the [Job_Title] role at [Company_Name].

I would be thrilled to discuss how my skills and experience align with the needs of your team. Please find my resume attached for your review. I am looking forward to the opportunity to further discuss how I can contribute to the success of [Company_Name].

Thank you for considering my application. I hope to hear from you soon.

Sincerely,
Roaster Toaster,
roastme.mellow@gmail.com`,
                placeholders: [
                    { tag: "Company_Name", defaultValue: "Microsoft" },
                    { tag: "Company_Address", defaultValue: "Bangalore, India" },
                    { tag: "Manager_Name", defaultValue: "Sir/Ma'am" },
                    { tag: "Job_Title", defaultValue: "SDE-1" },
                    { tag: "Source", defaultValue: "LinkedIn" },
                    { tag: "Background", defaultValue: "Computer Science" },
                    { tag: "Experience", defaultValue: "Full Stack Development" },
                    { tag: "Interest", defaultValue: "Cloud Computing" },
                    { tag: "Reason", defaultValue: "Innovation" }
                ]
            }
        ];
        await TextTemplate.insertMany(textTemplates);
        console.log("- Text Templates seeded");

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
