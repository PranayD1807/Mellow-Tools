
import request from 'supertest';
import app from '../app.js';


describe('Text Template Endpoints', () => {
    const testUser = {
        email: 'templatetest@example.com',
        password: 'Password123!',
        displayName: 'Template Test User',
        confirmPassword: 'Password123!'
    };

    let token;
    let templateId;

    beforeEach(async () => {
        const res = await request(app).post('/api/v1/auth/signup').send(testUser);
        token = res.body.token;
    });

    describe('POST /api/v1/text-templates', () => {
        it('should create a new text template', async () => {
            const newTemplate = {
                title: 'Welcome Email',
                content: 'Hello {{name}}, welcome!',
                placeholders: [{ tag: '{{name}}', defaultValue: 'Friend' }]
            };

            const res = await request(app)
                .post('/api/v1/text-templates')
                .set('Authorization', `Bearer ${token}`)
                .send(newTemplate);

            expect(res.statusCode).toEqual(201);
            templateId = res.body.data.id;
        });
    });

    describe('GET /api/v1/text-templates', () => {
        beforeEach(async () => {
            const t1 = { title: 'Greeting', content: 'Hi' };
            const t2 = { title: 'Farewell', content: 'Bye' };
            await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send(t1);
            await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send(t2);
        });

        it('should return all text templates', async () => {
            const res = await request(app)
                .get('/api/v1/text-templates')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter templates by search param', async () => {
            const res = await request(app)
                .get('/api/v1/text-templates?search=Greeting')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].title).toContain('Greeting');
        });
    });

    describe('GET /api/v1/text-templates/:id', () => {
        beforeEach(async () => {
            const newTemplate = { title: 'Get Me', content: 'Content' };
            const res = await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send(newTemplate);
            templateId = res.body.data.id;
        });

        it('should return specific text template', async () => {
            const res = await request(app)
                .get(`/api/v1/text-templates/${templateId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.id).toEqual(templateId);
        });
    });

    describe('PUT /api/v1/text-templates/:id', () => {
        beforeEach(async () => {
            const newTemplate = { title: 'Update Me', content: 'Old Content' };
            const res = await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send(newTemplate);
            templateId = res.body.data.id;
        });

        it('should update text template', async () => {
            const res = await request(app)
                .patch(`/api/v1/text-templates/${templateId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'New Content' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.content).toEqual('New Content');
        });
    });

    describe('DELETE /api/v1/text-templates/:id', () => {
        beforeEach(async () => {
            const newTemplate = {
                title: 'Template to Delete',
                content: 'Delete me',
                placeholders: []
            };
            const res = await request(app).post('/api/v1/text-templates').set('Authorization', `Bearer ${token}`).send(newTemplate);
            templateId = res.body.data.id;
        });

        it('should delete text template', async () => {
            const res = await request(app)
                .delete(`/api/v1/text-templates/${templateId}`)
                .set('Authorization', `Bearer ${token}`);

            expect([200, 204]).toContain(res.statusCode);
        });
    });
});
