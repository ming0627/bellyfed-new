import { jest } from '@jest/globals';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Verify required environment variables
const requiredEnvVars = ['API_KEY', 'API_URL'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        throw new Error(`Required environment variable ${envVar} is not set`);
    }
});
