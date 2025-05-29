# Security Headers in Bellyfed

This document explains the security headers implemented in the Bellyfed application and how to test them.

## Content Security Policy (CSP)

The Content Security Policy (CSP) is a security feature that helps prevent cross-site scripting (XSS) and other code injection attacks. It works by specifying which content sources the browser should consider valid.

### Current CSP Configuration

```
default-src 'self';
img-src 'self' data: https://* blob:;
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://*.execute-api.*.amazonaws.com https://*.bellyfed.com;
font-src 'self' data:;
frame-ancestors 'none';
object-src 'none';
```

### Directives Explained

- `default-src 'self'`: Only allow resources from the same origin by default
- `img-src 'self' data: https://* blob:`: Allow images from same origin, data URLs, any HTTPS source, and blob URLs
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Allow scripts from same origin, inline scripts, and eval functions
- `style-src 'self' 'unsafe-inline'`: Allow styles from same origin and inline styles
- `connect-src 'self' https://*.amazonaws.com...`: Allow connections to same origin and specified AWS/Bellyfed domains
- `font-src 'self' data:`: Allow fonts from same origin and data URLs
- `frame-ancestors 'none'`: Prevent the page from being embedded in frames
- `object-src 'none'`: Prevent object, embed, and applet elements

## Other Security Headers

In addition to CSP, the application implements the following security headers:

- **X-Content-Type-Options: nosniff**: Prevents browsers from MIME-sniffing a response away from the declared content-type
- **X-Frame-Options: DENY**: Prevents the page from being displayed in a frame
- **X-XSS-Protection: 1; mode=block**: Enables the browser's XSS filter
- **Referrer-Policy: strict-origin-when-cross-origin**: Limits the information sent in the Referer header

## Implementation

Security headers are implemented in two places:

1. **Middleware**: In `src/middleware.ts`, headers are added to all responses
2. **Next.js Config**: In `next.config.js`, headers are configured for all routes

## Testing Security Headers

### Automated Tests

The application includes several tests for security headers:

1. **Unit Tests**: Test the middleware function directly

   ```bash
   npm test -- middleware.test.ts
   ```

2. **Integration Tests**: Test the application's responses

   ```bash
   npm run test:security
   ```

3. **Deployment Check**: Check headers in a deployed environment
   ```bash
   npm run check-headers https://app-dev.bellyfed.com
   ```

### Manual Testing

You can manually check security headers using browser developer tools:

1. Open the application in Chrome or Firefox
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Click on any request to the application
5. Look at the Response Headers section

## Common Issues

### CSP Violations

If you see CSP violations in the console, you may need to:

1. Add the source to the appropriate directive in the CSP
2. Modify the code to comply with the CSP

### Missing Headers

If security headers are missing, check:

1. The middleware implementation
2. The Next.js configuration
3. Any proxy or CDN configuration that might be stripping headers

## Best Practices

1. **Regularly Test Headers**: Run the header check script regularly
2. **Update CSP as Needed**: When adding new resources, update the CSP
3. **Monitor CSP Violations**: Set up CSP reporting to monitor violations
4. **Minimize Unsafe Directives**: Try to minimize the use of 'unsafe-inline' and 'unsafe-eval'
