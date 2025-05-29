#!/bin/bash
set -e

# Create dist directory if it doesn't exist
mkdir -p dist

# Install dependencies (skip husky install)
npm install --ignore-scripts

# Compile TypeScript
npx tsc

# Copy package.json to dist
cp package.json dist/

# Install production dependencies in dist
cd dist
npm install --production --ignore-scripts
cd ..

# Create a zip file for deployment
zip -r lambda.zip dist

echo "Build completed successfully!"
