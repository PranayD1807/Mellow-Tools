import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
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
            // Set user to UNENCRYPTED first to actually test migration logic
            await authModel.findOneAndUpdate({ user: userId }, {
                $unset: { encryptedAESKey: 1, passwordKeySalt: 1 },
                $set: { encryptionStatus: 'UNENCRYPTED' }
            });

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

        it('should fail to update with invalid encryption status', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-encryption-status')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    encryptionStatus: 'INVALID_STATUS'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Invalid encryption status');
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

        it('should fail bulk update if updates array is empty', async () => {
            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: []
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('non-empty array');
        });

        it('should fail bulk update if an item has no id', async () => {
            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [{ data: { title: 'No ID' } }]
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('id');
        });

        it('should fail bulk update if an item data is not an object', async () => {
            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [{ id: 'some-id', data: 'not-an-object' }]
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('plain object');
        });

        it('should fail bulk update if an item data is an array', async () => {
            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [{ id: 'some-id', data: [1, 2, 3] }]
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('plain object');
        });
        it('should bulk update bookmarks', async () => {
            const b1 = await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send({ label: 'B1', url: 'https://b1.com' });
            const b2 = await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send({ label: 'B2', url: 'https://b2.com' });

            const res = await request(app)
                .patch('/api/v1/bookmarks/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [
                        { id: b1.body.data.id, data: { label: 'Updated B1' } },
                        { id: b2.body.data.id, data: { label: 'Updated B2' } }
                    ]
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.modifiedCount).toBe(2);
        });

        it('should bulk update job applications', async () => {
            const j1 = await request(app).post('/api/v1/job-applications').set('Authorization', `Bearer ${token}`).send({ company: 'C1', role: 'R1', location: 'L1' });
            const j2 = await request(app).post('/api/v1/job-applications').set('Authorization', `Bearer ${token}`).send({ company: 'C2', role: 'R2', location: 'L2' });

            const res = await request(app)
                .patch('/api/v1/job-applications/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [
                        { id: j1.body.data.id, data: { status: 'Interviewing' } },
                        { id: j2.body.data.id, data: { status: 'Rejected' } }
                    ]
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.modifiedCount).toBe(2);
        });

        it('should bulk update text templates', async () => {
            const t1 = await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send({ title: 'T1', content: 'C1' });
            const t2 = await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send({ title: 'T2', content: 'C2' });

            const res = await request(app)
                .patch('/api/v1/text-templates/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [
                        { id: t1.body.data.id, data: { title: 'Updated T1' } },
                        { id: t2.body.data.id, data: { title: 'Updated T2' } }
                    ]
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.modifiedCount).toBe(2);
        });

        it('should strip protected fields and operators from bulk update data', async () => {
            const n1 = await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send({ title: 'Note Strip', text: 'Text' });

            const res = await request(app)
                .patch('/api/v1/notes/bulk-update')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    updates: [
                        {
                            id: n1.body.data.id,
                            data: {
                                title: 'Clean Title',
                                user: 'fake-user-id',
                                _id: 'fake-id',
                                $where: '1 == 1',
                                'profile.email': 'test@test.com'
                            }
                        }
                    ]
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.modifiedCount).toBe(1);
        });
    });

    describe('User Controller & Model Remaining Coverage', () => {
        it('should cover signup guard branches for missing encryption keys and isAdmin', async () => {
            const { signup } = await import('../src/controllers/user.controller.js');
            const next1 = jest.fn();
            await signup({ body: { email: 'test@guard.com', password: 'P1' } }, {}, next1);
            expect(next1).toHaveBeenCalledWith(expect.objectContaining({ message: 'Encryption keys are required.' }));

            const next2 = jest.fn();
            await signup({ body: { email: 'test@guard.com', password: 'P1', encryptedAESKey: 'k', passwordKeySalt: 's', isAdmin: true } }, {}, next2);
            expect(next2).toHaveBeenCalledWith(expect.objectContaining({ message: 'You cannot assign admin privileges via this API.' }));
        });

        it('should cover updatePassword when encrypted account misses keys during rotation', async () => {
            const res = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password,
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!'
                    // Missing encryptedAESKey and passwordKeySalt
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Encrypted accounts require key rotation');
        });

        it('should cover updatePassword on legacy account with and without keys', async () => {
            // Set user encryptionStatus to UNENCRYPTED
            await authModel.findOneAndUpdate({ user: userId }, {
                $set: { encryptionStatus: 'UNENCRYPTED' }
            });

            // Update with keys
            const resWithKeys = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password,
                    newPassword: 'NewPassword123!',
                    confirmNewPassword: 'NewPassword123!',
                    encryptedAESKey: 'legacy-key',
                    passwordKeySalt: 'legacy-salt'
                });

            expect(resWithKeys.statusCode).toBe(200);

            // Update without keys
            const resNoKeys = await request(app)
                .post('/api/v1/auth/update-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'NewPassword123!',
                    newPassword: 'NewPassword456!',
                    confirmNewPassword: 'NewPassword456!'
                });

            expect(resNoKeys.statusCode).toBe(200);
        });

        it('should cover migrateEncryption missing keys branch on unencrypted account', async () => {
            await authModel.findOneAndUpdate({ user: userId }, {
                $unset: { encryptedAESKey: 1, passwordKeySalt: 1 },
                $set: { encryptionStatus: 'UNENCRYPTED' }
            });

            const res = await request(app)
                .post('/api/v1/auth/migrate-encryption')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password
                    // Missing encryptedAESKey and passwordKeySalt
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Encryption keys are required for migration');
        });

        it('should cover textTemplate model toJSON when placeholders is not present', async () => {
            const { default: textTemplateModel } = await import('../src/models/textTemplate.model.js');
            const doc = new textTemplateModel({
                user: userId,
                title: 'No Placeholders',
                content: 'Plain content'
            });
            doc.placeholders = undefined;
            const json = doc.toJSON();
            expect(json.title).toBe('No Placeholders');
        });

        it('should return 404 if user not found in migrateEncryption and updateEncryptionStatus', async () => {
            const spy = jest.spyOn(authModel, 'findOne').mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            const res1 = await request(app)
                .post('/api/v1/auth/migrate-encryption')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: testUser.password,
                    encryptedAESKey: 'key',
                    passwordKeySalt: 'salt'
                });

            expect(res1.statusCode).toBe(404);

            const res2 = await request(app)
                .post('/api/v1/auth/update-encryption-status')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    encryptionStatus: 'MIGRATED'
                });

            expect(res2.statusCode).toBe(404);
            spy.mockRestore();
        });
    });
});
