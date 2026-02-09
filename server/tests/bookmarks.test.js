
import request from 'supertest';
import app from '../app.js';


describe('Bookmark Endpoints', () => {
    const testUser = {
        email: 'bookmarktest@example.com',
        password: 'Password123!',
        displayName: 'Bookmark Test User',
        confirmPassword: 'Password123!',
        passwordKeySalt: 'dummy-salt',
        encryptedAESKey: 'dummy-encrypted-key'
    };

    let token;
    let bookmarkId;

    beforeEach(async () => {
        const res = await request(app).post('/api/v1/auth/signup').send(testUser);
        token = res.body.token;
    });

    describe('POST /api/v1/bookmarks', () => {
        it('should create a new bookmark', async () => {
            const newBookmark = {
                label: 'My Bookmark',
                url: 'https://example.com'
            };

            const res = await request(app)
                .post('/api/v1/bookmarks')
                .set('Authorization', `Bearer ${token}`)
                .send(newBookmark);

            expect(res.statusCode).toEqual(201);
            bookmarkId = res.body.data.id;
        });
    });

    describe('GET /api/v1/bookmarks', () => {
        beforeEach(async () => {
            const b1 = { label: 'Google', url: 'https://google.com' };
            const b2 = { label: 'Yahoo', url: 'https://yahoo.com' };
            await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send(b1);
            await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send(b2);
        });

        it('should return all bookmarks', async () => {
            const res = await request(app)
                .get('/api/v1/bookmarks')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter bookmarks by search param', async () => {
            const res = await request(app)
                .get('/api/v1/bookmarks?search=Google')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].label).toContain('Google');
        });
    });

    describe('GET /api/v1/bookmarks/:id', () => {
        beforeEach(async () => {
            const newBookmark = { label: 'Get Me', url: 'https://get.com' };
            const res = await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send(newBookmark);
            bookmarkId = res.body.data.id;
        });

        it('should return specific bookmark', async () => {
            const res = await request(app)
                .get(`/api/v1/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.id).toEqual(bookmarkId);
        });
    });

    describe('PUT /api/v1/bookmarks/:id', () => {
        beforeEach(async () => {
            const newBookmark = { label: 'Update Me', url: 'https://update.com' };
            const res = await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send(newBookmark);
            bookmarkId = res.body.data.id;
        });

        it('should update bookmark', async () => {
            const res = await request(app)
                .patch(`/api/v1/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ label: 'Updated Label' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.label).toEqual('Updated Label');
        });
    });

    describe('DELETE /api/v1/bookmarks/:id', () => {
        beforeEach(async () => {
            const newBookmark = { label: 'Bookmark to Delete', url: 'https://deleteme.com' };
            const res = await request(app).post('/api/v1/bookmarks').set('Authorization', `Bearer ${token}`).send(newBookmark);
            bookmarkId = res.body.data.id;
        });

        it('should delete bookmark', async () => {
            const res = await request(app)
                .delete(`/api/v1/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${token}`);

            expect([200, 204]).toContain(res.statusCode);
        });
    });
});
