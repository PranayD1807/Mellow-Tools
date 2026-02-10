import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;



beforeAll(async () => {
    // Set default environment variables for tests if they are not already set
    process.env.TOKEN_SECRET = process.env.TOKEN_SECRET || 'test-secret-key-12345';
    process.env.NODE_ENV = process.env.NODE_ENV || 'test';

    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
});

beforeEach(() => {
    console.log(`TEST STARTING: ${expect.getState().currentTestName}`);
});
