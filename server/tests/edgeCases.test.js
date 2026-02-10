
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import userModel from '../src/models/user.model.js';
import authModel from '../src/models/auth.model.js';
import AppError from '../src/utils/appError.js';
import jsonwebtoken from 'jsonwebtoken';
import APIFeatures from '../src/utils/apiFeatures.js';

describe('Edge Cases and Missing Branches', () => {

    describe('AppError status branch', () => {
        it('should set status to "error" for 5xx codes', () => {
            const err = new AppError('Server error', 500);
            expect(err.status).toBe('error');
        });

        it('should set status to "fail" for 4xx codes', () => {
            const err = new AppError('Client error', 404);
            expect(err.status).toBe('fail');
        });
    });

    describe('User Controller Edge Cases', () => {
        const testUser = {
            email: 'edge@example.com',
            password: 'Password123!',
            displayName: 'Edge User',
            confirmPassword: 'Password123!',
            passwordKeySalt: 'dummy-salt',
            encryptedAESKey: 'dummy-encrypted-key'
        };

        it('should handle signup email already used branch', async () => {
            await request(app).post('/api/v1/auth/signup').send(testUser);
            const res = await request(app).post('/api/v1/auth/signup').send(testUser);
            // This hits line 11 in user.controller.js
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/email already used/i);
        });

        it('should handle verifyJWT user not found branch (returns 401)', async () => {
            // Mock findById to return null even with valid token
            const spy = jest.spyOn(userModel, 'findById').mockResolvedValue(null);

            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                ...testUser,
                email: 'unauth@test.com'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'Password123!',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                    passwordKeySalt: 'new-dummy-salt',
                    encryptedAESKey: 'new-dummy-encrypted-key'
                });

            expect(res.statusCode).toBe(401);
            spy.mockRestore();
        });

        it('should handle getInfo user not found branch (returns 404)', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                ...testUser,
                email: 'notfound@test.com'
            });
            const token = signupRes.body.token;
            const userId = signupRes.body.data.id;

            // Mock findById: first call (verifyJWT) returns user, second call (getInfo) returns null
            const spy = jest.spyOn(userModel, 'findById')
                .mockResolvedValueOnce({ id: userId }) // Success for middleware
                .mockResolvedValueOnce(null);          // Failure for controller

            const res = await request(app)
                .post('/api/v1/auth/get-info')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            spy.mockRestore();
        });

        it('should handle updatePassword user not found branch (returns 401)', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                ...testUser,
                email: 'up_notfound@test.com'
            });
            const token = signupRes.body.token;
            const userId = signupRes.body.data.id;

            // Delete auth record to force 401
            await authModel.deleteOne({ user: userId });

            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'Password123!',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                    passwordKeySalt: 'new-dummy-salt',
                    encryptedAESKey: 'new-dummy-encrypted-key'
                });

            expect(res.statusCode).toBe(401);
        });

        it('should handle refreshToken user not found branch (returns 404)', async () => {
            // Create a token for a non-existent user
            const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
            const refreshToken = jsonwebtoken.sign(
                { data: nonExistentId },
                process.env.TOKEN_SECRET || 'test-secret-key-12345'
            );

            const res = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({ refreshToken });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('User Controller Logic Branches', () => {
        it('should return 500 on signin if auth record is missing', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'missing_auth@test.com',
                password: 'Password123!',
                displayName: 'Missing Auth',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const userId = signupRes.body.data.id;

            // Delete auth record
            await authModel.deleteOne({ user: userId });

            const res = await request(app)
                .post('/api/v1/auth/signin')
                .send({
                    email: 'missing_auth@test.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toMatch(/Authentication record missing/);
        });

        it('should handle getInfo with missing auth record (returns isTwoFactorEnabled: false)', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'missing_auth_info@test.com',
                password: 'Password123!',
                displayName: 'Info User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;
            const userId = signupRes.body.data.id;

            // Delete auth record
            await authModel.deleteOne({ user: userId });

            const res = await request(app)
                .post('/api/v1/auth/get-info')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isTwoFactorEnabled).toBe(false);
        });
    });

    describe('Token Middleware Edge Cases', () => {
        it('should handle verifyJWT user not found branch', async () => {
            const spy = jest.spyOn(userModel, 'findById').mockResolvedValue(null);

            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'token_edge@test.com',
                password: 'Password123!',
                displayName: 'Token User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .get('/api/v1/notes')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(401);
            spy.mockRestore();
        });
    });

    describe('APIFeatures Edge Cases', () => {
        it('should skip $in logic if not present in query', async () => {
            // We can trigger this via any getAll route with a non-$in query
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'api_edge@test.com',
                password: 'Password123!',
                displayName: 'API User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .get('/api/v1/notes?title=SomeTitle')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
        });

        it('should handle empty query object correctly', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'api_empty@test.com',
                password: 'Password123!',
                displayName: 'API User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .get('/api/v1/notes')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
        });

        it('should use descending sort when starts with -', async () => {
            // Testing logic path: const isPrimaryDescending = this.queryString.sort.startsWith('-');
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'sort_desc@test.com',
                password: 'Password123!',
                displayName: 'Sort User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .get('/api/v1/notes?sort=-title')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
        });

        it('should use basic sort if createdAt is already included', async () => {
            // Testing logic path: const finalSort = sortBy.includes('createdAt') ? sortBy : `${sortBy} ${secondarySortKey}`;
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'sort_created@test.com',
                password: 'Password123!',
                displayName: 'Sort User 2',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .get('/api/v1/notes?sort=createdAt')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
        });

        it('should apply search validation branches', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'search_edge@test.com',
                password: 'Password123!',
                displayName: 'Search User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            const res1 = await request(app)
                .get('/api/v1/notes?search=test')
                .set('Authorization', `Bearer ${token}`);
            expect(res1.statusCode).toBe(200);
        });

        it('should handle $in operator in filter', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: `in_operator_${Date.now()}@test.com`,
                password: 'Password123!',
                displayName: 'InOperatorUser',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            // Ensure signup succeeded
            expect(signupRes.statusCode).toBe(201);

            // Trigger line 22: parsedQuery[key].$in = parsedQuery[key].$in.split(',');
            const res = await request(app)
                .get('/api/v1/notes?title[in]=Note1,Note2')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
        });

        it('should limit fields when fields param is present', async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'fields_edge@test.com',
                password: 'Password123!',
                displayName: 'Fields User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            });
            const token = signupRes.body.token;

            // Trigger line 58: if (this.queryString.fields)
            const res = await request(app)
                .get('/api/v1/notes?fields=title,content')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            // Verify that other fields (like _id, though _id is usually always there unless excluded) are present/absent?
            // APIFeatures just selects the fields.
        });
    });

    describe('Error Controller Non-API Routes', () => {
        let originalEnv;
        beforeEach(() => {
            originalEnv = process.env.NODE_ENV;
        });
        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should handle non-API route error in DEV mode', async () => {
            process.env.NODE_ENV = 'DEV';
            const res = await request(app).get('/some-web-page');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('title', 'Something went wrong!');
        });

        it('should handle non-API route error in PROD mode', async () => {
            process.env.NODE_ENV = 'PROD';
            const res = await request(app).get('/some-web-page');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('title', 'Something went wrong!');
        });

        it('should handle non-API route error in unknown environment (falls back to DEV-like behavior)', async () => {
            process.env.NODE_ENV = 'UNKNOWN';
            const res = await request(app).get('/some-web-page');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('title', 'Something went wrong!');
        });
    });

    describe('User Controller 2FA Edge Cases', () => {
        const testUser2FA = {
            email: `2fa_edge_${Date.now()}@test.com`,
            password: 'Password123!',
            displayName: '2FAEdgeUser',
            confirmPassword: 'Password123!',
            passwordKeySalt: 'dummy-salt',
            encryptedAESKey: 'dummy-encrypted-key'
        };

        let token;
        let userId;

        beforeEach(async () => {
            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                ...testUser2FA,
                email: `2fa_edge_${Date.now()}@test.com` // Ensure unique
            });
            token = signupRes.body.token;
            userId = signupRes.body.data.id;
        });

        it('should handle generate2FA missing auth record (returns 404)', async () => {
            await authModel.deleteOne({ user: userId });
            const res = await request(app)
                .post('/api/v1/auth/2fa/generate')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
        });

        it('should handle verify2FA missing auth record (returns 404)', async () => {
            await authModel.deleteOne({ user: userId });
            const res = await request(app)
                .post('/api/v1/auth/2fa/verify')
                .set('Authorization', `Bearer ${token}`)
                .send({ token: '123456' });
            expect(res.statusCode).toBe(404);
        });

        it('should handle verify2FA invalid code (returns 400)', async () => {
            // First generate to set secret
            await request(app).post('/api/v1/auth/2fa/generate').set('Authorization', `Bearer ${token}`);

            const res = await request(app)
                .post('/api/v1/auth/2fa/verify')
                .set('Authorization', `Bearer ${token}`)
                .send({ token: '000000' }); // Invalid
            expect(res.statusCode).toBe(400);
        });

        it('should handle disable2FA missing auth record (returns 404)', async () => {
            await authModel.deleteOne({ user: userId });
            const res = await request(app)
                .post('/api/v1/auth/2fa/disable')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
        });

        it('should handle validate2FA missing user (returns 404)', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .post('/api/v1/auth/2fa/validate')
                .send({ userId: nonExistentId, token: '123456' });
            expect(res.statusCode).toBe(404);
        });

        it('should handle validate2FA auth missing or disabled (returns 400)', async () => {
            // Auth exists but 2FA not enabled
            const res = await request(app)
                .post('/api/v1/auth/2fa/validate')
                .send({ userId: userId, token: '123456' });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/2FA not enabled/);
        });

        it('should handle validate2FA invalid code (returns 400)', async () => {
            // Enable 2FA first
            await request(app).post('/api/v1/auth/2fa/generate').set('Authorization', `Bearer ${token}`);
            // Manually enable in DB
            await authModel.updateOne({ user: userId }, { isTwoFactorEnabled: true });

            const res = await request(app)
                .post('/api/v1/auth/2fa/validate')
                .send({ userId: userId, token: '000000' });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Invalid code/);
        });
    });


    describe('APIFeatures Unit Tests', () => {
        it('should skip search if searchableFields is empty', () => {
            const query = { find: jest.fn().mockReturnThis() };
            const queryString = { search: 'term' };
            const features = new APIFeatures(query, queryString);
            features.search([]); // Empty fields
            expect(query.find).not.toHaveBeenCalled();
        });

        it('should use default empty array if searchableFields not provided', () => {
            const query = { find: jest.fn().mockReturnThis() };
            const queryString = { search: 'term' };
            const features = new APIFeatures(query, queryString);
            features.search(); // No args, triggers default = []
            expect(query.find).not.toHaveBeenCalled();
        });
    });

});
