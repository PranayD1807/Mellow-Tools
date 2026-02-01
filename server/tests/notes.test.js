
import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

process.env.TOKEN_SECRET = 'testsecret';

describe('Note Endpoints', () => {
    const testUser = {
        email: 'notetest@example.com',
        password: 'Password123!',
        displayName: 'Note Test User',
        confirmPassword: 'Password123!'
    };

    let token;
    let noteId;

    beforeEach(async () => {
        const res = await request(app).post('/api/v1/auth/signup').send(testUser);
        token = res.body.token;
    });

    describe('POST /api/v1/notes', () => {
        it('should create a new note', async () => {
            const newNote = {
                title: 'My First Note',
                text: 'This is the content of the note.'
            };

            const res = await request(app)
                .post('/api/v1/notes')
                .set('Authorization', `Bearer ${token}`)
                .send(newNote);

            expect(res.statusCode).toEqual(201);
            expect(res.body.data.title).toEqual(newNote.title);
            noteId = res.body.data.id;
        });
    });

    describe('GET /api/v1/notes', () => {
        beforeEach(async () => {
            const newNote = { title: 'Note to Get', text: 'To be fetched' };
            await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(newNote);
        });

        it('should return all notes', async () => {
            const res = await request(app)
                .get('/api/v1/notes')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should return all notes sorted by title', async () => {
            const secondNote = { title: 'A Note', text: 'To be fetched' };
            await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(secondNote);

            const res = await request(app)
                .get('/api/v1/notes?sort=title')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThan(1);
            expect(res.body.data[0].title).toEqual('A Note'); // Should be first
        });

        it('should verify pagination', async () => {
            const secondNote = { title: 'B Note', text: 'To be fetched' };
            await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(secondNote);

            const res = await request(app)
                .get('/api/v1/notes?page=1&limit=1')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toEqual(1);
        });

        it('should filter notes by search query', async () => {
            const note1 = { title: 'Apple Pie', text: 'Recipe for cake' };
            const note2 = { title: 'Banana Bread', text: 'Recipe for bread' };
            await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(note1);
            await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(note2);

            const res = await request(app)
                .get('/api/v1/notes?search=apple')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].title).toContain('Apple');

            const res2 = await request(app)
                .get('/api/v1/notes?search=banana')
                .set('Authorization', `Bearer ${token}`);
            expect(res2.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res2.body.data[0].title).toContain('Banana');
        });
    });

    describe('GET /api/v1/notes/:id', () => {
        beforeEach(async () => {
            const newNote = { title: 'Note to Get', text: 'To be fetched' };
            const res = await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(newNote);
            noteId = res.body.data.id;
        });

        it('should return specific note', async () => {
            const res = await request(app)
                .get(`/api/v1/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.id).toEqual(noteId);
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/v1/notes/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
        });

        it('should not return another user\'s note', async () => {
            const otherUser = {
                email: 'other_note@example.com',
                password: 'Password123!',
                displayName: 'Other User',
                confirmPassword: 'Password123!'
            };
            const otherRes = await request(app).post('/api/v1/auth/signup').send(otherUser);
            const otherToken = otherRes.body.token;

            const res = await request(app)
                .get(`/api/v1/notes/${noteId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('PUT /api/v1/notes/:id', () => {
        beforeEach(async () => {
            const newNote = { title: 'Note to Update', text: 'To be updated' };
            const res = await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(newNote);
            noteId = res.body.data.id;
        });

        it('should update note', async () => {
            const res = await request(app)
                .patch(`/api/v1/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Title' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.title).toEqual('Updated Title');
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/v1/notes/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Title' });

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /api/v1/notes/:id', () => {
        beforeEach(async () => {
            const newNote = { title: 'Note to Delete', text: 'To be deleted' };
            const res = await request(app).post('/api/v1/notes').set('Authorization', `Bearer ${token}`).send(newNote);
            noteId = res.body.data.id;
        });

        it('should delete note', async () => {
            const res = await request(app)
                .delete(`/api/v1/notes/${noteId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(204);
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/v1/notes/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
        });
    });
});
