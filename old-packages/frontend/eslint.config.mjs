/**
 * Consolidated ESLint configuration for the Bellyfed frontend package
 * This file combines the rules from both eslint.config.js and eslint.config.mjs
 * Compatible with ESLint v8.57.1 and Next.js 15
 */

import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

// Comprehensive ignore patterns from both configurations
const ignores = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/out/**',
  '**/coverage/**',
  '**/*.d.ts',
  '**/src/pages/signin.tsx',
  '**/src/pages/chatbot/[id].tsx',
  '**/src/templates/DynamicCountryPageTemplate.tsx',
  '**/src/pages/profile/edit.tsx',
  '**/tailwind.config.ts',
  '.amplify/**/*',
];

// Configuration for JavaScript and TypeScript files
const tsJsConfig = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    globals: {
      ...globals.browser,
      React: 'readonly',
    },
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      project: false // Disable project to avoid tsconfig issues
    }
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off', // Since we're using TypeScript
    'react/display-name': 'off', // Not needed with TypeScript
    'react/no-unescaped-entities': 'off', // We want to use regular apostrophes
    'react/no-unknown-property': ['error', {
      ignore: ['cmdk-input-wrapper']
    }],

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    '@typescript-eslint/no-explicit-any': 'warn', // Warn instead of error to allow for gradual migration
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-empty-function': 'error',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/triple-slash-reference': 'error',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
  }
};

// Configuration for Next.js config files and scripts
const configFilesConfig = {
  files: [
    '**/*.config.js',
    '**/*.config.mjs',
    '**/scripts/**/*.js',
    '**/scripts/**/*.mjs',
  ],
  rules: {
    'no-console': 'off', // Allow console in scripts
  },
};

// Export the consolidated configuration
export default [
  {
    ignores,
  },
  tsJsConfig,
  configFilesConfig,
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
