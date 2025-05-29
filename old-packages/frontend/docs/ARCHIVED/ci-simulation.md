# CI Simulation for Bellyfed Frontend

This document explains how we ensure that local development environment matches the CI environment to prevent build failures in GitHub Actions.

## The Problem

Previously, there was a discrepancy between the local build environment and the CI environment:

1. **Local builds** were running in development mode (`NODE_ENV=development`)
2. **CI builds** were running in production mode (`NODE_ENV=production`)

This led to situations where code would build successfully locally but fail in CI, particularly with:

- Error page prerendering
- Static export configuration
- Router configuration (App vs Pages)

## The Solution

We've implemented a CI simulation system that ensures complete environment parity between local development and CI:

1. **CI Simulation Script**: `scripts/ci-build-simulation.ts` - Simulates the exact CI environment locally
2. **Build Configuration Verification**: `scripts/verify-build-config.js` - Checks for common configuration issues
3. **Pre-commit Hook**: Updated to use the CI simulation script
4. **GitHub Actions Workflow**: Updated to use the same verification steps

## How to Use

### Running CI Simulation Manually

To manually run the CI simulation:

```bash
npm run ci-build
```

This will:

1. Set the environment to production mode
2. Verify the build configuration
3. Build the project
4. Verify that error pages were generated correctly

### Pre-commit Hook

The pre-commit hook automatically runs the CI simulation before allowing commits. This ensures that your changes will pass CI before they're pushed to GitHub.

### Troubleshooting Common Issues

If the CI simulation fails, check for these common issues:

1. **Mixed Router Configuration**: Having both `src/app` and `src/pages` directories
2. **Missing Export Configuration**: Ensure `output: 'export'` is set in `next.config.js`
3. **Missing Error Pages**: Ensure all required error pages exist (`403.js`, `404.js`, `500.js`, `xml-error.js`)
4. **Missing Export Path Map**: Ensure `exportPathMap` is configured for error pages

## Best Practices

1. **Always run `npm run ci-build` before creating a PR**: This ensures your changes will pass CI
2. **Keep environments consistent**: Don't add environment-specific code that behaves differently in development vs production
3. **Test error pages locally**: Ensure all error pages render correctly in both development and production modes
4. **Update this documentation**: If you make changes to the build process, update this documentation

## Technical Details

The CI simulation script sets the following environment variables to match CI:

```javascript
process.env.NODE_ENV = 'production';
process.env.CI = 'true';
```

It then runs the same commands that CI runs:

1. Verify build configuration
2. Build the project
3. Verify error pages were generated correctly

This ensures that any issues will be caught locally before they reach CI.
