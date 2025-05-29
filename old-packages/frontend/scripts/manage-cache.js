#!/usr/bin/env node

/**
 * Next.js Build Cache Management Script
 *
 * This script helps manage the Next.js build cache to optimize build times.
 * It can:
 * - Clean the cache when it gets too large
 * - Prune unused cache entries
 * - Report cache statistics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_CACHE_SIZE_MB = 600; // Maximum cache size in MB
const CACHE_DIR = path.join(process.cwd(), '.next/cache');
const WEBPACK_CACHE_DIR = path.join(CACHE_DIR, 'webpack');
const IMAGES_CACHE_DIR = path.join(CACHE_DIR, 'images');

// Helper functions
function getDirectorySize(directory) {
  try {
    const result = execSync(`du -sm "${directory}"`, { encoding: 'utf8' });
    return parseInt(result.split('\t')[0], 10);
  } catch (error) {
    console.error(`Error getting size of ${directory}:`, error.message);
    return 0;
  }
}

function formatSize(sizeInMB) {
  return `${sizeInMB} MB`;
}

function cleanDirectory(directory) {
  try {
    if (fs.existsSync(directory)) {
      console.log(`Cleaning ${directory}...`);
      fs.rmSync(directory, { recursive: true, force: true });
      fs.mkdirSync(directory, { recursive: true });
      console.log(`✅ Cleaned ${directory}`);
    }
  } catch (error) {
    console.error(`Error cleaning ${directory}:`, error.message);
  }
}

function pruneOldCacheEntries(directory, daysOld = 7) {
  try {
    if (!fs.existsSync(directory)) return;

    console.log(
      `Pruning cache entries older than ${daysOld} days in ${directory}...`,
    );

    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    const entries = fs.readdirSync(directory);
    let prunedCount = 0;

    for (const entry of entries) {
      const entryPath = path.join(directory, entry);
      const stats = fs.statSync(entryPath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.rmSync(entryPath, { recursive: true, force: true });
        prunedCount++;
      }
    }

    console.log(`✅ Pruned ${prunedCount} old entries from ${directory}`);
  } catch (error) {
    console.error(`Error pruning old entries in ${directory}:`, error.message);
  }
}

// Main functions
function reportCacheStats() {
  console.log('\n📊 Next.js Cache Statistics:');

  if (!fs.existsSync(CACHE_DIR)) {
    console.log('No cache directory found.');
    return;
  }

  const webpackCacheSize = fs.existsSync(WEBPACK_CACHE_DIR)
    ? getDirectorySize(WEBPACK_CACHE_DIR)
    : 0;
  const imagesCacheSize = fs.existsSync(IMAGES_CACHE_DIR)
    ? getDirectorySize(IMAGES_CACHE_DIR)
    : 0;
  const totalCacheSize = webpackCacheSize + imagesCacheSize;

  console.log(`Webpack cache: ${formatSize(webpackCacheSize)}`);
  console.log(`Images cache: ${formatSize(imagesCacheSize)}`);
  console.log(`Total cache size: ${formatSize(totalCacheSize)}`);
  console.log(
    `Maximum recommended cache size: ${formatSize(MAX_CACHE_SIZE_MB)}`,
  );

  if (totalCacheSize > MAX_CACHE_SIZE_MB) {
    console.log(
      '\n⚠️ Cache size exceeds recommended maximum. Consider cleaning the cache.',
    );
  }
}

function cleanCache() {
  console.log('\n🧹 Cleaning Next.js cache...');

  if (!fs.existsSync(CACHE_DIR)) {
    console.log('No cache directory found.');
    return;
  }

  cleanDirectory(WEBPACK_CACHE_DIR);
  cleanDirectory(IMAGES_CACHE_DIR);

  console.log('✅ Cache cleaned successfully.');
}

function pruneCache() {
  console.log('\n✂️ Pruning old Next.js cache entries...');

  if (!fs.existsSync(CACHE_DIR)) {
    console.log('No cache directory found.');
    return;
  }

  pruneOldCacheEntries(WEBPACK_CACHE_DIR);
  pruneOldCacheEntries(IMAGES_CACHE_DIR);

  console.log('✅ Cache pruned successfully.');
}

// Command line interface
function printUsage() {
  console.log(`
Next.js Build Cache Management Script

Usage:
  node ${path.basename(__filename)} [command]

Commands:
  stats    - Report cache statistics
  clean    - Clean the entire cache
  prune    - Remove old cache entries
  optimize - Automatically optimize the cache (prune if needed)
  help     - Show this help message
  `);
}

function main() {
  const command = process.argv[2] || 'stats';

  switch (command) {
    case 'stats':
      reportCacheStats();
      break;
    case 'clean':
      cleanCache();
      break;
    case 'prune':
      pruneCache();
      break;
    case 'optimize':
      const totalCacheSize = getDirectorySize(CACHE_DIR);
      if (totalCacheSize > MAX_CACHE_SIZE_MB) {
        pruneCache();
        const newSize = getDirectorySize(CACHE_DIR);
        if (newSize > MAX_CACHE_SIZE_MB * 0.9) {
          console.log(
            '\n⚠️ Cache is still large after pruning. Cleaning completely...',
          );
          cleanCache();
        }
      } else {
        console.log(
          '\n✅ Cache size is within limits. No optimization needed.',
        );
      }
      reportCacheStats();
      break;
    case 'help':
    default:
      printUsage();
      break;
  }
}

main();
