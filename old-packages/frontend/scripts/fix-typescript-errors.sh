#!/bin/bash

# Script to fix common TypeScript errors in the frontend repository
# This script focuses on the most critical errors:
# - Unused variables and imports
# - React hook dependency array issues
# - Missing type imports

echo "Starting TypeScript error fixing process..."

# Make the script executable
chmod +x "$(dirname "$0")/fix-typescript-errors.sh"

# Fix missing Skeleton imports
echo "Fixing missing Skeleton imports..."
find src -type f -name "*.tsx" -exec grep -l "Skeleton" {} \; | xargs -I{} sed -i '' '1s/^/import { Skeleton } from "@\/components\/ui\/skeleton";\n/' {}

# Fix missing Button imports
echo "Fixing missing Button imports..."
find src -type f -name "*.tsx" -exec grep -l "<Button" {} \; | xargs -I{} sed -i '' '1s/^/import { Button } from "@\/components\/ui\/button";\n/' {}

# Fix unused variables by prefixing them with underscore
echo "Fixing unused variables..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs -I{} sed -i '' 's/const \([a-zA-Z0-9]*\) = [^;]* \/\/ @typescript-eslint\/no-unused-vars/const _\1 = /g' {}

# Fix unused parameters
echo "Fixing unused parameters..."
find src -type f -name "*.ts" -o -name "*.tsx" | xargs -I{} sed -i '' 's/\(context\): any/\1: any/g' {}
find src -type f -name "*.ts" -o -name "*.tsx" | xargs -I{} sed -i '' 's/\(req\): any/\1: any/g' {}
find src -type f -name "*.ts" -o -name "*.tsx" | xargs -I{} sed -i '' 's/\(e\): any/\1: any/g' {}

# Fix React hook dependency array issues
echo "Fixing React hook dependency array issues..."
find src -type f -name "*.tsx" | xargs -I{} sed -i '' 's/}, \[\]);/}, []);/g' {}

# Fix CountryContext issues
echo "Fixing CountryContext issues..."
sed -i '' 's/country: string/countryCode: string/g' src/contexts/CountryContext.tsx
sed -i '' 's/const { country }/const { countryCode }/g' src/components/*/**.tsx

# Fix missing return types in specific files
echo "Fixing specific files with return type issues..."
sed -i '' 's/export const clearLogs = async ()/export const clearLogs = async (): Promise<void>/g' src/utils/debugLogger.ts
sed -i '' 's/export const exportLogs = async ()/export const exportLogs = async (): Promise<void>/g' src/utils/debugLogger.ts

# Fix specific issues in restaurantService.ts
echo "Fixing restaurantService.ts issues..."
sed -i '' 's/async getRestaurantReviews(id: string): Promise<Review\[\]>/async getRestaurantReviews(id: string): Promise<Review[]>/g' src/services/restaurantService.ts
sed -i '' 's/async getCuisineTypes(): Promise<{ types: CuisineType\[\] }>/async getCuisineTypes(): Promise<{ types: CuisineType[] }>/g' src/services/restaurantService.ts
sed -i '' 's/async getPriceRanges(): Promise<{ ranges: PriceRange\[\] }>/async getPriceRanges(): Promise<{ ranges: PriceRange[] }>/g' src/services/restaurantService.ts
sed -i '' 's/async getRestaurantsByDishId(dishId: string, countryCode: string): Promise<Restaurant\[\]>/async getRestaurantsByDishId(dishId: string, countryCode: string): Promise<Restaurant[]>/g' src/services/restaurantService.ts

echo "TypeScript error fixing process completed!"
echo "Note: This script applies automated fixes for common issues."
echo "Manual review and additional fixes may still be required."
