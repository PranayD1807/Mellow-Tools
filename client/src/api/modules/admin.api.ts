import privateClient from "../client/private.client";

const adminEndpoints = {
    stats: "/admin/stats",
};

export interface AdminStatsResponse {
    usersCount: number;
    usersWith2FA: number;
    usersEncrypted: number;
    recentUsers: number;
    templatesCount: number;
    notesCount: number;
    bookmarksCount: number;
    jobsCount: number;
    jobsApplied: number;
    jobsInterviewing: number;
    jobsOffer: number;
    jobsRejected: number;
    dailyActivity: {
        date: string;
        users: number;
        templatesCreated: number;
        templatesUpdated: number;
        notesCreated: number;
        notesUpdated: number;
        bookmarksCreated: number;
        bookmarksUpdated: number;
        jobsCreated: number;
        jobsUpdated: number;
    }[];
}

const adminApi = {
    getStats: async (adminSecret: string) => {
        try {
            const response = await privateClient.get<AdminStatsResponse>(adminEndpoints.stats, {
                headers: {
                    "x-admin-secret": adminSecret,
                },
            });
            return { response, err: null };
        } catch (err: unknown) {
            return { response: null, err };
        }
    },
};

export default adminApi;
