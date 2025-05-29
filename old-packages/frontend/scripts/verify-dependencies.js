#!/usr/bin/env node

/**
 * This script verifies that all dependencies referenced in package.json scripts
 * actually exist in the npm registry.
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

// Main function
async function verifyDependencies() {
  console.log(`${colors.blue}Verifying dependencies...${colors.reset}\n`);

  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Extract all npm commands from scripts
  const scripts = packageJson.scripts || {};
  const npmCommands = new Set();

  for (const [name, script] of Object.entries(scripts)) {
    // Extract all npx commands
    const npxMatches = script.match(/npx\s+([a-zA-Z0-9_-]+)/g) || [];
    for (const match of npxMatches) {
      const command = match.split(/\s+/)[1];
      npmCommands.add(command);
    }
  }

  console.log(`Found ${npmCommands.size} npm commands in scripts`);

  // Check if each command exists in dependencies or devDependencies
  const allDependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  let issues = 0;

  for (const command of npmCommands) {
    if (command in allDependencies) {
      console.log(
        `  ${colors.green}✓  ${command} is in dependencies${colors.reset}`,
      );
    } else {
      // Check if the package exists in the npm registry
      try {
        execSync(`npm view ${command} version`, { stdio: 'ignore' });
        console.log(
          `  ${colors.yellow}⚠️  ${command} exists in npm registry but is not in dependencies${colors.reset}`,
        );
      } catch (error) {
        console.log(
          `  ${colors.red}❌  ${command} is not in dependencies and does not exist in npm registry${colors.reset}`,
        );
        issues++;
      }
    }
  }

  console.log(
    `\n${issues > 0 ? colors.red : colors.green}Found ${issues} dependency issues${colors.reset}`,
  );

  if (issues > 0) {
    console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
    console.log(`1. Add missing dependencies to package.json`);
    console.log(`2. Check for typos in script commands`);
    console.log(
      `3. Use 'npm install --save-dev <package>' to add development dependencies`,
    );
  }

  return issues;
}

// Run the check
verifyDependencies()
  .then((issues) => {
    process.exit(issues > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
