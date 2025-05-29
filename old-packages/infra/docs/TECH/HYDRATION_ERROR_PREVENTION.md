# Preventing Hydration Errors in Next.js Static Export

This document provides guidance on preventing hydration errors when using Next.js with static export, particularly for deployment to CloudFront and Lambda@Edge.

## What are Hydration Errors?

Hydration errors occur when the HTML generated during server-side rendering doesn't match what React expects to render on the client side. This mismatch causes React to throw an error and can lead to broken UI or unexpected behavior.

Common causes of hydration errors include:

1. Components that render differently based on client-side state
2. Components that use browser-specific APIs
3. SVG elements with dynamic attributes
4. Date/time formatting differences between server and client

## Solution: Client-Only Components

We've created reusable components to handle client-side only rendering:

### 1. ClientOnly Component

The `ClientOnly` component renders its children only on the client side, preventing hydration errors:

```tsx
// src/components/ui/client-only.tsx
import { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient ? <>{children}</> : <>{fallback}</>;
}
```

### 2. ClientSVG Component

The `ClientSVG` component is specifically designed for SVG elements that often cause hydration errors:

```tsx
// src/components/ui/client-svg.tsx
import React from 'react';
import { ClientOnly } from './client-only';

interface ClientSVGProps extends React.SVGProps<SVGSVGElement> {
    viewBox?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ClientSVG({
    viewBox = '0 0 24 24',
    children,
    fallback = null,
    ...props
}: ClientSVGProps) {
    return (
        <ClientOnly fallback={fallback}>
            <svg viewBox={viewBox} {...props}>
                {children}
            </svg>
        </ClientOnly>
    );
}
```

## Usage Examples

### Basic Client-Only Rendering

Use the `ClientOnly` component to wrap any component that might cause hydration errors:

```tsx
import { ClientOnly } from '@/components/ui/client-only';

function MyComponent() {
    return (
        <div>
            <h1>Server and Client Rendered</h1>

            <ClientOnly fallback={<div>Loading...</div>}>
                <div>This content only renders on the client</div>
            </ClientOnly>
        </div>
    );
}
```

### SVG Elements with Dynamic Attributes

Use the `ClientSVG` component or the pre-defined icons in the `Icons` object:

```tsx
import { ClientSVG, Icons } from '@/components/ui/client-svg';

function IconExample({ isActive }) {
    return (
        <div>
            {/* Using pre-defined icons */}
            <button>
                {isActive ? (
                    <Icons.Star className="w-4 h-4" />
                ) : (
                    <Icons.StarOutline className="w-4 h-4" />
                )}
            </button>

            {/* Using ClientSVG directly */}
            <ClientSVG className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </ClientSVG>
        </div>
    );
}
```

### Browser APIs

For components that use browser APIs, always wrap them with `ClientOnly`:

```tsx
function LocationComponent() {
    return (
        <ClientOnly fallback={<div>Loading location...</div>}>
            <BrowserLocationComponent />
        </ClientOnly>
    );
}

// This component uses browser APIs and should only render client-side
function BrowserLocationComponent() {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        }
    }, []);

    return location ? (
        <div>
            Your location: {location.lat}, {location.lng}
        </div>
    ) : (
        <div>Getting your location...</div>
    );
}
```

## Next.js Configuration

To support both development and production environments, configure Next.js to only use static export in production:

```js
// next.config.js
const nextConfig = {
    // Only use static export in production
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

    // Configure headers only in production
    headers:
        process.env.NODE_ENV === 'production'
            ? async () => {
                  return [
                      {
                          source: '/:path*',
                          headers: [
                              {
                                  key: 'Cache-Control',
                                  value: 'public, max-age=3600, s-maxage=86400',
                              },
                          ],
                      },
                  ];
              }
            : undefined,

    // Set STATIC_EXPORT environment variable conditionally
    webpack: (config, { dev, isServer }) => {
        // Add environment variables
        config.plugins.forEach((plugin) => {
            if (plugin.constructor.name === 'DefinePlugin') {
                Object.assign(plugin.definitions, {
                    'process.env.STATIC_EXPORT': JSON.stringify(
                        process.env.NODE_ENV === 'production'
                    ),
                });
            }
        });

        return config;
    },
};
```

## Best Practices

1. **Always use `ClientOnly` for:**

    - Components that use browser APIs (window, document, localStorage, etc.)
    - Components with dynamic SVG elements
    - Third-party components that might not be SSR-compatible

2. **Provide fallbacks:**

    - Always provide a fallback UI for client-only components
    - Keep fallbacks simple to avoid their own hydration issues

3. **Minimize client-only components:**

    - Only wrap the specific parts that need client-side rendering
    - Keep as much of your UI server-rendered as possible for better SEO and performance

4. **Test in both environments:**
    - Test in development mode with server-side rendering
    - Test in production mode with static export

By following these guidelines, you can prevent hydration errors while maintaining the benefits of static export for CloudFront and Lambda@Edge deployment.
