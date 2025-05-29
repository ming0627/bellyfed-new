#!/usr/bin/env node

/**
 * This script updates all Lambda function package.json files to have consistent
 * linting and type checking configurations.
 */

const fs = require('fs');
const path = require('path');
const { execSync: _execSync } = require('child_process'); // Unused but kept for potential future use

// Get all Lambda function directories
const functionsDir = path.join(__dirname, '..', 'functions');
const functionDirs = fs
    .readdirSync(functionsDir)
    .filter((dir) => fs.statSync(path.join(functionsDir, dir)).isDirectory());

console.log(`Found ${functionDirs.length} Lambda function directories`);

// Create a consistent ESLint configuration for all Lambda functions
const eslintConfig = `/**
 * ESLint configuration for Lambda function
 */
/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "coverage/"
  ],
  rules: {
    // Allow AWS SDK specific patterns
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-require-imports": "off",
    "no-undef": "off"
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-undef": "off"
      }
    }
  ]
};
`;

// Create a consistent tsconfig.json for all Lambda functions
const tsConfig = {
    compilerOptions: {
        target: 'ES2022',
        module: 'CommonJS',
        lib: ['ES2022'],
        declaration: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: false,
        inlineSourceMap: true,
        inlineSources: true,
        experimentalDecorators: true,
        strictPropertyInitialization: false,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: '.',
        baseUrl: '.',
        paths: {
            '@utils/*': ['../../src/layers/utils/nodejs/*'],
            '@middlewares/*': ['../../src/layers/middleware/nodejs/middlewares/*'],
            '@infra/utils/*': ['../../src/layers/utils/nodejs/*'],
            '@infra/middleware/*': ['../../src/layers/middleware/nodejs/middlewares/*'],
            '@infra/lib/*': ['../../lib/*'],
            '@infra/config': ['../../lib/config.ts'],
        },
    },
    include: ['*.ts', 'src/**/*.ts'],
    exclude: ['node_modules', 'dist'],
};

// Update each Lambda function
functionDirs.forEach((dir) => {
    const functionDir = path.join(functionsDir, dir);
    const packageJsonPath = path.join(functionDir, 'package.json');
    const eslintConfigPath = path.join(functionDir, '.eslintrc.js');
    const tsConfigPath = path.join(functionDir, 'tsconfig.json');

    // Update package.json
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // Update scripts
            packageJson.scripts = {
                ...packageJson.scripts,
                lint: 'eslint .',
                'lint:strict': 'eslint . --max-warnings=0',
                'lint:fix': 'eslint . --fix',
                'type-check': 'tsc --noEmit',
                build: 'npm run type-check && esbuild index.ts --bundle --platform=node --target=node20 --outfile=dist/index.js --alias:@utils=../../src/layers/utils/nodejs --alias:@middlewares=../../src/layers/middleware/nodejs/middlewares --alias:@infra/utils=../../src/layers/utils/nodejs --alias:@infra/middleware=../../src/layers/middleware/nodejs/middlewares --alias:@infra/lib=../../lib --alias:@infra/config=../../lib/config.ts --format=cjs',
            };

            // Write updated package.json
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
            console.log(`Updated package.json in ${dir}`);
        } catch (error) {
            console.error(`Error updating package.json in ${dir}:`, error);
        }
    }

    // Write ESLint config
    fs.writeFileSync(eslintConfigPath, eslintConfig, 'utf8');
    console.log(`Updated .eslintrc.js in ${dir}`);

    // Write tsconfig.json
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2), 'utf8');
    console.log(`Updated tsconfig.json in ${dir}`);
});

console.log('All Lambda function configurations updated successfully!');
