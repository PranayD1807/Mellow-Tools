import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import userModel from '../src/models/user.model.js';
import authModel from '../src/models/auth.model.js';
import noteModel from '../src/models/note.model.js';
import textTemplateModel from '../src/models/textTemplate.model.js';
import bookmarkModel from '../src/models/bookmark.model.js';
import jobApplicationModel from '../src/models/jobApplication.model.js';

describe('Admin Endpoints & Middleware', () => {
    const testAdmin = {
        email: 'admin_test@example.com',
        password: 'Password123!',
        displayName: 'Admin User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    const testNormalUser = {
        email: 'normal_test@example.com',
        password: 'Password123!',
        displayName: 'Normal User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    let adminToken;
    let normalToken;
    let adminUserId;

    beforeEach(async () => {
        // Sign up normal user
        const resNormal = await request(app).post('/api/v1/auth/signup').send(testNormalUser);
        normalToken = resNormal.body.token;

        // Sign up admin user
        const resAdmin = await request(app).post('/api/v1/auth/signup').send(testAdmin);
        adminToken = resAdmin.body.token;
        adminUserId = resAdmin.body.data.id;

        // Set isAdmin: true for the admin user
        await userModel.findByIdAndUpdate(adminUserId, { isAdmin: true });
    });

    describe('verifyAdmin Middleware', () => {
        it('should block unauthorized request without token (401)', async () => {
            const res = await request(app).get('/api/v1/admin/stats');
            expect(res.statusCode).toEqual(401);
        });

        it('should block non-admin user (403)', async () => {
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${normalToken}`);
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toEqual('Admin access denied.');
        });

        it('should allow admin user (200)', async () => {
            const res = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('GET /api/v1/admin/stats - Controller', () => {
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
});
