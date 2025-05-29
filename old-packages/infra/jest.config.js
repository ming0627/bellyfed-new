module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test', '<rootDir>/functions'],
    testMatch: ['**/*.test.ts'],
    testPathIgnorePatterns: ['<rootDir>/test/integration/'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
