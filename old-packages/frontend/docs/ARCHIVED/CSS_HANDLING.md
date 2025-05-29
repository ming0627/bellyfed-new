# CSS Handling in Static Export

This document explains how CSS is handled in the Next.js static export for the Bellyfed application.

## Overview

When using Next.js with `output: 'export'`, CSS files are generated in the `out/_next/static/css` directory. These files need to be properly uploaded to S3 with the correct content type (`text/css`) to ensure they are correctly applied by browsers.

## Deployment Process

The deployment process has been optimized to handle CSS files correctly:

1. CSS files are uploaded with the correct content type:

   ```bash
   aws s3 sync out/_next/static/css s3://${WEBSITE_BUCKET_NAME}/_next/static/css --delete --cache-control "public, max-age=31536000, immutable" --content-type "text/css"
   ```

2. Other static assets are uploaded with appropriate cache headers:

   ```bash
   aws s3 sync out/_next/static s3://${WEBSITE_BUCKET_NAME}/_next/static --delete --cache-control "public, max-age=31536000, immutable" --exclude "css/*"
   ```

3. Images are uploaded with medium-term caching:

   ```bash
   aws s3 sync out/images s3://${WEBSITE_BUCKET_NAME}/images --delete --cache-control "public, max-age=2592000"
   ```

4. HTML files are uploaded with no caching to ensure fresh content:
   ```bash
   aws s3 sync out s3://${WEBSITE_BUCKET_NAME} --delete --exclude "_next/static/*" --exclude "images/*" --cache-control "public, max-age=0, must-revalidate"
   ```

## CloudFront Configuration

CloudFront is configured to serve CSS files with the correct content type. The cache behavior for `_next/static/*` paths is optimized for long-term caching.

## Troubleshooting

If CSS files are not being applied correctly, check the following:

1. **Content Type**: Verify that CSS files in S3 have the correct content type (`text/css`):

   ```bash
   aws s3api head-object --bucket <bucket-name> --key _next/static/css/<file-name>.css
   ```

2. **CSS Generation**: Check if CSS files are being generated in the build output:

   ```bash
   npm run verify-css
   ```

3. **CloudFront Cache**: Invalidate the CloudFront cache to ensure the latest content is being served:

   ```bash
   aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/_next/static/css/*"
   ```

4. **Browser Cache**: Clear your browser cache to ensure you're seeing the latest content.

## Verification

A verification script (`scripts/verify-css-handling.js`) has been added to check for common CSS issues in the build output. Run it with:

```bash
npm run verify-css
```

This script checks for:

- Presence of CSS files in the build output
- Proper CSS configuration in Next.js
- CSS imports in the application
- Tailwind and PostCSS configuration

## Best Practices

1. **Import CSS in \_app.tsx**: Always import global CSS files in `_app.tsx` to ensure they are properly included in the build.

2. **Use Tailwind CSS**: Tailwind CSS works well with Next.js static export and is the recommended approach for styling.

3. **Avoid CSS-in-JS**: Some CSS-in-JS libraries may not work well with static export. Prefer Tailwind CSS or regular CSS/SCSS files.

4. **Set Correct Content Type**: Always ensure CSS files are uploaded with the correct content type (`text/css`).

5. **Verify CSS Handling**: Run `npm run verify-css` before deployment to check for common CSS issues.
