/**
 * ESLint configuration for Lambda function
 * Using flat config format (ESLint v8.57.1 compatible)
 */

// Ignore patterns
const ignores = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/*.d.ts'];

// Configuration for TypeScript files
const tsConfig = {
    files: ['**/*.ts'],
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: (await import('@typescript-eslint/parser')).default,
        parserOptions: {
            project: './tsconfig.json',
        },
    },
    plugins: {
        '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default,
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
        'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
    },
};

// Configuration for JavaScript files
const jsConfig = {
    files: ['**/*.js'],
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    rules: {
        'no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
    },
};

// Export the configuration
export default [
    {
        ignores,
    },
    tsConfig,
    jsConfig,
];
