# Pre-commit Hooks

This document describes the pre-commit hooks set up for the Bellyfed project.

## Overview

Pre-commit hooks run automatically before each commit to ensure code quality and prevent issues from being committed to the repository. Our pre-commit hooks perform the following checks:

1. **Linting**: Checks code style and catches potential errors
2. **Module Compatibility**: Ensures all modules are compatible with our project setup
3. **Build Verification**: Makes sure the project builds successfully

## How It Works

We use [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged) to manage our pre-commit hooks.

- **Husky**: Sets up Git hooks
- **lint-staged**: Runs linters only on staged files

## Configuration

### Husky Configuration

The Husky configuration is in the `.husky/pre-commit` file. It runs the following commands:

```bash
npm run lint-staged
npm run check-modules
npm run build
```

### lint-staged Configuration

The lint-staged configuration is in the `package.json` file:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

## Troubleshooting

If the pre-commit hooks fail, you'll see an error message explaining what went wrong. Here are some common issues and how to fix them:

### ESLint Errors

If ESLint finds issues in your code, it will show you the errors and warnings. Fix these issues before committing.

```bash
# Run ESLint manually to check for issues
npm run lint
```

### Module Compatibility Issues

If there are module compatibility issues, check the error message for details. You might need to update imports or dependencies.

```bash
# Run module compatibility check manually
npm run check-modules
```

### Build Failures

If the build fails, check the error message for details. Common issues include:

- TypeScript errors
- Import errors
- Configuration issues

```bash
# Run build manually
npm run build
```

## Skipping Hooks

In rare cases, you might need to skip the pre-commit hooks. You can do this with the `--no-verify` flag:

```bash
git commit -m "Your commit message" --no-verify
```

**Note**: This should only be used in exceptional circumstances. Always try to fix the issues instead of bypassing the hooks.

## Local Development

When setting up the project locally, the hooks will be installed automatically when you run:

```bash
npm install
```

This is handled by the `prepare` script in `package.json`.
