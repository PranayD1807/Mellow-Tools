
import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import authModel from '../src/models/auth.model.js';

describe('Coverage and Edge Case Tests', () => {
    let token;
    let userId;
    const testUser = {
        email: 'coverage@test.com',
        password: 'Password123!',
        displayName: 'Coverage User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    beforeEach(async () => {
        const res = await request(app).post('/api/v1/auth/signup').send({
            ...testUser,
            email: `coverage_${Math.random()}@test.com`
        });
        token = res.body.token;
        userId = res.body.data.id;
    });

    describe('User Controller - Encryption Migration', () => {
        it('should migrate encryption successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/migrate-encryption')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password,
                    encryptedAESKey: 'new-migrated-key',
                    passwordKeySalt: 'new-migrated-salt'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('successfully');

            const auth = await authModel.findOne({ user: userId });
            expect(auth.encryptionStatus).toBe('MIGRATED');
            expect(auth.encryptedAESKey).toBe('new-migrated-key');
        });

        it('should fail migration with wrong password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/migrate-encryption')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'WrongPassword123!',
                    encryptedAESKey: 'some-key',
                    passwordKeySalt: 'some-salt'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Wrong password');
        });

        it('should update encryption status', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-encryption-status')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    encryptionStatus: 'ENCRYPTED'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('successfully');

            const auth = await authModel.findOne({ user: userId });
            expect(auth.encryptionStatus).toBe('ENCRYPTED');
        });
    });

    describe('Handler Factory - bulkUpdate', () => {
        it('should bulk update notes', async () => {
            // Create notes inside the test because DB is cleared after each test
            const n1 = await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send({ title: 'Note 1', text: 'Text 1' });
            const n2 = await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send({ title: 'Note 2', text: 'Text 2' });
            const noteIds = [n1.body.data.id, n2.body.data.id];

            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [
                        { id: noteIds[0], data: { title: 'Updated 1' } },
                        { id: noteIds[1], data: { title: 'Updated 2' } }
                    ]
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.modifiedCount).toBe(2);
        });

        it('should fail bulk update if updates is not an array', async () => {
            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: 'not-an-array'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('array');
        });
    });
});
