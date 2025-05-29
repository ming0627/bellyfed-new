module.exports = {
  // Only process files in the new monorepo structure, exclude old-packages
  'apps/web/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'cd apps/web && eslint --fix',
  ],
  'apps/backend/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'cd apps/backend && eslint --fix',
  ],
  'apps/docs/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'cd apps/docs && eslint --fix',
  ],
  'packages/**/*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
  ],
  // Only format JSON, MD, YAML files in the new structure (exclude old-packages)
  '{apps,packages}/**/*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
  // Handle root-level config files
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
};
