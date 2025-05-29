# GitHub Workflow Guide

This document outlines the recommended workflow for contributing to the Bellyfed infrastructure repository.

## Branching Strategy

We follow a simple branching strategy:

```
main (production) ← develop (staging) ← feature branches
```

- `main`: Production code
- `develop`: Integration branch for staging
- Feature branches: Individual features and fixes

## Workflow Steps

### 1. Starting a New Feature

Always create feature branches from the latest `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/your-feature-name
```

### 2. Keeping Your Branch Updated

Regularly update your feature branch with changes from `develop`:

```bash
# While on your feature branch
git fetch origin
git merge origin/develop
# Or use rebase for a cleaner history
git rebase origin/develop
```

### 3. After Merging a PR

After a PR is merged, immediately update all other branches:

```bash
# For each active feature branch
git checkout feature/branch-name
git rebase origin/develop
git push --force-with-lease  # Be careful with force pushing
```

## Branch Protection

The `develop` and `main` branches are protected with the following rules:

1. Require status checks to pass before merging
2. Require branches to be up to date before merging
3. Require pull request reviews before merging
4. Enforce all configured restrictions for administrators

## Reusable Workflows

We use reusable GitHub Actions workflows to standardize common tasks:

- `aws-auth.yml`: Handles AWS authentication
- More to be added as needed

## Pre-Push Hook

A pre-push hook is configured to warn you if your branch is behind `develop`. This helps prevent conflicts and ensures your code works with the latest changes.

## Best Practices

1. **Small, Focused PRs**: Keep PRs small and focused on a single issue
2. **Descriptive Branch Names**: Use descriptive branch names with prefixes like `feature/`, `fix/`, `docs/`, etc.
3. **Regular Updates**: Keep your branches updated with the latest changes from `develop`
4. **Meaningful Commit Messages**: Write clear, descriptive commit messages
5. **PR Descriptions**: Include detailed descriptions in your PRs, explaining what changes were made and why

## Troubleshooting

If you encounter issues with the workflow, check the following:

1. Make sure your branch is up-to-date with `develop`
2. Ensure all required status checks are passing
3. Check that your PR has been reviewed
4. Verify that your code follows the project's coding standards
