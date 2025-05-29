# ESLint Configuration for Bellyfed Frontend

This document explains the ESLint configuration for the Bellyfed frontend package.

## Overview

The ESLint configuration has been consolidated into a single file (`eslint.config.mjs`) that uses ESLint's flat config format. This configuration is compatible with ESLint v8.57.1 and Next.js 15.

## Key Features

- Uses ESLint's flat config format (supported in ESLint v8.57.1+)
- Provides specialized configurations for different file types
- Implements strict TypeScript rules
- Includes React-specific rules
- Allows console logs in scripts but warns about them in application code

## Configuration Structure

The ESLint configuration is structured as follows:

```
eslint.config.mjs
├── Ignore Patterns
├── TypeScript/JavaScript Configuration
├── Config Files Configuration
├── ESLint Recommended Configuration
├── TypeScript ESLint Recommended Configuration
└── React Recommended Configuration
```

### Ignore Patterns

The following patterns are ignored by ESLint:

- `**/node_modules/**`
- `**/dist/**`
- `**/.next/**`
- `**/out/**`
- `**/coverage/**`
- `**/*.d.ts`
- Specific complex pages that are temporarily excluded

### TypeScript/JavaScript Configuration

This configuration applies to all `.js`, `.jsx`, `.ts`, and `.tsx` files and includes:

- React-specific rules
- TypeScript-specific rules
- General code quality rules

### Config Files Configuration

This configuration applies to configuration files and scripts and allows console logs.

## Running ESLint

```bash
# Run ESLint
pnpm run lint

# Run ESLint with auto-fix
pnpm run lint:fix

# Run ESLint with zero tolerance for warnings
pnpm run lint:strict
```

## Integration with Next.js

Next.js 15 has a different ESLint configuration approach. We've disabled the built-in ESLint integration in Next.js and use our own configuration instead. This is configured in `next.config.js`:

```javascript
eslint: {
  // Next.js 15 has a different ESLint configuration approach
  // We'll disable the built-in ESLint integration and use our own configuration
  ignoreDuringBuilds: true,
},
```

## Troubleshooting

If you encounter ESLint errors or warnings, you can:

1. Run `pnpm run lint:fix` to automatically fix some issues
2. Check the error message and fix the issue manually
3. Update the ESLint configuration if necessary

## Future Improvements

- Add more specific rules for different file types
- Integrate with CI/CD pipeline
- Add pre-commit hooks to run ESLint before committing
