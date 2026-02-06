
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import otplib from 'otplib';
const { authenticator } = otplib;


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

    describe('2FA Flows', () => {
        beforeEach(async () => {
            const res = await request(app).post('/api/v1/auth/signup').send(testUser);
            token = res.body.token;
        });

        it('should generate 2FA secret', async () => {
            const res = await request(app)
                .post('/api/v1/auth/2fa/generate')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.secret).toBeDefined();
            expect(res.body.data.qrCode).toBeDefined();
        });

        it('should enable 2FA with valid token', async () => {
            // Generate first
            const genRes = await request(app)
                .post('/api/v1/auth/2fa/generate')
                .set('Authorization', `Bearer ${token}`);
            const secret = genRes.body.data.secret;

            // Verify
            const { authenticator } = await import('otplib');
            const otp = authenticator.generate(secret);

            const res = await request(app)
                .post('/api/v1/auth/2fa/verify')
                .set('Authorization', `Bearer ${token}`)
                .send({ token: otp });

            expect(res.statusCode).toEqual(200);
        });

        it('should require 2FA on login when enabled', async () => {
            // Generate & Enable
            const genRes = await request(app).post('/api/v1/auth/2fa/generate').set('Authorization', `Bearer ${token}`);
            const secret = genRes.body.data.secret;
            const { authenticator } = await import('otplib');
            const otp = authenticator.generate(secret);
            await request(app).post('/api/v1/auth/2fa/verify').set('Authorization', `Bearer ${token}`).send({ token: otp });

            // Login
            const res = await request(app).post('/api/v1/auth/signin').send({ email: testUser.email, password: testUser.password });
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('2fa_required');
            expect(res.body.userId).toBeDefined();
        });

        it('should validate 2FA and login', async () => {
            // Enable 2FA
            const genRes = await request(app).post('/api/v1/auth/2fa/generate').set('Authorization', `Bearer ${token}`);
            const secret = genRes.body.data.secret;
            const { authenticator } = await import('otplib');
            const otp = authenticator.generate(secret);
            await request(app).post('/api/v1/auth/2fa/verify').set('Authorization', `Bearer ${token}`).send({ token: otp });

            // Login first step
            const loginRes = await request(app).post('/api/v1/auth/signin').send({ email: testUser.email, password: testUser.password });
            const userId = loginRes.body.userId;

            // Validate 2FA
            const otp2 = authenticator.generate(secret);
            const validateRes = await request(app).post('/api/v1/auth/2fa/validate').send({ userId, token: otp2 });

            expect(validateRes.statusCode).toEqual(200);
            expect(validateRes.body.token).toBeDefined();
        });

        it('should disable 2FA', async () => {
            // Enable 2FA
            const genRes = await request(app).post('/api/v1/auth/2fa/generate').set('Authorization', `Bearer ${token}`);
            const secret = genRes.body.data.secret;
            const { authenticator } = await import('otplib');
            const otp = authenticator.generate(secret);
            await request(app).post('/api/v1/auth/2fa/verify').set('Authorization', `Bearer ${token}`).send({ token: otp });

            // Disable
            const disableRes = await request(app).post('/api/v1/auth/2fa/disable').set('Authorization', `Bearer ${token}`);
            expect(disableRes.statusCode).toEqual(200);

            // Login should not require 2FA
            const res = await request(app).post('/api/v1/auth/signin').send({ email: testUser.email, password: testUser.password });
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
        });
    });
});
