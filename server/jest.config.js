export default {
    testEnvironment: 'node',
    transform: {},
    setupFilesAfterEnv: ['./tests/setup.js'],
    testTimeout: 30000,
    coverageReporters: ["text", "text-summary", "lcov", "clover"],
};
