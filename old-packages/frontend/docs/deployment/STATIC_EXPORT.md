# Next.js Static Export Configuration

This document explains the configuration for Next.js static export in the Bellyfed application.

## Overview

The Bellyfed frontend application is configured to use Next.js static export (`output: 'export'`) to generate static HTML files that can be served from CloudFront and S3. This approach eliminates the need for server-side rendering at runtime, making the application more scalable and cost-effective.

## Configuration

The static export configuration is defined in `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      // Image domains configuration...
    ],
  },
  // Set asset prefix for CloudFront when in production
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN
        ? `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}`
        : undefined
      : undefined,
  // Configure output for static export
  output: 'export',
  // Disable server components for static export
  experimental: {
    appDir: false,
  },
  // Disable strict mode for API routes in static export
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
};
```

## Key Configuration Options

1. **`output: 'export'`**: This tells Next.js to generate static HTML files instead of using server-side rendering.

2. **`images.unoptimized: true`**: This is required for static export because Next.js Image Optimization requires a server component.

3. **`assetPrefix`**: This sets the base path for all assets (JavaScript, CSS, images) when deployed to production. It uses the CloudFront distribution domain.

4. **`experimental.appDir: false`**: Disables the App Router, which is not compatible with static export.

5. **`typescript.ignoreBuildErrors: true`**: Ignores TypeScript errors during the build process to ensure the build succeeds even with type errors.

6. **`eslint.ignoreDuringBuilds: true`**: Ignores ESLint errors during the build process to ensure the build succeeds even with linting errors.

## Build Output

When running `npm run build`, Next.js generates static files in the `out` directory:

- HTML files for each page
- JavaScript chunks in `_next/static/chunks`
- CSS files in `_next/static/css`
- Other static assets

## Deployment

The static files in the `out` directory are deployed to an S3 bucket and served through CloudFront. The deployment process is handled by the AWS CodePipeline in the `bellyfed-infra` repository.

## Limitations

Static export has some limitations:

1. **No API Routes**: API routes (`pages/api/*`) are not available in static export.
2. **No Server-Side Rendering**: All pages must be pre-rendered at build time.
3. **No Middleware**: Next.js middleware is not supported in static export.
4. **No Image Optimization**: Next.js Image Optimization requires a server component.

## Workarounds

To work around these limitations:

1. **API Routes**: Use AWS Lambda functions for API endpoints.
2. **Server-Side Data**: Use `getStaticProps` for data that can be fetched at build time, and client-side fetching for dynamic data.
3. **Image Optimization**: Use `next/image` with `unoptimized: true` and optimize images before uploading them.

## Troubleshooting

If you encounter issues with the static export:

1. **Missing Assets**: Check that the `assetPrefix` is correctly set to the CloudFront distribution domain.
2. **404 Errors**: Ensure that the S3 bucket is correctly configured to serve `index.html` for directory requests.
3. **API Route Errors**: Remember that API routes are not available in static export. Use AWS Lambda functions instead.
4. **Image Errors**: Make sure all images are using the `unoptimized: true` option.

## References

- [Next.js Static Export Documentation](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
