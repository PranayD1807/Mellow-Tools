
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
    });
});
