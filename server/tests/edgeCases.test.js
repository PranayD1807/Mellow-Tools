
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import userModel from '../src/models/user.model.js';
import AppError from '../src/utils/appError.js';

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
            confirmPassword: 'Password123!'
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
                .send({ password: 'Password123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });

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

            // Mock findById: first call for verifyJWT returns user object
            // Second call for updatePassword returns query object with select()
            const spy = jest.spyOn(userModel, 'findById');
            spy.mockResolvedValueOnce({ id: userId });
            spy.mockReturnValueOnce({
                select: jest.fn().mockResolvedValue(null)
            });

            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: 'Password123!', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });

            expect(res.statusCode).toBe(401);
            spy.mockRestore();
        });

        it('should handle refreshToken user not found branch (returns 404)', async () => {
            const spy = jest.spyOn(userModel, 'findById').mockResolvedValue(null);

            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                ...testUser,
                email: 'refresh_notfound@test.com'
            });
            const refreshToken = signupRes.body.refreshToken;

            const res = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({ refreshToken });

            expect(res.statusCode).toBe(404);
            spy.mockRestore();
        });
    });

    describe('Token Middleware Edge Cases', () => {
        it('should handle verifyJWT user not found branch', async () => {
            const spy = jest.spyOn(userModel, 'findById').mockResolvedValue(null);

            const signupRes = await request(app).post('/api/v1/auth/signup').send({
                email: 'token_edge@test.com',
                password: 'Password123!',
                displayName: 'Token User',
                confirmPassword: 'Password123!'
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
                confirmPassword: 'Password123!'
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
                confirmPassword: 'Password123!'
            });
            const token = signupRes.body.token;

            const res = await request(app)
                .get('/api/v1/notes')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
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
});
