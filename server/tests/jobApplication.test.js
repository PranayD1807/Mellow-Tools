
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';


describe('Job Application Endpoints', () => {
    const testUser = {
        email: 'jobtest@example.com',
        password: 'Password123!',
        displayName: 'Job Test User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    let token;
    let jobId;

    beforeEach(async () => {
        const res = await request(app).post('/api/v1/auth/signup').send(testUser);
        token = res.body.token;
    });

    describe('POST /api/v1/job-applications', () => {
        it('should create a new job application', async () => {
            const newJob = {
                company: 'Test Corp',
                role: 'Developer',
                location: 'Remote',
                status: 'Applied',
                interviewStage: 'Screening',
                nextInterviewDate: new Date().toISOString()
            };

            const res = await request(app)
                .post('/api/v1/job-applications')
                .set('Authorization', `Bearer ${token}`)
                .send(newJob);

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.company).toEqual(newJob.company);
            expect(res.body.data.interviewStage).toEqual(newJob.interviewStage);

            jobId = res.body.data.id; // Save for later tests
        });

        it('should fail validation if required fields missing', async () => {
            const res = await request(app)
                .post('/api/v1/job-applications')
                .set('Authorization', `Bearer ${token}`)
                .send({ company: 'Incomplete' });

            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /api/v1/job-applications', () => {
        beforeEach(async () => {
            const newJob = { company: 'Test Corp', role: 'Dev', location: 'Remote', status: 'Applied', interviewStage: 'Screening' };
            await request(app).post('/api/v1/job-applications').set('Authorization', `Bearer ${token}`).send(newJob);
        });

        it('should return all job applications for user', async () => {
            const res = await request(app)
                .get('/api/v1/job-applications')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body.data)).toBeTruthy();
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/job-applications/:id', () => {
        beforeEach(async () => {
            const newJob = { company: 'Test Corp 2', role: 'Dev', location: 'Remote', status: 'Applied', interviewStage: 'Screening' };
            const res = await request(app).post('/api/v1/job-applications').set('Authorization', `Bearer ${token}`).send(newJob);
            jobId = res.body.data.id;
        });

        it('should return specific job application', async () => {
            const res = await request(app)
                .get(`/api/v1/job-applications/${jobId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.id).toEqual(jobId);
        });

        it('should return 404 for non-existent job', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/v1/job-applications/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
        });

        it('should not return another user\'s job application', async () => {
            const otherUser = {
                email: 'other2@example.com',
                password: 'Password123!',
                displayName: 'Other User 2',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            };
            const otherRes = await request(app).post('/api/v1/auth/signup').send(otherUser);
            const otherToken = otherRes.body.token;

            const res = await request(app)
                .get(`/api/v1/job-applications/${jobId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/v1/job-applications/:id', () => {
        beforeEach(async () => {
            const newJob = { company: 'Test Corp Update', role: 'Dev', location: 'Remote', status: 'Applied', interviewStage: 'Screening' };
            const res = await request(app).post('/api/v1/job-applications').set('Authorization', `Bearer ${token}`).send(newJob);
            jobId = res.body.data.id;
        });

        it('should update job application', async () => {
            const updateData = { status: 'Interviewing', interviewStage: 'Technical' };
            const res = await request(app)
                .patch(`/api/v1/job-applications/${jobId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.status).toEqual('Interviewing');
            expect(res.body.data.interviewStage).toEqual('Technical');
        });

        it('should return 404 for non-existent job application', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/v1/job-applications/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ status: 'Interviewing' });

            expect(res.statusCode).toEqual(404);
        });

        it('not update another user\'s job application', async () => {
            const otherUser = {
                email: 'other@example.com',
                password: 'Password123!',
                displayName: 'Other User',
                confirmPassword: 'Password123!',
                passwordKeySalt: 'dummy-salt',
                encryptedAESKey: 'dummy-encrypted-key'
            };
            const otherRes = await request(app).post('/api/v1/auth/signup').send(otherUser);
            const otherToken = otherRes.body.token;

            const res = await request(app)
                .patch(`/api/v1/job-applications/${jobId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ status: 'Rejected' });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/v1/job-applications/:id', () => {
        beforeEach(async () => {
            const newJob = { company: 'Test Corp Delete', role: 'Dev', location: 'Remote', status: 'Applied', interviewStage: 'Screening' };
            const res = await request(app).post('/api/v1/job-applications').set('Authorization', `Bearer ${token}`).send(newJob);
            jobId = res.body.data.id;
        });

        it('should delete job application', async () => {
            const res = await request(app)
                .delete(`/api/v1/job-applications/${jobId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(204);

            const getRes = await request(app)
                .get(`/api/v1/job-applications/${jobId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(getRes.statusCode).toEqual(404);
        });
    });

    describe('GET /api/v1/job-applications/stats', () => {
        it('should return job application statistics', async () => {
            const jobs = [
                { company: 'Company A', role: 'Role A', status: 'Applied', location: 'Remote', interviewStage: 'Screening' },
                { company: 'Company B', role: 'Role B', status: 'Interviewing', location: 'Remote', interviewStage: 'Technical' },
                { company: 'Company C', role: 'Role C', status: 'Applied', location: 'Remote', interviewStage: 'Screening' }
            ];

            for (const job of jobs) {
                await request(app)
                    .post('/api/v1/job-applications')
                    .set('Authorization', `Bearer ${token}`)
                    .send(job);
            }

            const res = await request(app)
                .get('/api/v1/job-applications/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('total', 3);
            expect(res.body.data).toHaveProperty('Applied', 2);
            expect(res.body.data).toHaveProperty('Interviewing', 1);
            expect(res.body.data).toHaveProperty('Offer', 0);
            expect(res.body.data).toHaveProperty('Rejected', 0);
        });

        describe('date range', () => {
            const day = (d) => `2026-01-${d}T12:00:00.000Z`;
            const auth = () => ({ Authorization: `Bearer ${token}` });

            beforeEach(async () => {
                const jobs = [
                    { company: 'A', status: 'Applied', appliedOn: day('05') },
                    { company: 'B', status: 'Interviewing', appliedOn: day('15') },
                    { company: 'C', status: 'Offer', appliedOn: day('25') },
                ];
                for (const j of jobs) {
                    await request(app).post('/api/v1/job-applications').set(auth())
                        .send({ ...j, role: 'Dev', location: 'Remote' });
                }
            });

            it('lists within a bounded range', async () => {
                const res = await request(app).get('/api/v1/job-applications')
                    .query({ startDate: '2026-01-10', endDate: '2026-01-20' }).set(auth());
                expect(res.statusCode).toEqual(200);
                expect(res.body.data.map(j => j.company)).toEqual(['B']);
            });

            it('lists with start-only and end-only ranges', async () => {
                const s = await request(app).get('/api/v1/job-applications')
                    .query({ startDate: '2026-01-10' }).set(auth());
                expect(s.body.totalResults).toEqual(2);
                const e = await request(app).get('/api/v1/job-applications')
                    .query({ endDate: '2026-01-15' }).set(auth());
                expect(e.body.totalResults).toEqual(2);
            });

            it('treats a date-only endDate as inclusive end of day', async () => {
                const res = await request(app).get('/api/v1/job-applications')
                    .query({ startDate: '2026-01-15', endDate: '2026-01-15' }).set(auth());
                expect(res.body.data.map(j => j.company)).toEqual(['B']);
            });

            it('composes with the status filter', async () => {
                const res = await request(app).get('/api/v1/job-applications')
                    .query({ startDate: '2026-01-01', status: 'Offer' }).set(auth());
                expect(res.body.data.map(j => j.company)).toEqual(['C']);
            });

            it('scopes stats to the range', async () => {
                const res = await request(app).get('/api/v1/job-applications/stats')
                    .query({ startDate: '2026-01-01', endDate: '2026-01-20' }).set(auth());
                expect(res.statusCode).toEqual(200);
                expect(res.body.data).toEqual({ total: 2, Applied: 1, Interviewing: 1, Offer: 0, Rejected: 0 });
            });

            it('returns zeroes for an empty range', async () => {
                const res = await request(app).get('/api/v1/job-applications/stats')
                    .query({ startDate: '2025-01-01', endDate: '2025-01-31' }).set(auth());
                expect(res.body.data).toEqual({ total: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 });
            });

            it('returns 400 for invalid dates and inverted ranges', async () => {
                for (const path of ['/api/v1/job-applications', '/api/v1/job-applications/stats']) {
                    const bad = await request(app).get(path).query({ startDate: 'not-a-date' }).set(auth());
                    expect(bad.statusCode).toEqual(400);
                    const inv = await request(app).get(path)
                        .query({ startDate: '2026-02-01', endDate: '2026-01-01' }).set(auth());
                    expect(inv.statusCode).toEqual(400);
                }
            });
        });
    });
});
