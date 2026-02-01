
import { jest } from '@jest/globals';
import globalErrorHandler, * as handlers from '../src/controllers/error.controller.js';
import AppError from '../src/utils/appError.js';

describe('Error Handler Unit Tests', () => {
    let mockReq, mockRes, next;

    beforeEach(() => {
        mockReq = { originalUrl: '/api/v1/test' };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('Specialized Handlers', () => {
        it('handleCastErrorDB should return 400 AppError', () => {
            const err = { path: 'id', value: '123' };
            const result = handlers.handleCastErrorDB(err);
            expect(result.statusCode).toBe(400);
            expect(result.message).toContain('Invalid id: 123');
        });

        it('handleDuplicateFieldsDB should return 400 AppError', () => {
            const err = { message: 'duplicate key error index: email_1 dup key: { : "test@test.com" }' };
            const result = handlers.handleDuplicateFieldsDB(err);
            expect(result.statusCode).toBe(400);
            expect(result.message).toContain('Duplicate field value');
        });

        it('handleValidationErrorDB should return 400 AppError', () => {
            const err = { errors: { field: { message: 'Invalid field' } } };
            const result = handlers.handleValidationErrorDB(err);
            expect(result.statusCode).toBe(400);
            expect(result.message).toContain('Invalid input data');
        });

        it('handleJWTError should return 401 AppError', () => {
            const result = handlers.handleJWTError();
            expect(result.statusCode).toBe(401);
        });

        it('handleJWTExpiredError should return 401 AppError', () => {
            const result = handlers.handleJWTExpiredError();
            expect(result.statusCode).toBe(401);
        });
    });

    describe('Global Error Handler', () => {
        it('should send error in DEV mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'DEV';
            const err = new AppError('Test dev error', 400);
            globalErrorHandler(err, mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test dev error' }));
            process.env.NODE_ENV = originalEnv;
        });

        it('should send operational error in PROD mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'PROD';
            const err = new AppError('Test prod error', 400);
            globalErrorHandler(err, mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'fail',
                message: 'Test prod error'
            });
            process.env.NODE_ENV = originalEnv;
        });

        it('should send generic error for non-operational errors in PROD mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'PROD';
            const err = new Error('Secret internal error');
            globalErrorHandler(err, mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Something went very wrong!'
            });
            process.env.NODE_ENV = originalEnv;
        });

        it('should handle non-API operational error in PROD mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'PROD';
            mockReq.originalUrl = '/some-web-page';
            const err = new AppError('Web error', 400);
            globalErrorHandler(err, mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                title: 'Something went wrong!',
                msg: 'Web error'
            });
            process.env.NODE_ENV = originalEnv;
        });

        it('should handle non-API generic error in PROD mode', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'PROD';
            mockReq.originalUrl = '/some-web-page';
            const err = new Error('Secret web error');
            globalErrorHandler(err, mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                title: 'Something went wrong!',
                msg: 'Please try again later.'
            });
            process.env.NODE_ENV = originalEnv;
        });
    });
});
