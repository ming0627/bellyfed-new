#!/usr/bin/env node

/**
 * This script checks for potential module compatibility issues
 * by scanning JavaScript files and comparing their import/export syntax
 * with the module type specified in package.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Patterns to identify module types
const patterns = {
  esm: [
    /\bimport\s+.*\s+from\s+['"]/,
    /\bexport\s+(?:default|const|let|var|function|class|{)/,
    /\bexport\s+\*\s+from\s+['"]/,
  ],
  commonjs: [/\brequire\s*\(['"]/, /\bmodule\.exports\b/, /\bexports\.\w+\s*=/],
};

// Find all package.json files
function findPackageJsonFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (
      entry.isDirectory() &&
      !fullPath.includes('node_modules') &&
      !fullPath.includes('.git')
    ) {
      findPackageJsonFiles(fullPath, files);
    } else if (entry.name === 'package.json') {
      files.push(fullPath);
    }
  }

  return files;
}

// Get module type from package.json
function getModuleType(packageJsonPath) {
  const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return content.type === 'module' ? 'esm' : 'commonjs';
}

// Find all JS files in a directory
function findJsFiles(dir, packageJsonPath, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (
      entry.isDirectory() &&
      !fullPath.includes('node_modules') &&
      !fullPath.includes('.git')
    ) {
      // Check if this directory has its own package.json
      const dirPackageJson = path.join(fullPath, 'package.json');
      const relevantPackageJson = fs.existsSync(dirPackageJson)
        ? dirPackageJson
        : packageJsonPath;

      findJsFiles(fullPath, relevantPackageJson, files);
    } else if (
      entry.name.endsWith('.js') &&
      !entry.name.endsWith('.config.js')
    ) {
      files.push({
        path: fullPath,
        packageJson: packageJsonPath,
      });
    }
  }

  return files;
}

// Detect module type used in a file
function detectFileModuleType(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for explicit file extensions
  if (filePath.endsWith('.mjs')) return 'esm';
  if (filePath.endsWith('.cjs')) return 'commonjs';

  // Check for ESM patterns
  for (const pattern of patterns.esm) {
    if (pattern.test(content)) return 'esm';
  }

  // Check for CommonJS patterns
  for (const pattern of patterns.commonjs) {
    if (pattern.test(content)) return 'commonjs';
  }

  return 'unknown';
}

// Main function
function checkModuleCompatibility() {
  console.log(
    `${colors.blue}Checking module compatibility...${colors.reset}\n`,
  );

  // Find all package.json files
  const packageJsonFiles = findPackageJsonFiles('.');
  console.log(`Found ${packageJsonFiles.length} package.json files`);

  let issues = 0;

  // Process each package.json and its directory
  for (const packageJsonPath of packageJsonFiles) {
    const dir = path.dirname(packageJsonPath);
    const moduleType = getModuleType(packageJsonPath);

    console.log(
      `\n${colors.blue}Checking ${dir} (${moduleType})${colors.reset}`,
    );

    // Find all JS files in this directory
    const jsFiles = findJsFiles(dir, packageJsonPath);

    // Check each JS file
    for (const file of jsFiles) {
      if (file.packageJson !== packageJsonPath) continue; // Skip files that belong to a different package.json

      const fileModuleType = detectFileModuleType(file.path);
      const relativeFilePath = path.relative('.', file.path);

      if (fileModuleType === 'unknown') {
        console.log(
          `  ${colors.yellow}⚠️  ${relativeFilePath}: Unable to determine module type${colors.reset}`,
        );
      } else if (fileModuleType !== moduleType) {
        console.log(
          `  ${colors.red}❌  ${relativeFilePath}: Using ${fileModuleType} syntax but package.json specifies ${moduleType}${colors.reset}`,
        );
        issues++;
      } else {
        console.log(`  ${colors.green}✓  ${relativeFilePath}${colors.reset}`);
      }
    }
  }

  console.log(
    `\n${issues > 0 ? colors.red : colors.green}Found ${issues} module compatibility issues${colors.reset}`,
  );

  if (issues > 0) {
    console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
    console.log(
      `1. Ensure each directory's package.json has the correct "type" field`,
    );
    console.log(
      `2. Use .mjs extension for ES modules and .cjs for CommonJS modules`,
    );
    console.log(`3. See docs/module-compatibility.md for more information`);
  }

  return issues;
}

// Run the check
const issues = checkModuleCompatibility();
process.exit(issues > 0 ? 1 : 0);
