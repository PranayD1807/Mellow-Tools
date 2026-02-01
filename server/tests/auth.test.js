
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

process.env.TOKEN_SECRET = 'testsecret';

describe('Auth Endpoints', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'Test User',
        confirmPassword: 'Password123!'
    };

    let token;

    describe('POST /api/v1/auth/signup', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toHaveProperty('email', testUser.email);
            expect(res.body.token).toBeDefined();
        });

        it('should not create a user with existing email', async () => {
            await request(app).post('/api/v1/auth/signup').send(testUser);
            const res = await request(app).post('/api/v1/auth/signup').send(testUser);

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/email already used/i);
        });

        it('should fail with weak password', async () => {
            const weakUser = { ...testUser, password: 'weak', confirmPassword: 'weak', email: 'weak@example.com' };
            const res = await request(app).post('/api/v1/auth/signup').send(weakUser);
            expect(res.statusCode).toEqual(400);
        });

        it('should fail if passwords do not match', async () => {
            const invalidUser = { ...testUser, confirmPassword: 'DifferentPassword123!', email: 'mismatch@example.com' };
            const res = await request(app).post('/api/v1/auth/signup').send(invalidUser);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/confirmPassword does not match password/i);
        });
    });

    describe('POST /api/v1/auth/signin', () => {
        beforeEach(async () => {
            await request(app).post('/api/v1/auth/signup').send(testUser);
        });

        it('should sign in with correct credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signin')
                .send({ email: testUser.email, password: testUser.password });

            expect(res.statusCode).toEqual(200);
            expect(res.body.token).toBeDefined();
            token = res.body.token;
        });

        it('should not sign in with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signin')
                .send({ email: testUser.email, password: 'WrongPassword' });

            expect(res.statusCode).toEqual(400);
        });

        it('should not sign in with non-existent email', async () => {
            const res = await request(app).post('/api/v1/auth/signin').send({ email: 'nonexistent@example.com', password: 'Password123!' });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/v1/auth/get-info', () => {
        beforeEach(async () => {
            const res = await request(app).post('/api/v1/auth/signup').send(testUser);
            token = res.body.token;
        });

        it('should return user info for authenticated user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/get-info')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.email).toEqual(testUser.email);
        });

        it('should fail without token', async () => {
            const res = await request(app).post('/api/v1/auth/get-info');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /api/v1/auth/update-password', () => {
        beforeEach(async () => {
            const res = await request(app).post('/api/v1/auth/signup').send(testUser);
            token = res.body.token;
        });

        it('should update password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: testUser.password, newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });

            expect(res.statusCode).toEqual(200);

            const loginRes = await request(app)
                .post('/api/v1/auth/signin')
                .send({ email: testUser.email, password: 'NewPassword123!' });

            expect(loginRes.statusCode).toEqual(200);
        });

        it('should fail to update password with wrong current password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: 'WrongCurrentPassword', newPassword: 'NewPassword123!', confirmPassword: 'NewPassword123!' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/Wrong password/i);
        });

        it('should fail to update password if confirmPassword mismatch', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: testUser.password, newPassword: 'NewPassword123!', confirmPassword: 'Mismatch' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/v1/auth/refresh-token', () => {
        let refreshToken;

        beforeEach(async () => {
            const res = await request(app).post('/api/v1/auth/signup').send(testUser);
            refreshToken = res.body.refreshToken;
        });

        it('should refresh token with valid refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({ refreshToken });

            expect(res.statusCode).toEqual(200);
            expect(res.body.token).toBeDefined();
        });

        it('should fail if refresh token is missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({});

            expect(res.statusCode).toEqual(400);
        });

        it('should fail with invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh-token')
                .send({ refreshToken: 'invalidtoken' });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('404 Handling', () => {
        it('should return 404 for non-existent route', async () => {
            const res = await request(app).get('/api/v1/non-existent-route');
            expect(res.statusCode).toEqual(404);
            expect(res.body.message).toMatch(/Can't find/i);
        });
    });
});
