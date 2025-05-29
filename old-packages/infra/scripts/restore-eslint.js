#!/usr/bin/env node

/**
 * Script to restore ESLint for the infra package
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Path to the package.json file
const packageJsonPath = path.join(rootDir, 'package.json');

// Read the package.json file
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Restore the original lint:strict script
if (packageJson.scripts['lint:strict:original']) {
    packageJson.scripts['lint:strict'] = packageJson.scripts['lint:strict:original'];
    delete packageJson.scripts['lint:strict:original'];
}

// Write the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

console.log('ESLint restored for infra package');
