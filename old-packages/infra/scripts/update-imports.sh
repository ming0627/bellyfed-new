#!/bin/bash

# Update tsconfig.json in all function directories
for dir in functions/*/; do
    echo "Updating tsconfig.json in $dir"
    cat > "${dir}tsconfig.json" << 'EOF'
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "CommonJS",
        "lib": ["ES2022"],
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "baseUrl": ".",
        "paths": {
            "@utils/*": ["../../src/layers/utils/nodejs/*"],
            "@middlewares/*": ["../../src/layers/middleware/nodejs/middlewares/*"],
            "@infra/utils/*": ["../../src/layers/utils/nodejs/*"],
            "@infra/middleware/*": ["../../src/layers/middleware/nodejs/middlewares/*"],
            "@infra/lib/*": ["../../lib/*"],
            "@infra/config": ["../../lib/config.ts"]
        }
    },
    "include": ["*.ts"],
    "exclude": ["node_modules", "dist"]
}
EOF

    # Update package.json build script
    jq '.scripts.build = "npm run lint && npm run type-check && esbuild index.ts --bundle --platform=node --target=node20 --outfile=dist/index.js --alias:@utils=../../src/layers/utils/nodejs --alias:@middlewares=../../src/layers/middleware/nodejs/middlewares --alias:@infra/utils=../../src/layers/utils/nodejs --alias:@infra/middleware=../../src/layers/middleware/nodejs/middlewares --alias:@infra/lib=../../lib --alias:@infra/config=../../lib/config.ts --format=cjs"' "${dir}package.json" > "${dir}package.json.tmp" && mv "${dir}package.json.tmp" "${dir}package.json"

    # Update imports in index.ts
    if [ -f "${dir}index.ts" ]; then
        echo "Updating imports in ${dir}index.ts"
        sed -i '' 's|../../layers/utils/nodejs/aws|@infra/utils/aws|g' "${dir}index.ts"
        sed -i '' 's|../../layers/utils/nodejs/errors|@infra/utils/errors|g' "${dir}index.ts"
        sed -i '' 's|../../layers/utils/nodejs/google|@infra/utils/google|g' "${dir}index.ts"
        sed -i '' 's|../../layers/middleware/nodejs/middlewares|@infra/middleware|g' "${dir}index.ts"
        sed -i '' 's|../../lib/config|@infra/config|g' "${dir}index.ts"

        # Also update any relative imports to lib directory
        sed -i '' 's|../../lib/|@infra/lib/|g' "${dir}index.ts"

        # Keep backward compatibility with old path aliases
        sed -i '' 's|@utils/|@infra/utils/|g' "${dir}index.ts"
        sed -i '' 's|@middlewares/|@infra/middleware/|g' "${dir}index.ts"
    fi
done

echo "Import updates complete"