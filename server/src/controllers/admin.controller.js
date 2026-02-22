import userModel from "../models/user.model.js";
import authModel from "../models/auth.model.js";
import textTemplateModel from "../models/textTemplate.model.js";
import noteModel from "../models/note.model.js";
import bookmarkModel from "../models/bookmark.model.js";
import jobApplicationModel from "../models/jobApplication.model.js";
import catchAsync from "../utils/catchAsync.js";

const getLifetimeStats = async (model, dateField) => {
    const stats = await model.aggregate([
        { $match: { [dateField]: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: `$${dateField}` } }, count: { $sum: 1 } } }
    ]);
    const map = {};
    stats.forEach(s => {
        if (s._id) map[s._id] = s.count;
    });
    return map;
};

export const getAdminStats = catchAsync(async (req, res) => {
    // Users stats
    const usersCount = await userModel.countDocuments();

    // Auth stats (2FA, Encryption)
    const usersWith2FA = await authModel.countDocuments({ isTwoFactorEnabled: true });
    const usersEncrypted = await authModel.countDocuments({ encryptionStatus: "ENCRYPTED" });

    // Time-based user stats (signups in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await userModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Entities count
    const templatesCount = await textTemplateModel.countDocuments();
    const notesCount = await noteModel.countDocuments();
    const bookmarksCount = await bookmarkModel.countDocuments();

    // Jobs stats
    const jobsCount = await jobApplicationModel.countDocuments();
    const jobsApplied = await jobApplicationModel.countDocuments({ status: "Applied" });
    const jobsInterviewing = await jobApplicationModel.countDocuments({ status: "Interviewing" });
    const jobsOffer = await jobApplicationModel.countDocuments({ status: "Offer" });
    const jobsRejected = await jobApplicationModel.countDocuments({ status: "Rejected" });

    // Specific Monthly Activity Stats for Charts (Lifetime)
    const userCreations = await getLifetimeStats(userModel, 'createdAt');
    const templateCreations = await getLifetimeStats(textTemplateModel, 'createdAt');
    const templateUpdates = await getLifetimeStats(textTemplateModel, 'updatedAt');
    const noteCreations = await getLifetimeStats(noteModel, 'createdAt');
    const noteUpdates = await getLifetimeStats(noteModel, 'updatedAt');
    const bookmarkCreations = await getLifetimeStats(bookmarkModel, 'createdAt');
    const bookmarkUpdates = await getLifetimeStats(bookmarkModel, 'updatedAt');
    const jobCreations = await getLifetimeStats(jobApplicationModel, 'createdAt');
    const jobUpdates = await getLifetimeStats(jobApplicationModel, 'updatedAt');

    const allDates = new Set([
        ...Object.keys(userCreations),
        ...Object.keys(templateCreations),
        ...Object.keys(templateUpdates),
        ...Object.keys(noteCreations),
        ...Object.keys(noteUpdates),
        ...Object.keys(bookmarkCreations),
        ...Object.keys(bookmarkUpdates),
        ...Object.keys(jobCreations),
        ...Object.keys(jobUpdates),
    ]);

    const sortedDatesList = Array.from(allDates).sort();
    const dates = [];
    if (sortedDatesList.length > 0) {
        let startDate = new Date(sortedDatesList[0] + "-01");
        let endDate = new Date();
        for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            dates.push(`${year}-${month}`);
        }
    } else {
        const d = new Date();
        dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const dailyActivity = dates.map(date => {
        return {
            date,
            users: userCreations[date] || 0,
            templatesCreated: templateCreations[date] || 0,
            templatesUpdated: templateUpdates[date] || 0,
            notesCreated: noteCreations[date] || 0,
            notesUpdated: noteUpdates[date] || 0,
            bookmarksCreated: bookmarkCreations[date] || 0,
            bookmarksUpdated: bookmarkUpdates[date] || 0,
            jobsCreated: jobCreations[date] || 0,
            jobsUpdated: jobUpdates[date] || 0,
        };
    });

    res.status(200).json({
        usersCount,
        usersWith2FA,
        usersEncrypted,
        recentUsers,
        templatesCount,
        notesCount,
        bookmarksCount,
        jobsCount,
        jobsApplied,
        jobsInterviewing,
        jobsOffer,
        jobsRejected,
        dailyActivity
    });
});
