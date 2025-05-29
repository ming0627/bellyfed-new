# Bellyfed Frontend

This is the frontend application for Bellyfed, a dish-centric food review platform built on our innovative One-Best Ranking System.

> **IMPORTANT UPDATE**: The frontend has been migrated from AWS Amplify to CloudFront with Lambda@Edge. See [CloudFront Deployment Guide](./CLOUDFRONT_DEPLOYMENT.md) for details on the current hosting architecture.

## Dynamic Country Routing

The application uses Next.js dynamic routing with the `[country]` parameter to serve country-specific content. All pages are in the `src/pages` directory.

> **IMPORTANT**: The old `/pages` directory has been completely removed. All pages have been migrated to `/src/pages` with proper country-based routing. A GitHub Actions workflow (`check-no-pages-dir.yml`) has been set up to ensure that no files are accidentally created in the deprecated `./pages` directory.

### Dynamic Routing Structure

- Country-specific routes use the dynamic `[country]` parameter: `src/pages/[country]/*`
- The middleware automatically redirects users to the appropriate country route (defaults to Malaysia - 'my')
- Valid country codes: 'my' (Malaysia), 'sg' (Singapore), with more to be added as needed

When accessing the site:

- Root URL (/) redirects to /{defaultCountry}
- URLs with a valid country code (e.g., /sg/dishes) are processed directly
- Invalid country codes redirect to the default country

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

> **Note**: This project uses npm as its package manager. See [Package Management Guide](./docs/ARCHIVED/PACKAGE_MANAGEMENT.md) for more details.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API Connection Configuration

You can configure the application to connect to different API environments:

- **Local API**: Uses `http://localhost:3001/api`
- **AWS Dev API**: Uses `https://api-dev.bellyfed.com/v1`

To switch between environments, edit the `.env.local` file:

```
# Set to 'true' to use AWS dev API, 'false' to use local API
USE_AWS_API=true

# API environment (dev, test, qa, prod)
API_ENV=dev
```

For detailed documentation on API connection, see [API Connection Guide](./docs/ARCHIVED/API_CONNECTION.md).

## Deployment

### CloudFront Deployment

The application is now deployed using AWS CloudFront with Lambda@Edge. For deployment instructions, see the [CloudFront Deployment Guide](./CLOUDFRONT_DEPLOYMENT.md).

To deploy to CloudFront:

```bash
export WEBSITE_BUCKET_NAME=your-s3-bucket-name
export DISTRIBUTION_ID=your-cloudfront-distribution-id
npm run deploy
```

## Documentation

All documentation for the Bellyfed platform is now maintained in the `bellyfed-infra/docs` repository. Please refer to that repository for the most up-to-date information.

### Local Documentation Structure

While most documentation has been moved to the central repository, some documentation remains in this repository for reference:

1. **Current Documentation**: `docs/CURRENT/` - Documentation that is still relevant but pending migration
2. **Technical Documentation**: `docs/TECH/` - Technical documentation specific to this repository
3. **Archived Documentation**: `docs/ARCHIVED/` - Historical documentation kept for reference
4. **Feature-specific Documentation**: Feature-specific documentation is kept in dedicated folders (e.g., `docs/20250504-rankings-backend`)

### JIRA Tasks

Tasks related to documentation improvements and migrations are tracked in the `JIRA/` folder at the root of the repository.

### Important Technical Documentation

Some critical technical documentation is maintained in this repository:

- [Redirects in Static Generation](./docs/ARCHIVED/redirects-in-static-generation.md) - How to properly implement redirects in a Next.js application that uses static generation (important for Docker and production builds)

## TypeScript Best Practices

### Handling Optional Properties

When dealing with properties that might be undefined, there are several approaches you can take:

1. **Make Properties Optional in Interface/Type Definition (Recommended)**

   ```typescript
   // Instead of
   interface ComponentProps {
     name: string;
     description: string;
   }

   // Use
   interface ComponentProps {
     name?: string;
     description?: string;
   }
   ```

   This approach is type-safe and explicitly indicates that these properties might be undefined.

2. **Use Nullish Coalescing Operator**

   ```typescript
   // When you need to ensure a default value
   const name = props.name ?? '';
   const description = props.description ?? 'No description available';
   ```

3. **Type Assertion (Use Sparingly)**
   ```typescript
   // Only when you're absolutely certain the value exists
   const name = props.name as string;
   ```

Choose the approach that best fits your use case, but prefer making properties optional in the type definition as it's the most type-safe approach.

### Available Templates and Guides

To support developers in working with the dynamic country routing, we've created:

1. **Dynamic Country Page Template**: Located at `src/templates/DynamicCountryPageTemplate.tsx` - a ready-to-use template for creating new country-specific pages. This template:

   - Includes validation for country codes
   - Handles redirects for invalid country codes
   - Pre-renders known country paths
   - Provides a structure for passing country-specific props
   - Uses TypeScript for type safety

2. **Example Implementation**: Located at `src/pages/[country]/example-migration.tsx` - a fully functional example that shows how to implement dynamic country routing based on the template.

3. **Migration Guide**: Located at `docs/ARCHIVED/country-routing-migration-guide.md` - comprehensive documentation on country-routing, handle special cases, and troubleshoot common issues.

4. **Utility Helpers**: Located at `src/utils/countryRouteHelpers.ts` - helper functions to simplify working with country codes.
