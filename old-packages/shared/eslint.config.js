/**
 * Shared package ESLint configuration for the Bellyfed application
 * Extremely minimal configuration for ESLint v8.57.1
 */

// Ignore patterns
const ignores = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/*.d.ts',
  '**/src/**', // Temporarily ignore all TypeScript files in src directory
];

// Minimal configuration for JavaScript files
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
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
};

// Export the configuration
export default [
  {
    ignores,
  },
  jsConfig,
];
