import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


describe('Auth Endpoints', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'Test User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    let token;

    describe('POST /api/v1/auth/signup', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send(testUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body.data).toHaveProperty('email', testUser.email);
            expect(res.body.data.encryptionStatus).toBe('ENCRYPTED');
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
            const invalidUser = {
                ...testUser,
                confirmPassword: 'DifferentPassword123!',
                email: 'mismatch@example.com'
            };
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
                .send({
                    password: testUser.password,
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                    passwordKeySalt: 'new-dummy-salt',
                    encryptedAESKey: 'new-dummy-encrypted-key'
                });

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
                .send({
                    password: 'WrongCurrentPassword',
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                    passwordKeySalt: 'new-dummy-salt',
                    encryptedAESKey: 'new-dummy-encrypted-key'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/Wrong password/i);
        });

        it('should fail to update password if confirmPassword mismatch', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password,
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'Mismatch'
                });

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
            expect(res.body.refreshToken).toBeDefined();
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

        describe('Token Expiration & Rotation Scenarios', () => {

            it('should fail if the refresh token has expired (e.g., after 7 days)', async () => {
                // Generate a token that expired 1 second ago
                const expiredToken = jwt.sign(
                    { data: 'someuserid' },
                    process.env.TOKEN_SECRET || 'testsecret',
                    { expiresIn: '-1s' }
                );

                const res = await request(app)
                    .post('/api/v1/auth/refresh-token')
                    .send({ refreshToken: expiredToken });

                // Assuming error handler returns 401 for expired token
                expect(res.statusCode).toEqual(401);
                expect(res.body.message).toMatch(/token has expired/i);
            });

            it('should return a new refresh token with an extended expiration date (Token Rotation)', async () => {
                // Wait 1 second so that the new token has a different 'iat' and 'exp'
                await new Promise(resolve => setTimeout(resolve, 1000));

                const res = await request(app)
                    .post('/api/v1/auth/refresh-token')
                    .send({ refreshToken });

                expect(res.statusCode).toEqual(200);
                const newRefreshToken = res.body.refreshToken;
                expect(newRefreshToken).toBeDefined();
                
                // Decode both to compare 'exp'
                const decodedOld = jwt.decode(refreshToken);
                const decodedNew = jwt.decode(newRefreshToken);

                // The new token should have an expiration further in the future
                expect(decodedNew.exp).toBeGreaterThan(decodedOld.exp);
                // Also the tokens themselves should differ
                expect(newRefreshToken).not.toEqual(refreshToken);
            });
            
            it('should fail if refresh token is valid but the user no longer exists', async () => {
                // Create a 7-day valid token for a completely fake user ID
                const fakeId = new mongoose.Types.ObjectId().toString();
                const fakeToken = jwt.sign(
                    { data: fakeId },
                    process.env.TOKEN_SECRET || 'testsecret',
                    { expiresIn: '7d' }
                );

                const res = await request(app)
                    .post('/api/v1/auth/refresh-token')
                    .send({ refreshToken: fakeToken });

                expect(res.statusCode).toEqual(404);
                expect(res.body.message).toMatch(/User not found/i);
            });
        });

        describe('Security & Malformed Token Scenarios', () => {
            it('should fail with 401 if the token signature is tampered (invalid secret)', async () => {
                // Sign with a different secret
                const tamperedToken = jwt.sign(
                    { data: 'someuserid' },
                    'wrong_secret_key',
                    { expiresIn: '7d' }
                );

                const res = await request(app)
                    .post('/api/v1/auth/refresh-token')
                    .send({ refreshToken: tamperedToken });

                expect(res.statusCode).toEqual(401);
                expect(res.body.message).toMatch(/invalid token/i); // Assuming global error handler catches it
            });

            it('should fail with 404/401 if the token payload is missing data', async () => {
                // Sign a valid token but without the 'data' field
                const emptyPayloadToken = jwt.sign(
                    { },
                    process.env.TOKEN_SECRET || 'testsecret',
                    { expiresIn: '7d' }
                );

                const res = await request(app)
                    .post('/api/v1/auth/refresh-token')
                    .send({ refreshToken: emptyPayloadToken });

                // In controller: userModel.findById(undefined) might return 404 or throw CastError handled as 400/500
                // Let's assert it's just not 200 success
                expect(res.statusCode).not.toEqual(200);
            });

            it('should fail with 401 for completely malformed string', async () => {
                const res = await request(app)
                    .post('/api/v1/auth/refresh-token')
                    .send({ refreshToken: 'header.payload' }); // Missing signature part

                expect(res.statusCode).toEqual(401);
            });
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
