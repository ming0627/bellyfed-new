#!/bin/bash

# Get a list of staged files that are being committed
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|js)$')

# If no relevant files are staged, exit successfully
if [ -z "$STAGED_FILES" ]; then
  echo "No TypeScript or JavaScript files to check."
  exit 0
fi

# Create an array to store the affected packages
AFFECTED_PACKAGES=()
AFFECTED_FUNCTIONS=()

# Check if any CDK infrastructure files are changed
CDK_INFRA_CHANGED=false
if git diff --cached --name-only --diff-filter=ACMR | grep -q -E '^(lib|bin)/.*\.(ts|js)$'; then
  echo "CDK infrastructure files changed. Running type check on infrastructure..."
  CDK_INFRA_CHANGED=true
fi

# Identify affected packages and functions
for FILE in $STAGED_FILES; do
  # Check if file is in a function directory
  if [[ $FILE == functions/* ]]; then
    # Extract the function name (e.g., functions/query-processor/index.ts -> query-processor)
    FUNCTION_NAME=$(echo $FILE | sed -E 's|functions/([^/]+)/.*|\1|')

    # Add to affected functions if not already there
    if [[ ! " ${AFFECTED_FUNCTIONS[@]} " =~ " ${FUNCTION_NAME} " ]]; then
      AFFECTED_FUNCTIONS+=("$FUNCTION_NAME")
    fi
  fi

  # Check if file is in a package directory
  if [[ $FILE == packages/* ]]; then
    # Extract the package name
    PACKAGE_NAME=$(echo $FILE | sed -E 's|packages/([^/]+)/.*|\1|')

    # Add to affected packages if not already there
    if [[ ! " ${AFFECTED_PACKAGES[@]} " =~ " ${PACKAGE_NAME} " ]]; then
      AFFECTED_PACKAGES+=("$PACKAGE_NAME")
    fi
  fi

  # Check if file is in a layer directory
  if [[ $FILE == src/layers/* ]]; then
    # Extract the layer name
    LAYER_NAME=$(echo $FILE | sed -E 's|src/layers/([^/]+)/.*|\1|')

    # Add to affected packages if not already there
    if [[ ! " ${AFFECTED_PACKAGES[@]} " =~ " ${LAYER_NAME} " ]]; then
      AFFECTED_PACKAGES+=("$LAYER_NAME")
    fi
  fi
done

# Run type-check on infrastructure if needed
if [ "$CDK_INFRA_CHANGED" = true ]; then
  echo "Running type check on infrastructure..."
  # Only check the infrastructure files (lib and bin directories) to avoid module resolution issues
  # Create a temporary tsconfig for checking just the infrastructure files
  cat > temp-tsconfig.json << EOF
{
  "extends": "./tsconfig.json",
  "include": ["lib/**/*.ts", "bin/**/*.ts"],
  "exclude": ["node_modules", "functions", "packages", "src/layers"]
}
EOF

  npx tsc --noEmit --skipLibCheck --project temp-tsconfig.json
  TS_RESULT=$?
  rm temp-tsconfig.json

  if [ $TS_RESULT -ne 0 ]; then
    echo "Type check failed for infrastructure files."
    exit 1
  fi
fi

# Process affected functions
if [ ${#AFFECTED_FUNCTIONS[@]} -gt 0 ]; then
  echo "Affected functions: ${AFFECTED_FUNCTIONS[*]}"

  for FUNC in "${AFFECTED_FUNCTIONS[@]}"; do
    echo "Running checks for function: $FUNC"

    # Run type check
    echo "Running type check..."
    cd "functions/$FUNC" && npm run type-check
    if [ $? -ne 0 ]; then
      echo "Type check failed for $FUNC"
      exit 1
    fi

    # Run lint
    echo "Running lint..."
    cd "functions/$FUNC" && npm run lint
    if [ $? -ne 0 ]; then
      echo "Lint failed for $FUNC"
      exit 1
    fi

    # Run build
    echo "Building $FUNC..."
    cd "functions/$FUNC" && npm run build
    if [ $? -ne 0 ]; then
      echo "Build failed for $FUNC"
      exit 1
    fi

    cd ../../
  done
fi

# Process affected packages
if [ ${#AFFECTED_PACKAGES[@]} -gt 0 ]; then
  echo "Affected packages: ${AFFECTED_PACKAGES[*]}"

  for PKG in "${AFFECTED_PACKAGES[@]}"; do
    # Check if it's a layer or a regular package
    if [ -d "packages/$PKG" ]; then
      DIR="packages/$PKG"
    elif [ -d "src/layers/$PKG" ]; then
      DIR="src/layers/$PKG"
    else
      continue
    fi

    echo "Running checks for package: $PKG"

    # Run type check
    echo "Running type check..."
    cd "$DIR" && npm run type-check
    if [ $? -ne 0 ]; then
      echo "Type check failed for $PKG"
      exit 1
    fi

    # Run lint
    echo "Running lint..."
    cd "$DIR" && npm run lint
    if [ $? -ne 0 ]; then
      echo "Lint failed for $PKG"
      exit 1
    fi

    # Run build
    echo "Building $PKG..."
    cd "$DIR" && npm run build
    if [ $? -ne 0 ]; then
      echo "Build failed for $PKG"
      exit 1
    fi

    cd ../../
  done
fi

echo "All checks passed for changed files!"
exit 0
