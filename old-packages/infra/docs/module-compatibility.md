# Module Compatibility Guide

## Overview

This document explains how to ensure compatibility between different JavaScript module systems in our project, particularly to avoid issues between local development and CI environments.

## Background

JavaScript has two main module systems:

1. **CommonJS (CJS)** - Uses `require()` and `module.exports`
2. **ECMAScript Modules (ESM)** - Uses `import` and `export` statements

Our project contains code that uses both systems, which can lead to compatibility issues if not properly configured.

## Common Issues

### Module Type Mismatch

The most common issue is a mismatch between how a file is written and how Node.js tries to interpret it:

- Files using `require()` and `module.exports` must be treated as CommonJS modules
- Files using `import` and `export` must be treated as ES modules

### Local vs CI Environment Differences

- Local environments may be more forgiving with module mismatches
- CI environments strictly enforce module type rules
- This can lead to code that works locally but fails in CI

## Best Practices

### 1. Consistent Module Type Configuration

- Each package should have a clear module type specified in its `package.json`
- Use `"type": "module"` for ES modules
- Use `"type": "commonjs"` or omit the field for CommonJS modules

### 2. File Extensions

- Use `.mjs` for ES modules regardless of package type
- Use `.cjs` for CommonJS modules regardless of package type
- Use `.js` for the default module type specified in package.json

### 3. Directory-Specific Configuration

- Different directories can have their own `package.json` with specific module type settings
- This is useful for legacy code or specific tools that require a certain module system

### 4. Testing in CI-Like Environment

Before pushing code:

- Run `npm run lint` to catch syntax issues
- Run `npm run build` to ensure the build process works
- Use the pre-commit hook to automate these checks

## Real Example from Our Project

We encountered an issue where:

- `scripts/mock-import.js` used CommonJS syntax (`require()`, `module.exports`)
- `scripts/package.json` had `"type": "module"`
- This worked locally but failed in CI with "Unexpected token" errors

The solution was to change `scripts/package.json` to use `"type": "commonjs"` to match the syntax used in the files.

## Checking Module Compatibility Locally

Run this command to check if your code will build properly in CI:

```bash
npm run build
```

If you see syntax errors related to imports or exports, check the module type configuration in the relevant package.json files.
