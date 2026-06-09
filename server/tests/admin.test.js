import request from 'supertest';
import app from '../app.js';
import userModel from '../src/models/user.model.js';

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

    beforeEach(async () => {
        // Register normal user
        const userRes = await request(app)
            .post('/api/v1/auth/signup')
            .send(testUser);
        userToken = userRes.body.token;

        // Register admin user
        const adminRes = await request(app)
            .post('/api/v1/auth/signup')
            .send(testAdmin);
        adminToken = adminRes.body.token;

        // Elevate admin user in DB
        const adminDb = await userModel.findOne({ email: testAdmin.email });
        adminDb.isAdmin = true;
        await adminDb.save();
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
