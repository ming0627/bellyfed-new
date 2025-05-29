# Integration Tests

Integration tests have been temporarily disabled due to environment configuration issues.

The tests in this directory require:

1. A running API endpoint
2. Valid API keys
3. Test data in the database

## Re-enabling Tests

To re-enable these tests:

1. Update the pre-commit hook in `.husky/pre-commit` to run tests
2. Remove the `testPathIgnorePatterns` entry in `jest.config.js`
3. Ensure proper environment variables are set:
    - `NEXT_PUBLIC_API_URL`
    - `NEXT_PUBLIC_API_KEY`
