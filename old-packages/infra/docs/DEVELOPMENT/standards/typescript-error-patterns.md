# TypeScript Error Patterns

**Document Type:** DEV
**Last Updated:** December 2024
**Owner:** Frontend Team
**Reviewers:** Development Team

## Overview

This document records common patterns of TypeScript errors found in the Bellyfed codebase and how to fix them.

## Toast Notification Issues

### Problem

The toast notification API has changed, but many files still use the old API. The main issues are:

1. Using `title` instead of `message`
2. Using `description` property which is no longer supported
3. Using `variant` instead of `type`
4. Using `destructive` variant instead of `error` type

### Solution

- Replace `title` with `message`
- Remove or comment out `description` properties
- Replace `variant` with `type`
- Replace `variant: "destructive"` with `type: "error"`

### Example

```typescript
// Before
toast({
    title: 'Restaurant created',
    description: 'The restaurant has been created successfully',
    variant: 'destructive',
});

// After
toast({
    message: 'Restaurant created',
    // description property removed
    type: 'error',
});
```

## Event Handler Type Mismatches

### Problem

Event handler type mismatches are common, especially with form submissions and button clicks. The main issues are:

1. Using `React.FormEvent` instead of `React.FormEvent<HTMLFormElement>`
2. Using `React.MouseEvent` instead of `React.MouseEvent<HTMLButtonElement>`
3. Not specifying the generic type parameter for event handlers

### Solution

- Use specific event types with generic type parameters
- Use the correct element type for the event
- Use type assertions when necessary

### Example

```typescript
// Before
const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // ...
};

// After
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // ...
};
```

## Nested Comment Patterns

### Problem

Nested comment patterns in TypeScript files can cause syntax errors. The main issue is:

1. Using nested comments like `/* /* description: 'text' */ */`

### Solution

- Convert nested comments to proper property assignments
- Use single-line comments instead of multi-line comments
- Use template literals for complex strings

### Example

```typescript
// Before
const config = {
  /* /* description: 'This is a description' */ */
  name: 'example',
};

// After
const config = {
  description: 'This is a description',
  name: 'example',
};
```

## Infrastructure Package Issues

The infrastructure package has several TypeScript errors related to missing AWS SDK modules and implicit any types. These issues are outside the scope of the frontend TypeScript fixes.

## Maintenance Scripts

We've created several scripts to help maintain TypeScript type correctness:

1. `typescript-maintenance.js`: A comprehensive script that can check for and fix common TypeScript issues
2. `fix-toast-descriptions.js`: A targeted script to fix toast notification description issues
3. `fix-restaurant-management.js`: A targeted script to fix nested comments in the restaurant-management.tsx file

These scripts can be run regularly to catch and fix TypeScript issues before they cause build failures.

## Best Practices

1. **Use Specific Types**: Always use specific types instead of generic types
2. **Avoid Any**: Avoid using `any` type whenever possible
3. **Use Type Assertions Sparingly**: Use type assertions only when necessary
4. **Keep Up with API Changes**: Update code to match API changes
5. **Run Type Checking Regularly**: Run `pnpm type-check` regularly to catch issues early
6. **Use ESLint with TypeScript Rules**: Configure ESLint with TypeScript rules
7. **Document Type Patterns**: Document common type patterns for reuse

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint TypeScript Plugin](https://github.com/typescript-eslint/typescript-eslint)
