#!/bin/bash

# Exit on any error
set -e

echo "🔍 Running comprehensive pre-deployment validation..."

# 1. Clean the build artifacts to ensure a fresh build
echo "🧹 Cleaning build artifacts..."
rm -rf cdk.out
find . -name "dist" -type d -exec rm -rf {} +
find . -name "*.js" -not -path "./node_modules/*" -not -path "*/node_modules/*" -not -path "./scripts/*" -exec rm -f {} \;
find . -name "*.d.ts" -not -path "./node_modules/*" -not -path "*/node_modules/*" -exec rm -f {} \;

# 2. Install dependencies with exact versions
echo "📦 Verifying dependencies..."
npm ci

# 3. Run strict type checking on the infrastructure code
echo "🔎 Running strict TypeScript type checking on infrastructure code..."

# Create a temporary tsconfig for checking just the infrastructure files
cat > temp-tsconfig.json << EOF
{
  "extends": "./tsconfig.json",
  "include": ["lib/**/*.ts", "bin/**/*.ts"],
  "exclude": ["node_modules", "functions", "packages", "src/layers"]
}
EOF

npx tsc --noEmit --strict --skipLibCheck --project temp-tsconfig.json
TS_RESULT=$?
rm temp-tsconfig.json

if [ $TS_RESULT -ne 0 ]; then
  echo "Type check failed for infrastructure files."
  exit 1
fi

# 4. Run ESLint with stricter rules
echo "🧪 Running ESLint with strict rules..."
npx eslint --max-warnings=0 "lib/**/*.ts" "bin/**/*.ts"

# 5. Synthesize the CloudFormation template without deploying
echo "🏗️ Synthesizing CloudFormation template..."
npx cdk synth --strict --context environment=${1:-dev}

# 6. Validate the generated CloudFormation template
echo "✅ Validating CloudFormation template..."
for template in cdk.out/*.template.json; do
  echo "Validating template: $template"
  aws cloudformation validate-template --template-body file://$template > /dev/null
done

echo "🚀 Pre-deployment validation completed successfully!"
echo "You can now proceed with deployment: npm run cdk:deploy:${1:-dev}"
