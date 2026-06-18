import { jest } from '@jest/globals';

// Mocking modules at the very top before app imports
jest.unstable_mockModule('cloudinary', () => ({
    v2: {
        config: jest.fn()
    }
}));

jest.unstable_mockModule('multer-storage-cloudinary', () => {
    return {
        CloudinaryStorage: jest.fn().mockImplementation(() => {
            return {
                _handleFile: (req, file, cb) => {
                    file.stream.on('data', () => {});
                    file.stream.on('end', () => {
                        cb(null, { path: `https://res.cloudinary.com/dummy-cloud/image/upload/v12345/${file.originalname}` });
                    });
                    file.stream.on('error', (err) => {
                        cb(err);
                    });
                },
                _removeFile: (req, file, cb) => {
                    cb(null);
                }
            };
        })
    };
});

// Import using dynamic await import to ensure mocks are registered first
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: mongoose } = await import('mongoose');
const { default: feedbackModel } = await import('../src/models/feedback.model.js');
const { default: userModel } = await import('../src/models/user.model.js');

describe('Feedback Endpoints & Model Validation', () => {
    const testNormalUser = {
        email: 'feedback_user@example.com',
        password: 'Password123!',
        displayName: 'Feedback Submitter',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    const testAdminUser = {
        email: 'feedback_admin@example.com',
        password: 'Password123!',
        displayName: 'Feedback Admin',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    let userToken;
    let adminToken;
    let normalUserId;

    beforeEach(async () => {
        // Create normal user
        const resNormal = await request(app).post('/api/v1/auth/signup').send(testNormalUser);
        userToken = resNormal.body.token;
        normalUserId = resNormal.body.data.id;

        // Create admin user
        const resAdmin = await request(app).post('/api/v1/auth/signup').send(testAdminUser);
        adminToken = resAdmin.body.token;
        await userModel.findByIdAndUpdate(resAdmin.body.data.id, { isAdmin: true });
    });

    describe('POST /api/v1/feedbacks - Create Feedback', () => {
        it('should fail if feedback text is empty (400)', async () => {
            const res = await request(app)
                .post('/api/v1/feedbacks')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ text: '' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Feedback text is required.');
        });

        it('should successfully submit feedback without images (201)', async () => {
            const res = await request(app)
                .post('/api/v1/feedbacks')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ text: 'This is a test feedback text.' });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.text).toEqual('This is a test feedback text.');
            expect(res.body.data.images).toEqual([]);
        });

        it('should successfully submit feedback with 1 or 2 images (201)', async () => {
            const res = await request(app)
                .post('/api/v1/feedbacks')
                .set('Authorization', `Bearer ${userToken}`)
                .field('text', 'Feedback with images')
                .attach('images', Buffer.from('mock-img-data-1'), 'pic1.png')
                .attach('images', Buffer.from('mock-img-data-2'), 'pic2.png');

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.text).toEqual('Feedback with images');
            expect(res.body.data.images).toHaveLength(2);
            expect(res.body.data.images[0]).toContain('pic1.png');
            expect(res.body.data.images[1]).toContain('pic2.png');
        });
    });

    describe('GET /api/v1/feedbacks - Admin Fetch Feedbacks', () => {
        beforeEach(async () => {
            // Seed a feedback
            const feedback = new feedbackModel({
                user: normalUserId,
                text: 'Seeded User Feedback'
            });
            await feedback.save();
        });

        it('should block non-admin from fetching feedbacks (403)', async () => {
            const res = await request(app)
                .get('/api/v1/feedbacks')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });

        it('should allow admin to fetch all feedbacks populated with user details (200)', async () => {
            const res = await request(app)
                .get('/api/v1/feedbacks')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toEqual('success');
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].text).toEqual('Seeded User Feedback');
            expect(res.body.data[0].user).toHaveProperty('displayName', testNormalUser.displayName);
            expect(res.body.data[0].user).toHaveProperty('email', testNormalUser.email);
        });
    });

    describe('Feedback Model Schema Constraints', () => {
        it('should fail mongoose validation if more than 2 images are provided', async () => {
            const invalidFeedback = new feedbackModel({
                user: normalUserId,
                text: 'Invalid feedback with 3 images',
                images: ['img1.png', 'img2.png', 'img3.png']
            });

            let error;
            try {
                await invalidFeedback.validate();
            } catch (err) {
                error = err;
            }

            expect(error).toBeDefined();
            expect(error.errors.images.message).toEqual('A maximum of 2 images are allowed per feedback.');
        });

        it('should pass mongoose validation if 2 or fewer images are provided', async () => {
            const validFeedback = new feedbackModel({
                user: normalUserId,
                text: 'Valid feedback with 2 images',
                images: ['img1.png', 'img2.png']
            });

            let error;
            try {
                await validFeedback.validate();
            } catch (err) {
                error = err;
            }

            expect(error).toBeUndefined();
        });
    });
});
