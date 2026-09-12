
import { jest } from '@jest/globals';
import * as factory from '../src/controllers/handlerFactory.js';
import AppError from '../src/utils/appError.js';

describe('handlerFactory - Unit Tests', () => {
    let mockModel, mockReq, mockRes, next;

    beforeEach(() => {
        mockModel = {
            findOneAndDelete: jest.fn(),
            findOneAndUpdate: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn()
        };
        mockReq = {
            params: { id: '123' },
            body: { name: 'Test' },
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('deleteOne', () => {
        it('should use default preFilter if not provided', async () => {
            mockModel.findOneAndDelete.mockResolvedValue({ id: '123' });

            // Call factory without second argument
            const handler = factory.deleteOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ _id: '123' });
            expect(mockRes.status).toHaveBeenCalledWith(204);
        });

        it('should return 404 if document not found in deleteOne', async () => {
            mockModel.findOneAndDelete.mockResolvedValue(null);

            const handler = factory.deleteOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('updateOne', () => {
        it('should use default preFilter if not provided and construct $set', async () => {
            mockModel.findOneAndUpdate.mockResolvedValue({ id: '123' });

            const handler = factory.updateOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123' },
                { $set: { name: 'Test' } },
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should handle updateOne when req.body is undefined', async () => {
            mockModel.findOneAndUpdate.mockResolvedValue({ id: '123' });
            mockReq.body = undefined;

            const handler = factory.updateOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123' },
                { $set: {} },
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should handle updateOne with allowedFields when req.body is undefined', async () => {
            mockModel.findOneAndUpdate.mockResolvedValue({ id: '123' });
            mockReq.body = undefined;

            const handler = factory.updateOne(mockModel, {}, ['title', 'description']);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123' },
                { $set: {} },
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should restrict updates to allowedFields when provided', async () => {
            mockModel.findOneAndUpdate.mockResolvedValue({ id: '123' });
            mockReq.body = { title: 'Allowed Title', extra: 'Ignored', user: 'hacker' };

            const handler = factory.updateOne(mockModel, {}, ['title']);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123' },
                { $set: { title: 'Allowed Title' } },
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should reject protected fields like user and update operators in updateOne', async () => {
            mockModel.findOneAndUpdate.mockResolvedValue({ id: '123' });
            mockReq.body = {
                name: 'Valid Name',
                user: 'evilUserId',
                _id: 'evilDocId',
                $set: { user: 'evilUserId' },
                $where: '1 == 1'
            };

            const handler = factory.updateOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '123' },
                { $set: { name: 'Valid Name' } },
                expect.any(Object)
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should return 404 if document not found in updateOne', async () => {
            mockModel.findOneAndUpdate.mockResolvedValue(null);

            const handler = factory.updateOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('getOne', () => {
        it('should use default preFilter and hit no-populate branch', async () => {
            const mockDoc = { id: '123' };
            const mockQuery = Promise.resolve(mockDoc);
            mockQuery.populate = jest.fn().mockReturnThis();

            mockModel.findOne.mockReturnValue(mockQuery);

            const handler = factory.getOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.findOne).toHaveBeenCalledWith({ _id: '123' });
            expect(mockQuery.populate).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockDoc
            });
        });

        it('should hit populate branch if popOptions provided', async () => {
            const mockDoc = { id: '123' };
            const mockQuery = Promise.resolve(mockDoc);
            mockQuery.populate = jest.fn().mockReturnThis();

            mockModel.findOne.mockReturnValue(mockQuery);

            const handler = factory.getOne(mockModel, 'user');
            await handler(mockReq, mockRes, next);

            expect(mockQuery.populate).toHaveBeenCalledWith('user');
        });

        it('should return 404 if document not found', async () => {
            const mockQuery = Promise.resolve(null);
            mockQuery.populate = jest.fn().mockReturnThis();
            mockModel.findOne.mockReturnValue(mockQuery);

            const handler = factory.getOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('getAll', () => {
        it('should use default preFilter if not provided', async () => {
            const mockDocs = [{ id: '1' }];
            const mockQuery = Promise.resolve(mockDocs);
            // APIFeatures calls these methods on the query
            mockQuery.find = jest.fn().mockReturnThis();
            mockQuery.sort = jest.fn().mockReturnThis();
            mockQuery.select = jest.fn().mockReturnThis();
            mockQuery.skip = jest.fn().mockReturnThis();
            mockQuery.limit = jest.fn().mockReturnThis();
            mockQuery.getFilter = jest.fn().mockReturnValue({});

            mockModel.find.mockReturnValue(mockQuery);
            mockModel.countDocuments.mockResolvedValue(1);

            const handler = factory.getAll(mockModel);
            await handler(mockReq, mockRes, next);

            expect(next).not.toHaveBeenCalled();
            expect(mockModel.find).toHaveBeenCalledWith({});
            expect(mockModel.countDocuments).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                results: 1,
                data: mockDocs
            }));
        });
    });

    describe('createOne', () => {
        it('should create a new document', async () => {
            const mockDoc = { id: '123', name: 'Test' };
            mockModel.create.mockResolvedValue(mockDoc);

            const handler = factory.createOne(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.create).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'success',
                data: mockDoc
            });
        });
    });

    describe('bulkUpdate', () => {
        it('should bulk update with default preFilter', async () => {
            mockModel.bulkWrite = jest.fn().mockResolvedValue({
                matchedCount: 1,
                modifiedCount: 1
            });
            mockReq.body = {
                updates: [
                    { id: '123', data: { name: 'Updated', user: 'hacker' } }
                ]
            };

            const handler = factory.bulkUpdate(mockModel);
            await handler(mockReq, mockRes, next);

            expect(mockModel.bulkWrite).toHaveBeenCalledWith([
                {
                    updateOne: {
                        filter: { _id: '123' },
                        update: { $set: { name: 'Updated' } }
                    }
                }
            ]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
