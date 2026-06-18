import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import userModel from '../src/models/user.model.js';
import authModel from '../src/models/auth.model.js';
import noteModel from '../src/models/note.model.js';
import textTemplateModel from '../src/models/textTemplate.model.js';
import bookmarkModel from '../src/models/bookmark.model.js';
import jobApplicationModel from '../src/models/jobApplication.model.js';

describe('Admin Endpoints & Active Users Tracking', () => {
    const testAdmin = {
        email: 'admin@example.com',
        password: 'Password123!',
        displayName: 'Admin User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt-admin',
        encryptedAESKey: 'dummy-encrypted-key-admin'
    };

    const testUser = {
        email: 'user@example.com',
        password: 'Password123!',
        displayName: 'Normal User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt-user',
        encryptedAESKey: 'dummy-encrypted-key-user'
    };

    let adminToken;
    let userToken;
    let adminUserId;
    let normalUserId;

    beforeEach(async () => {
        // Register normal user
        const userRes = await request(app)
            .post('/api/v1/auth/signup')
            .send(testUser);
        userToken = userRes.body.token;
        normalUserId = userRes.body.data.id;

        // Register admin user
        const adminRes = await request(app)
            .post('/api/v1/auth/signup')
            .send(testAdmin);
        adminToken = adminRes.body.token;
        adminUserId = adminRes.body.data.id;

        // Elevate admin user in DB
        await userModel.findByIdAndUpdate(adminUserId, { isAdmin: true });
    });

    describe('Access Control for /admin/stats', () => {
        it('should block unauthenticated requests', async () => {
            const res = await request(app).get('/api/v1/admin/stats');
            expect(res.statusCode).toEqual(401);
        });

        it('should block non-admin users', async () => {
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toMatch(/Admin access denied/i);
        });

        it('should allow admin users to fetch stats', async () => {
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('usersCount');
            expect(res.body).toHaveProperty('activeUsers24h');
            expect(res.body).toHaveProperty('activeUsers7d');
        });
    });

    describe('GET /api/v1/admin/stats - Data Metrics Aggregation', () => {
        it('should aggregate lifetime stats correctly when items are present', async () => {
            // Seed a note
            const note = new noteModel({ user: adminUserId, title: 'Admin Note', text: 'Some text' });
            await note.save();
            // Manually force createdAt date to a past month (e.g. 2 months ago) to test the date range loop
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
            await noteModel.collection.updateOne({ _id: note._id }, { $set: { createdAt: twoMonthsAgo } });

            // Seed a template
            const template = new textTemplateModel({ user: adminUserId, title: 'Template', content: 'Some text' });
            await template.save();

            // Seed a bookmark
            const bookmark = new bookmarkModel({ user: adminUserId, label: 'Bookmark', url: 'https://example.com' });
            await bookmark.save();

            // Seed a job application
            const job = new jobApplicationModel({ user: adminUserId, company: 'Google', role: 'Developer', location: 'Remote', status: 'Interviewing' });
            await job.save();

            // Enable 2FA on admin auth
            await authModel.findOneAndUpdate({ user: adminUserId }, { isTwoFactorEnabled: true, encryptionStatus: 'ENCRYPTED' });

            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('usersCount');
            expect(res.body.usersWith2FA).toBeGreaterThanOrEqual(1);
            expect(res.body.usersEncrypted).toBeGreaterThanOrEqual(1);
            expect(res.body.notesCount).toBeGreaterThanOrEqual(1);
            expect(res.body.templatesCount).toBeGreaterThanOrEqual(1);
            expect(res.body.bookmarksCount).toBeGreaterThanOrEqual(1);
            expect(res.body.jobsCount).toBeGreaterThanOrEqual(1);
            expect(res.body.jobsInterviewing).toBeGreaterThanOrEqual(1);
            expect(res.body.monthlyActivity.length).toBeGreaterThanOrEqual(3); // current month, 1 month ago, 2 months ago
        });

        it('should fallback to current month if no dates are found in sortedDatesList', async () => {
            // Spy on aggregate methods to return empty array for stats
            const spyUser = jest.spyOn(userModel, 'aggregate').mockResolvedValue([{ _id: null, count: 5 }]);
            const spyNote = jest.spyOn(noteModel, 'aggregate').mockResolvedValue([]);
            const spyTemplate = jest.spyOn(textTemplateModel, 'aggregate').mockResolvedValue([]);
            const spyBookmark = jest.spyOn(bookmarkModel, 'aggregate').mockResolvedValue([]);
            const spyJob = jest.spyOn(jobApplicationModel, 'aggregate').mockResolvedValue([]);

            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.monthlyActivity).toHaveLength(1);
            
            const d = new Date();
            const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            expect(res.body.monthlyActivity[0].date).toEqual(currentMonth);

            spyUser.mockRestore();
            spyNote.mockRestore();
            spyTemplate.mockRestore();
            spyBookmark.mockRestore();
            spyJob.mockRestore();
        });
    });

    describe('lastActiveAt Tracking & Throttling', () => {
        it('should update lastActiveAt on authenticated requests', async () => {
            const user = await userModel.findOne({ email: testUser.email });
            const initialActiveTime = user.lastActiveAt;
            expect(initialActiveTime).toBeDefined();

            // Mock time to bypass 5-minute throttling
            const userDb = await userModel.findOne({ email: testUser.email });
            // Set lastActiveAt to 10 minutes ago
            userDb.lastActiveAt = new Date(Date.now() - 10 * 60 * 1000);
            await userDb.save();

            // Send an authenticated request to trigger verifyJWT
            await request(app)
                .post('/api/v1/auth/get-info')
                .set('Authorization', `Bearer ${userToken}`);

            const updatedUser = await userModel.findOne({ email: testUser.email });
            expect(updatedUser.lastActiveAt.getTime()).toBeGreaterThan(userDb.lastActiveAt.getTime());
        });

        it('should throttle lastActiveAt updates within 5 minutes', async () => {
            const userDb = await userModel.findOne({ email: testUser.email });
            // Set lastActiveAt to 2 minutes ago
            const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
            userDb.lastActiveAt = twoMinutesAgo;
            await userDb.save();

            // Send authenticated request
            await request(app)
                .post('/api/v1/auth/get-info')
                .set('Authorization', `Bearer ${userToken}`);

            const checkUser = await userModel.findOne({ email: testUser.email });
            // The timestamp should NOT be updated because 2 minutes < 5 minutes
            expect(checkUser.lastActiveAt.getTime()).toEqual(twoMinutesAgo.getTime());
        });
    });

    describe('Active Users fallback to createdAt', () => {
        it('should fallback to createdAt if lastActiveAt is missing', async () => {
            // Unset lastActiveAt for the normal user in the DB directly
            await userModel.collection.updateOne(
                { email: testUser.email },
                { $unset: { lastActiveAt: "" } }
            );

            // Verify unset succeeded
            const userRaw = await userModel.findOne({ email: testUser.email }).select('+lastActiveAt').lean();
            expect(userRaw.lastActiveAt).toBeUndefined();

            // Request admin stats and make sure the user is still counted as active
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            // Both the admin and normal user should be counted (total 2 users active in last 24h)
            expect(res.body.activeUsers24h).toEqual(2);
        });

        it('should not count users whose fallback createdAt is outside the active window', async () => {
            // Unset lastActiveAt and set createdAt to 2 days ago for normal user directly
            await userModel.collection.updateOne(
                { email: testUser.email },
                { 
                    $unset: { lastActiveAt: "" },
                    $set: { createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
                }
            );

            // Request admin stats
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            // Normal user (48h ago) should not be active in 24h window, but admin is active
            expect(res.body.activeUsers24h).toEqual(1);
            // Both are still active in the 7d window
            expect(res.body.activeUsers7d).toEqual(2);
        });
    });
});
