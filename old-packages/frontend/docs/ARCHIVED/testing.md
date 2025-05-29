# Testing Guide for BellyFed

## Overview

This document outlines the testing strategy and practices for the BellyFed project.

## Test Types

### 1. Unit Tests

Located in `__tests__/` directory, matching the source directory structure.

- Test individual components and functions in isolation
- Mock external dependencies
- Focus on single responsibility

### 2. Integration Tests

Located in `__tests__/integration/`

- Test interactions between components
- Test complete features end-to-end
- Focus on user flows

## Test Coverage

We maintain high test coverage with the following thresholds:

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Coverage reports are generated in the `coverage` directory.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.ts
```

## Test Structure

### Unit Test Example

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Integration Test Example

```typescript
describe('FeatureFlow', () => {
  it('completes the entire flow successfully', async () => {
    // Setup
    // Execute flow
    // Verify results
  });
});
```

## Key Testing Patterns

### 1. Authentication Testing

- Test both authenticated and unauthenticated states
- Test token refresh flows
- Test error scenarios

Example:

```typescript
it('handles authentication failure', async () => {
  // Mock auth failure
  // Attempt protected action
  // Verify error handling
});
```

### 2. API Testing

- Test successful requests
- Test error responses
- Test retry logic
- Test timeout scenarios

Example:

```typescript
it('retries failed requests', async () => {
  // Mock failed then successful response
  // Make request
  // Verify retry behavior
});
```

### 3. Component Testing

- Test rendering
- Test user interactions
- Test state changes
- Test error boundaries

Example:

```typescript
it('updates on user interaction', async () => {
  // Render component
  // Simulate user action
  // Verify state update
});
```

## Mocking

### 1. API Mocks

```typescript
jest.mock('@/services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
```

### 2. Authentication Mocks

```typescript
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: jest.fn(),
  signOut: jest.fn(),
}));
```

### 3. Next.js Mocks

```typescript
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
```

## Best Practices

1. **Arrange-Act-Assert Pattern**

   ```typescript
   it('test description', () => {
     // Arrange
     const input = 'test';

     // Act
     const result = someFunction(input);

     // Assert
     expect(result).toBe('expected');
   });
   ```

2. **Descriptive Test Names**

   ```typescript
   // Good
   it('displays error message when API call fails', async () => {});

   // Bad
   it('handles error', async () => {});
   ```

3. **Clean Setup/Teardown**

   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });

   afterEach(() => {
     cleanup();
   });
   ```

4. **Avoid Test Interdependence**

   - Each test should be independent
   - Reset state between tests
   - Don't share mutable state

5. **Test Edge Cases**
   ```typescript
   it('handles empty input', () => {});
   it('handles maximum length input', () => {});
   it('handles special characters', () => {});
   ```

## Common Issues and Solutions

1. **Async Testing**

   ```typescript
   // Wrong
   it('tests async code', () => {
     asyncFunction().then((result) => {
       expect(result).toBe('expected');
     });
   });

   // Correct
   it('tests async code', async () => {
     const result = await asyncFunction();
     expect(result).toBe('expected');
   });
   ```

2. **Component Updates**

   ```typescript
   // Use waitFor for async updates
   await waitFor(() => {
     expect(screen.getByText('Updated')).toBeInTheDocument();
   });
   ```

3. **Event Handling**
   ```typescript
   // Simulate user events
   fireEvent.click(button);
   // Wait for effects
   await waitFor(() => {
     expect(handleClick).toHaveBeenCalled();
   });
   ```

## Continuous Integration

Tests are run in CI/CD pipeline:

- On pull requests
- Before deployment
- Nightly for all branches

Coverage reports are generated and stored as artifacts.

## Adding New Tests

1. Create test file matching source file structure
2. Import necessary testing utilities
3. Write tests following patterns above
4. Run tests locally
5. Verify coverage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
