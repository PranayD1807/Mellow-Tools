
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import userModel from '../src/models/user.model.js';
import jobApplicationModel from '../src/models/jobApplication.model.js';
import noteModel from '../src/models/note.model.js';
import jsonwebtoken from 'jsonwebtoken';

const originalEnv = process.env.NODE_ENV;

describe('Error Handling in PROD', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'PROD';
    });

    afterAll(() => {
        process.env.NODE_ENV = originalEnv;
        jest.restoreAllMocks();
    });

    let token;

    beforeEach(async () => {
        const res = await request(app).post('/api/v1/auth/signup').send({
            email: `prod_${Math.random()}@test.com`,
            password: 'Password123!',
            displayName: 'Prod User',
            confirmPassword: 'Password123!',
            passwordKeySalt: 'dummy-salt',
            encryptedAESKey: 'dummy-encrypted-key'
        });
        token = res.body.token;
    });

    it('should handle JWT Error (401) in PROD', async () => {
        const spy = jest.spyOn(jsonwebtoken, 'verify').mockImplementation(() => {
            const err = new Error('Invalid token');
            err.name = 'JsonWebTokenError';
            throw err;
        });

        const res = await request(app)
            .get('/api/v1/notes')
            .set('Authorization', 'Bearer some.token');

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toMatch(/Invalid token. Please log in again!/);
        spy.mockRestore();
    });

    it('should handle JWT Expired Error (401) in PROD', async () => {
        const spy = jest.spyOn(jsonwebtoken, 'verify').mockImplementation(() => {
            const err = new Error('Token expired');
            err.name = 'TokenExpiredError';
            throw err;
        });

        const res = await request(app)
            .get('/api/v1/notes')
            .set('Authorization', 'Bearer some.token');

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toMatch(/Your token has expired! Please log in again./);
        spy.mockRestore();
    });

    it('should handle Mongoose Validation Error (400)', async () => {
        // Mock save to throw a Mongoose validation error
        const validationError = new mongoose.Error.ValidationError();
        // validationError.name is already 'ValidationError'
        validationError.errors.email = new mongoose.Error.ValidatorError({
            path: 'email',
            type: 'required',
            message: 'Email is required'
        });

        // We need to trigger this on a real save attempt or mock one
        // Let's mock jobApplicationModel.create
        const spy = jest.spyOn(jobApplicationModel, 'create').mockRejectedValue(validationError);

        const res = await request(app)
            .post('/api/v1/job-applications')
            .set('Authorization', `Bearer ${token}`)
            .send({
                company: 'Test Co'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Email is required/i);
        spy.mockRestore();
    });

    it('should handle Duplicate Field Error (400) via Mock', async () => {
        const spy = jest.spyOn(jobApplicationModel, 'create').mockRejectedValue({
            code: 11000,
            message: 'E11000 duplicate key error collection: ... "Test Co"',
            name: 'MongoServerError'
        });

        const res = await request(app)
            .post('/api/v1/job-applications')
            .set('Authorization', `Bearer ${token}`)
            .send({
                company: 'Test Co'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Duplicate field value/);
        spy.mockRestore();
    });

    it('should handle Cast Error (400) in PROD', async () => {
        const res = await request(app)
            .get('/api/v1/notes/invalidid123') // Malformed ObjectId
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Invalid _id: invalidid123/i);
    });
});
