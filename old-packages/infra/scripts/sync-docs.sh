#!/bin/bash

# Exit on error
set -e

# Check if required environment variables are set
if [ -z "$CONFLUENCE_BASE_URL" ] || \
   [ -z "$CONFLUENCE_USERNAME" ] || \
   [ -z "$CONFLUENCE_API_TOKEN" ]; then
    echo "Error: Required Confluence environment variables are not set"
    exit 1
fi

# Install dependencies if not already installed
npm install

# Get all directories in the docs folder
docs_dir="$(dirname "$0")/../docs"
for space_dir in "$docs_dir"/*/ ; do
    if [ -d "$space_dir" ]; then
        space_name=$(basename "$space_dir")
        # Skip directories starting with underscore (like _standards)
        if [[ $space_name == _* ]]; then
            continue
        fi
        
        echo "Syncing documentation for space: $space_name"
        # Run the sync script for each space
        CONFLUENCE_SPACE_KEY="$space_name" npx ts-node scripts/sync-docs-to-confluence.ts "$space_dir"
    fi
done
