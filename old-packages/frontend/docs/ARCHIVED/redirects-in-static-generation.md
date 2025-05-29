# Redirects in Next.js Static Generation

## Problem

When using Next.js with static generation (such as in a Docker container or when deploying to environments that use `next export`), there are limitations on how redirects can be implemented.

Specifically, we encountered an issue where using `redirect` in `getStaticProps` caused build failures with the following error:

```
TypeError: Cannot read properties of undefined (reading 'bind')
```

This occurs because redirects in `getStaticProps` are not compatible with static generation, as they require server-side functionality that isn't available in a purely static build.

## Solution

Instead of using server-side redirects in `getStaticProps`, use a combination of client-side approaches:

1. Use `useEffect` for client-side redirection
2. Add a meta refresh tag as a fallback
3. Keep the page content minimal

## Correct Implementation

Here's the correct way to implement a redirect on the index page:

```tsx
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  // Default country to use - could be set from browser locale, user preferences, etc.
  const defaultCountry = 'my';

  useEffect(() => {
    // Redirect to the default country page
    router.replace(`/${defaultCountry}`);
  }, [router]);

  // Return a minimal div instead of null to ensure index.html generation
  return (
    <div style={{ display: 'none' }}>
      <Head>
        <title>Bellyfed - Redirecting...</title>
        <meta name="description" content="Redirecting to Bellyfed" />
        {/* Add meta refresh as a fallback for static export */}
        <meta httpEquiv="refresh" content={`0;url=/${defaultCountry}`} />
      </Head>
      Redirecting to country page...
    </div>
  );
}

// Add getStaticProps to ensure the page is pre-rendered, but WITHOUT a redirect
export async function getStaticProps() {
  return {
    props: {},
  };
}
```

## Problematic Implementation (Do Not Use)

The following implementation will cause errors in static generation:

```tsx
// DO NOT USE THIS APPROACH
export async function getStaticProps() {
  const defaultCountry = 'my';

  return {
    props: {},
    // This will cause errors in static generation
    redirect: {
      destination: `/${defaultCountry}`,
      permanent: false,
    },
  };
}
```

## Additional Notes

- For dynamic routes that need redirection, always use client-side redirection logic
- The middleware can still handle redirects for non-static paths
- For SEO purposes, consider using proper canonical URLs in the `<head>` section

## Related Documentation

- [Next.js Redirects Documentation](https://nextjs.org/docs/api-reference/next.config.js/redirects)
- [Static Generation Limitations](https://nextjs.org/docs/advanced-features/static-html-export#unsupported-features)
