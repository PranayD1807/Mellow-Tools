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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Concurrently fetch all independent statistics to drastically reduce timeout risk
    const [
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
        userCreations,
        templateCreations,
        templateUpdates,
        noteCreations,
        noteUpdates,
        bookmarkCreations,
        bookmarkUpdates,
        jobCreations,
        jobUpdates
    ] = await Promise.all([
        userModel.countDocuments(),
        authModel.countDocuments({ isTwoFactorEnabled: true }),
        authModel.countDocuments({ encryptionStatus: "ENCRYPTED" }),
        userModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        textTemplateModel.countDocuments(),
        noteModel.countDocuments(),
        bookmarkModel.countDocuments(),
        jobApplicationModel.countDocuments(),
        jobApplicationModel.countDocuments({ status: "Applied" }),
        jobApplicationModel.countDocuments({ status: "Interviewing" }),
        jobApplicationModel.countDocuments({ status: "Offer" }),
        jobApplicationModel.countDocuments({ status: "Rejected" }),
        getLifetimeStats(userModel, 'createdAt'),
        getLifetimeStats(textTemplateModel, 'createdAt'),
        getLifetimeStats(textTemplateModel, 'updatedAt'),
        getLifetimeStats(noteModel, 'createdAt'),
        getLifetimeStats(noteModel, 'updatedAt'),
        getLifetimeStats(bookmarkModel, 'createdAt'),
        getLifetimeStats(bookmarkModel, 'updatedAt'),
        getLifetimeStats(jobApplicationModel, 'createdAt'),
        getLifetimeStats(jobApplicationModel, 'updatedAt')
    ]);

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

    const monthlyActivity = dates.map(date => {
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
        monthlyActivity
    });
});
