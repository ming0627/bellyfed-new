// This script is used to install husky in a way that works in CI environments and Docker builds
// It's designed to be resilient and not fail the build if husky can't be installed

// Check if we're in a CI environment or Docker build
const isCI =
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  process.env.HUSKY_SKIP_INSTALL === '1' ||
  process.env.HUSKY_SKIP_INSTALL === 'true' ||
  process.env.HUSKY === '0';

// Skip husky installation in CI environments or Docker builds
if (isCI) {
  console.log(
    'CI environment or Docker build detected, skipping husky installation',
  );
  process.exit(0);
}

try {
  // Try to require husky as a CommonJS module
  const husky = require('husky');
  console.log('Setting up husky hooks...');
  husky.install();
  console.log('Husky hooks installed successfully');
} catch (error) {
  // Log the error but don't fail the script
  console.log('Skipping husky setup:', error.message);
  // Exit successfully to not break the build
  process.exit(0);
}
