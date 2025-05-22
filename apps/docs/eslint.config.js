import { nextJsConfig } from 'eslint-config-custom/nextjs';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig
  // Add app-specific overrides if any
];
