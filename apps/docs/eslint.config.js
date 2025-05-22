import { nextJsConfig } from 'eslint-config-custom/nextjs';
import globals from "globals";

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [".next/", ".turbo/", "node_modules/"],
  },
  ...nextJsConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    }
    // Add app-specific overrides if any, e.g.:
    // rules: {
    //   "@next/next/no-html-link-for-pages": "off"
    // }
  }
];
