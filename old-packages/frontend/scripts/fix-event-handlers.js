#!/usr/bin/env node

/**
 * This script fixes common TypeScript errors in React event handlers
 * It replaces incorrect syntax like:
 * (e): React.ChangeEvent<HTMLInputElement>) => {}
 * with the correct syntax:
 * (e: React.ChangeEvent<HTMLInputElement>) => {}
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files in the src directory
const srcDir = path.join(__dirname, '..', 'src');
const tsFiles = execSync(`find ${srcDir} -type f -name "*.tsx" -o -name "*.ts"`)
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${tsFiles.length} TypeScript files to process`);

// Regular expressions for finding and fixing common event handler issues
const patterns = [
  // Fix (e): React.ChangeEvent<HTMLInputElement>) => {}
  {
    find: /\(([^)]*)\):\s*React\.(\w+)<([^>]+)>\)\s*=>/g,
    replace: '($1: React.$2<$3>) =>',
  },
  // Fix onClick={(): void => {}}
  {
    find: /onClick={\(\):\s*(\w+)\s*=>/g,
    replace: 'onClick={() =>',
  },
  // Fix onChange={(e): void => {}}
  {
    find: /onChange={\(([^)]*)\):\s*(\w+)\s*=>/g,
    replace: 'onChange={($1) =>',
  },
  // Fix onSubmit={(e): void => {}}
  {
    find: /onSubmit={\(([^)]*)\):\s*(\w+)\s*=>/g,
    replace: 'onSubmit={($1) =>',
  },
  // Fix .map((item): React.ReactNode => ())
  {
    find: /\.map\(\(([^)]*)\):\s*React\.(\w+)\s*=>/g,
    replace: '.map(($1) =>',
  },
  // Fix .filter((item): boolean => {})
  {
    find: /\.filter\(\(([^)]*)\):\s*boolean\s*=>/g,
    replace: '.filter(($1) =>',
  },
  // Fix .forEach((item): void => {})
  {
    find: /\.forEach\(\(([^)]*)\):\s*void\s*=>/g,
    replace: '.forEach(($1) =>',
  },
  // Fix setTimeout((): void => {})
  {
    find: /setTimeout\(\(\):\s*(\w+)\s*=>/g,
    replace: 'setTimeout(() =>',
  },
  // Fix useEffect((): void => {})
  {
    find: /useEffect\(\(\):\s*(\w+)\s*=>/g,
    replace: 'useEffect(() =>',
  },
  // Fix useCallback((): void => {})
  {
    find: /useCallback\(\(\):\s*(\w+)\s*=>/g,
    replace: 'useCallback(() =>',
  },
  // Fix useMemo((): T => {})
  {
    find: /useMemo\(\(\):\s*(\w+)\s*=>/g,
    replace: 'useMemo(() =>',
  },
];

// Process each file
let totalReplacements = 0;
let filesModified = 0;

tsFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileReplacements = 0;

    // Apply each pattern
    patterns.forEach(({ find, replace }) => {
      const matches = content.match(find);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(find, replace);
      }
    });

    // Only write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalReplacements += fileReplacements;
      console.log(`Fixed ${fileReplacements} issues in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log(`\nSummary:`);
console.log(`- Files processed: ${tsFiles.length}`);
console.log(`- Files modified: ${filesModified}`);
console.log(`- Total replacements: ${totalReplacements}`);
