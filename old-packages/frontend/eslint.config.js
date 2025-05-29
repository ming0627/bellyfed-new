// @ts-check
import baseConfig from '../../eslint.config.base.js';
import reactPlugin from 'eslint-plugin-react';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...baseConfig,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      'react': reactPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // General rules
      'no-console': 'off',
      'no-inner-declarations': 'off',
      'no-prototype-builtins': 'off',
      'no-empty': 'off',
      'no-process-env': 'off',
    },
    languageOptions: {
      globals: {
        React: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
];
