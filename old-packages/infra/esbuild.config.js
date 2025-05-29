/**
 * Centralized esbuild configuration for Lambda functions
 *
 * This configuration provides a standardized build process for all Lambda functions
 * in the bellyfed-infra repository. It includes optimizations for faster builds and
 * smaller bundle sizes.
 */

import path from 'path';
import fs from 'fs';
import { build } from 'esbuild';

// Default options for all builds
const defaultOptions = {
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV !== 'production',
    metafile: true,
    logLevel: 'info',
    external: [
        // AWS SDK is provided by the Lambda runtime
        '@aws-sdk/*',
        'aws-sdk',
        // AWS Lambda Powertools
        '@aws-lambda-powertools/*',
        // Utils and middlewares are provided as Lambda layers
        '@utils/*',
        '@middlewares/*',
        '@infra/utils/*',
        '@infra/middleware/*',
        // Third-party packages that should be provided by Lambda layers
        'typesense',
        'pg-native',
    ],
};

/**
 * Build a Lambda function
 * @param {Object} options - Build options
 * @param {string} options.entryPoint - Entry point file (e.g., 'index.ts')
 * @param {string} options.outfile - Output file path (e.g., 'dist/index.js')
 * @param {Object} options.define - Define variables for the build
 * @param {string[]} options.external - External packages to exclude from the bundle
 * @param {Object} options.alias - Alias paths for imports
 * @param {boolean} options.minify - Whether to minify the output
 * @param {boolean} options.sourcemap - Whether to generate sourcemaps
 * @returns {Promise<void>}
 */
async function buildLambda(options) {
    const {
        entryPoint,
        outfile,
        define = {},
        external = [],
        alias = {},
        minify = defaultOptions.minify,
        sourcemap = defaultOptions.sourcemap,
    } = options;

    // Ensure the output directory exists
    const outDir = path.dirname(outfile);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Merge with default options
    const buildOptions = {
        ...defaultOptions,
        entryPoints: [entryPoint],
        outfile,
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            ...define,
        },
        external: [...defaultOptions.external, ...external],
        minify,
        sourcemap,
        alias,
    };

    try {
        const result = await build(buildOptions);

        // Log build statistics
        if (result.metafile) {
            const totalBytes = Object.values(result.metafile.outputs).reduce(
                (total, output) => total + output.bytes,
                0
            );

            console.log(
                `✅ Built ${entryPoint} -> ${outfile} (${(totalBytes / 1024).toFixed(2)} KB)`
            );
        }
    } catch (error) {
        console.error(`❌ Error building ${entryPoint}:`, error);
        process.exit(1);
    }
}

/**
 * Build all Lambda functions in a directory
 * @param {Object} options - Build options
 * @param {string} options.dir - Directory containing Lambda functions
 * @param {Object} options.define - Define variables for the build
 * @param {string[]} options.external - External packages to exclude from the bundle
 * @param {Object} options.alias - Alias paths for imports
 * @param {string[]} options.skipFunctions - Functions to skip during build
 * @returns {Promise<void>}
 */
async function buildAllLambdas(options) {
    const { dir, define = {}, external = [], alias = {}, skipFunctions = [] } = options;

    // Get all subdirectories in the specified directory
    const subdirs = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    // Build each Lambda function
    for (const subdir of subdirs) {
        // Skip functions in the skipFunctions list
        if (skipFunctions.includes(subdir)) {
            console.log(`⚠️ Skipping ${subdir} (in skip list)`);
            continue;
        }

        const entryPoint = path.join(dir, subdir, 'index.ts');
        const outfile = path.join(dir, subdir, 'dist', 'index.js');

        // Skip if entry point doesn't exist
        if (!fs.existsSync(entryPoint)) {
            console.log(`⚠️ Skipping ${subdir} (no index.ts found)`);
            continue;
        }

        await buildLambda({
            entryPoint,
            outfile,
            define,
            external,
            alias,
        });
    }
}

export { buildLambda, buildAllLambdas, defaultOptions };
