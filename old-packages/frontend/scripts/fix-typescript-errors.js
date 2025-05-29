#!/usr/bin/env node

/**
 * This script automatically fixes common TypeScript and ESLint errors in the codebase.
 * It focuses on:
 * 1. Adding missing return types to functions
 * 2. Fixing no-explicit-any errors by replacing with proper types
 * 3. Fixing unused variables by prefixing them with _
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files in the src directory
const getAllTsFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Fix missing return types on functions
const fixMissingReturnTypes = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix arrow functions with missing return types
  content = content.replace(
    /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
    (match, funcName, params) => {
      // Skip if already has return type
      if (match.includes('):')) return match;

      return `const ${funcName} = (${params}): React.ReactElement => {`;
    },
  );

  // Fix function components with missing return types
  content = content.replace(
    /function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
    (match, funcName, params) => {
      // Skip if already has return type
      if (match.includes('):')) return match;

      return `function ${funcName}(${params}): React.ReactElement {`;
    },
  );

  // Fix export default function with missing return types
  content = content.replace(
    /export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
    (match, funcName, params) => {
      // Skip if already has return type
      if (match.includes('):')) return match;

      return `export default function ${funcName}(${params}): React.ReactElement {`;
    },
  );

  // Fix (: React.ChangeEvent<HTMLInputElement>) => {}
  content = content.replace(
    /\(\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    '() =>',
  );

  // Fix onClick={(: React.ChangeEvent<HTMLInputElement>) => {}}
  content = content.replace(
    /onClick={\(\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    'onClick={() =>',
  );

  // Fix onSelect={(: React.ChangeEvent<HTMLInputElement>) => {}}
  content = content.replace(
    /onSelect={\(\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    'onSelect={() =>',
  );

  // Fix onChange={(: React.ChangeEvent<HTMLInputElement>) => {}}
  content = content.replace(
    /onChange={\(\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    'onChange={() =>',
  );

  // Fix onValueChange={(: React.ChangeEvent<HTMLInputElement>) => {}}
  content = content.replace(
    /onValueChange={\(\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    'onValueChange={() =>',
  );

  // Fix .map((item: React.ChangeEvent<HTMLInputElement>) => ())
  content = content.replace(
    /\.map\(\(([^,)]*)\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    '.map(($1) =>',
  );

  // Fix useEffect((): unknown) => {}, useCallback((): unknown) => {}, useMemo((): unknown) => {}
  content = content.replace(
    /(useEffect|useCallback|useMemo)\(\(\s*:\s*unknown\)\s*=>/g,
    '$1(() =>',
  );

  // Fix function(): JSX.Element {} that should return void
  content = content.replace(
    /(\w+)\s*=\s*\(\):\s*JSX\.Element\s*=>\s*{(?![^}]*return)/g,
    '$1 = (): void => {',
  );

  // Fix const getX = (): JSX.Element => { ... return string; }
  content = content.replace(
    /const\s+(\w+)\s*=\s*\(\):\s*JSX\.Element\s*=>\s*{[^}]*return\s+([^<][^;]*);/g,
    'const $1 = () => {return $2;',
  );

  // Fix handleX = (: React.ChangeEvent<HTMLInputElement>) => { }
  content = content.replace(
    /(\w+)\s*=\s*\(\s*:\s*React\.ChangeEvent<HTMLInputElement>\)\s*=>/g,
    '$1 = () =>',
  );

  fs.writeFileSync(filePath, content, 'utf8');
};

// Fix no-explicit-any errors
const fixExplicitAny = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace any with unknown or more specific types
  content = content.replace(/: any(\s|,|;|\)|\]|}|$)/g, ': unknown$1');
  content = content.replace(/any\[\]/g, 'unknown[]');

  fs.writeFileSync(filePath, content, 'utf8');
};

// Fix unused variables by prefixing with _
const fixUnusedVariables = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Get list of unused variables from ESLint
  try {
    const output = execSync(`npx eslint --format json ${filePath}`).toString();
    const result = JSON.parse(output);

    if (result.length > 0 && result[0].messages) {
      const unusedVars = result[0].messages
        .filter((msg) => msg.ruleId === '@typescript-eslint/no-unused-vars')
        .map((msg) => msg.message.match(/'([^']+)'/)[1]);

      // Replace each unused variable with prefixed version
      unusedVars.forEach((varName) => {
        // Only prefix if not already prefixed
        if (!varName.startsWith('_')) {
          const regex = new RegExp(`\\b${varName}\\b(?!\\s*=)`, 'g');
          content = content.replace(regex, `_${varName}`);

          // Also fix the declaration
          const declRegex = new RegExp(
            `\\b(const|let|var)\\s+${varName}\\b`,
            'g',
          );
          content = content.replace(declRegex, `$1 _${varName}`);
        }
      });
    }
  } catch (error) {
    console.error(`Error running ESLint on ${filePath}:`, error.message);
  }

  fs.writeFileSync(filePath, content, 'utf8');
};

// Fix no-unescaped-entities errors
const fixUnescapedEntities = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace unescaped quotes with escaped versions
  content = content.replace(/(\s)"(\s)/g, '$1&quot;$2');
  content = content.replace(/(\s)'(\s)/g, '$1&apos;$2');

  fs.writeFileSync(filePath, content, 'utf8');
};

// Main function
const main = () => {
  console.log('Fixing TypeScript and ESLint errors...');

  const files = getAllTsFiles(path.join(__dirname, '../src'));

  files.forEach((file) => {
    console.log(`Processing ${file}...`);
    fixMissingReturnTypes(file);
    fixExplicitAny(file);
    fixUnusedVariables(file);
    fixUnescapedEntities(file);
  });

  console.log('Done!');
};

main();
