# Content Security Policy (CSP) Configuration

This document explains the Content Security Policy (CSP) configuration for the Bellyfed application.

## Overview

Content Security Policy is a security feature that helps prevent cross-site scripting (XSS) and other code injection attacks. It works by specifying which content sources the browser should consider valid.

## Current CSP Configuration

Our current CSP configuration is:

```
default-src 'self';
img-src 'self' data: https://* blob:;
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com;
connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://*.execute-api.*.amazonaws.com https://*.bellyfed.com;
font-src 'self' data: https://stackpath.bootstrapcdn.com https://fonts.gstatic.com;
frame-ancestors 'none';
object-src 'none';
```

### Directives Explained

- **default-src 'self'**: By default, only allow content from the same origin
- **img-src 'self' data: https://\* blob:**: Allow images from the same origin, data URLs, any HTTPS source, and blob URLs
- **script-src 'self' 'unsafe-inline' 'unsafe-eval'**: Allow scripts from the same origin, inline scripts, and eval()
- **style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com**: Allow styles from the same origin, inline styles, and specific external sources
- **connect-src 'self' https://_.amazonaws.com https://_.amazoncognito.com https://_.execute-api._.amazonaws.com https://\*.bellyfed.com**: Allow connections to the same origin and specific AWS services
- **font-src 'self' data: https://stackpath.bootstrapcdn.com https://fonts.gstatic.com**: Allow fonts from the same origin, data URLs, and specific external sources
- **frame-ancestors 'none'**: Don't allow the page to be embedded in frames
- **object-src 'none'**: Don't allow plugins (object, embed, applet)

## Implementation

The CSP is implemented in three places:

1. **Middleware**: In `src/middleware.ts`, the CSP is added to all responses
2. **Next.js Config**: In `next.config.js`, the CSP is configured for static export
3. **CloudFront**: In the infrastructure code, the CSP is configured for the CloudFront distribution

## External Resources

The following external resources are allowed by our CSP:

### Styles (style-src)

- https://stackpath.bootstrapcdn.com (Font Awesome)
- https://fonts.googleapis.com (Google Fonts)

### Fonts (font-src)

- https://stackpath.bootstrapcdn.com (Font Awesome)
- https://fonts.gstatic.com (Google Fonts)

### Connections (connect-src)

- https://\*.amazonaws.com (AWS services)
- https://\*.amazoncognito.com (AWS Cognito)
- https://_.execute-api._.amazonaws.com (AWS API Gateway)
- https://\*.bellyfed.com (Bellyfed API)

## Testing

To test the CSP configuration, you can:

1. Open the browser's developer tools
2. Go to the Console tab
3. Look for any CSP violation errors

We also have automated tests in `src/tests/csp.test.ts` that verify the CSP configuration.

## Troubleshooting

If you see CSP violation errors in the console, you may need to:

1. Add the source to the appropriate directive in the CSP
2. Update the CSP in all three places (middleware, Next.js config, CloudFront)
3. Run the CSP tests to verify the changes

## Best Practices

1. Always use the most restrictive CSP possible
2. Avoid using 'unsafe-inline' and 'unsafe-eval' when possible
3. Use nonces or hashes for inline scripts and styles when possible
4. Keep the CSP configuration in sync across all implementations
