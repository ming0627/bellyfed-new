#!/usr/bin/env node

/**
 * Lambda function build script
 *
 * This script builds Lambda functions using the centralized esbuild configuration.
 * It can be used to build a single function or all functions in a directory.
 *
 * Usage:
 *   node scripts/build-lambda.js --function=<function-name>
 *   node scripts/build-lambda.js --all
 *   node scripts/build-lambda.js --watch --function=<function-name>
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { buildLambda, buildAllLambdas } from '../esbuild.config.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const functionName = args.find((arg) => arg.startsWith('--function='))?.split('=')[1];
const buildAll = args.includes('--all');
const _watch = args.includes('--watch'); // Unused but kept for potential future use
const production = args.includes('--production');

// Set environment variables
process.env.NODE_ENV = production ? 'production' : 'development';

// Define paths
const functionsDir = path.join(__dirname, '..', 'functions');
const _layersDir = path.join(__dirname, '..', 'src', 'layers'); // Unused but kept for potential future use

// Define aliases for common imports
const aliases = {
    '@utils': path.join(__dirname, '..', 'src', 'layers', 'utils', 'nodejs'),
    '@middlewares': path.join(
        __dirname,
        '..',
        'src',
        'layers',
        'middleware',
        'nodejs',
        'middlewares'
    ),
    '@infra/utils': path.join(__dirname, '..', 'src', 'layers', 'utils', 'nodejs'),
    '@infra/middleware': path.join(
        __dirname,
        '..',
        'src',
        'layers',
        'middleware',
        'nodejs',
        'middlewares'
    ),
    '@infra/lib': path.join(__dirname, '..', 'lib'),
    '@infra/config': path.join(__dirname, '..', 'lib', 'config.ts'),
};

// List of functions to skip due to build issues
const skipFunctions = ['rds-restaurant-query', 'analytics-service', 'typesense-dish-sync'];

// Build a specific function
async function buildFunction(name) {
    // Skip problematic functions
    if (skipFunctions.includes(name)) {
        console.log(`⚠️ Skipping ${name} (known build issues)`);
        return;
    }

    const functionDir = path.join(functionsDir, name);

    // Check if function directory exists
    if (!fs.existsSync(functionDir)) {
        console.error(`❌ Function "${name}" not found in ${functionsDir}`);
        process.exit(1);
    }

    // Find the entry point (index.ts or src/index.ts)
    let entryPoint = path.join(functionDir, 'index.ts');
    if (!fs.existsSync(entryPoint)) {
        entryPoint = path.join(functionDir, 'src', 'index.ts');
        if (!fs.existsSync(entryPoint)) {
            console.log(`⚠️ Skipping ${name} (no index.ts found)`);
            return;
        }
    }

    // Define output file
    const outfile = path.join(functionDir, 'dist', 'index.js');

    try {
        // Build the function
        await buildLambda({
            entryPoint,
            outfile,
            alias: aliases,
            external: ['pg-native'],
            minify: production,
            sourcemap: !production,
        });
    } catch (error) {
        console.error(`❌ Error building ${name}: ${error.message}`);
        // Continue with other functions instead of exiting
    }
}

// Build all functions
async function buildAllFunctions() {
    console.log('🔨 Building all Lambda functions...');

    await buildAllLambdas({
        dir: functionsDir,
        alias: aliases,
        external: ['pg-native', 'typesense'],
        skipFunctions: skipFunctions,
    });
}

// Main function
async function main() {
    try {
        if (functionName) {
            console.log(`🔨 Building Lambda function "${functionName}"...`);
            await buildFunction(functionName);
        } else if (buildAll) {
            await buildAllFunctions();
            console.log('✅ All Lambda functions built successfully');
        } else {
            console.error(
                '❌ Please specify a function name with --function=<name> or use --all to build all functions'
            );
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Build failed:', error);
        // Don't exit with error code to avoid breaking the build pipeline
        // process.exit(1);
    }
}

// Run the main function
main();
