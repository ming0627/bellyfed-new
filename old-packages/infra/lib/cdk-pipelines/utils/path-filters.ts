/**
 * Path filters for CDK Pipelines
 *
 * This file contains the path filters used to determine which pipeline should be triggered
 * based on the files that were modified in a commit.
 */

/**
 * Frontend path patterns
 * These patterns match files that should trigger the frontend pipeline
 */
export const FRONTEND_PATH_PATTERNS = ['packages/frontend/**/*', 'bellyfed/**/*', 'frontend/**/*'];

/**
 * Infrastructure path patterns
 * These patterns match files that should trigger the infrastructure pipeline
 */
export const INFRA_PATH_PATTERNS = [
    'packages/infra/**/*',
    'bellyfed-infra/**/*',
    'infra/**/*',
    'infrastructure/**/*',
];

/**
 * Shared path patterns
 * These patterns match files that should trigger both pipelines
 */
export const SHARED_PATH_PATTERNS = [
    'packages/shared/**/*',
    'shared/**/*',
    'common/**/*',
    'lib/**/*',
];

/**
 * Root path patterns
 * These patterns match files at the root of the repository that should trigger both pipelines
 */
export const ROOT_PATH_PATTERNS = [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json',
    '.npmrc',
    'README.md',
    '.github/**/*',
    'PR_DESCRIPTION_*.md',
    'tsconfig.json',
    '.eslintrc.js',
    '.prettierrc',
];

/**
 * All path patterns
 * These patterns match all files that should trigger any pipeline
 */
export const ALL_PATH_PATTERNS = [
    ...FRONTEND_PATH_PATTERNS,
    ...INFRA_PATH_PATTERNS,
    ...SHARED_PATH_PATTERNS,
    ...ROOT_PATH_PATTERNS,
];
