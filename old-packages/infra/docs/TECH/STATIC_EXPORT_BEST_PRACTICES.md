# Static Export Best Practices

This document outlines best practices for developing Next.js applications that will be deployed as static exports using the `output: 'export'` option.

## Overview

Static export in Next.js pre-renders all pages to HTML at build time, resulting in a fully static site that can be deployed to any static hosting service like Amazon S3 with CloudFront. While this approach offers significant performance and cost benefits, it requires careful consideration of how browser-specific APIs are used.

## Common Issues with Static Export

### 1. Browser API Access During Server Rendering

During the static export build process, Next.js runs your components in a Node.js environment to generate HTML. Attempting to access browser-specific APIs during this phase will cause errors.

**Common problematic APIs:**

- `window`
- `document`
- `localStorage`
- `sessionStorage`
- Browser-specific objects like `navigator`
- Third-party libraries that use browser APIs (Google Maps, etc.)

### 2. Hydration Mismatches

React expects the server-rendered HTML to match what would be rendered client-side during hydration. If there are differences (often caused by conditional rendering based on browser APIs), React will throw hydration errors.

### 3. Infinite Re-renders

Components that don't properly handle initialization state can trigger infinite re-render loops, especially when context providers are involved.

## Best Practices

### 1. Safe Browser API Access

Always check if code is running in a browser environment before accessing browser APIs:

```typescript
// Good
useEffect(() => {
    if (typeof window !== 'undefined') {
        // Safe to access localStorage, window, etc.
        const savedValue = localStorage.getItem('key');
    }
}, []);

// Bad
const savedValue = localStorage.getItem('key'); // Will crash during static export
```

### 2. Provide Fallbacks for Server Rendering

Create fallback values for server-side rendering:

```typescript
// Good
const [value, setValue] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('key') : null
);

// Better (avoids hydration mismatch)
const [value, setValue] = useState(null);
useEffect(() => {
    if (typeof window !== 'undefined') {
        setValue(localStorage.getItem('key'));
    }
}, []);
```

### 3. Track Initialization State

Keep track of when components are fully initialized to prevent unnecessary re-renders:

```typescript
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
        // Perform one-time initialization
        setIsInitialized(true);
    }
}, [isInitialized]);
```

### 4. Use Error Boundaries

Wrap components that might throw errors with error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function MyComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ComponentThatMightError />
    </ErrorBoundary>
  );
}
```

### 5. Lazy Load Browser-Only Components

Use dynamic imports with `ssr: false` for components that rely heavily on browser APIs:

```typescript
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
    () => import('../components/MapComponent'),
    { ssr: false } // This component will only be rendered client-side
);
```

### 6. Detect Static Export Mode

Add a global flag to detect static export mode:

```typescript
// In _document.tsx
<script dangerouslySetInnerHTML={{
  __html: `
    window.IS_STATIC_EXPORT = true;
  `
}} />

// In your components
const isStaticExport = typeof window !== 'undefined' && (window as any).IS_STATIC_EXPORT;
```

### 7. Optimize Next.js Configuration

Configure Next.js for optimal static export:

```javascript
// next.config.js
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true, // Required for static export
    },
    // Disable features that don't work with static export
    experimental: {
        // Be careful with experimental features
    },
};
```

## Real-World Examples

### Context Provider Pattern

```typescript
export function MyContextProvider({ children }) {
  // Initialize with default values for SSR
  const [state, setState] = useState(defaultValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Only run initialization once in browser environment
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      try {
        // Initialize state from browser APIs
        const savedState = localStorage.getItem('myState');
        if (savedState) {
          setState(JSON.parse(savedState));
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing context:', error);
        setIsInitialized(true); // Still mark as initialized to prevent retries
      }
    }
  }, [isInitialized]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    setState,
    isInitialized
  }), [state, isInitialized]);

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
}
```

### Third-Party API Integration

```typescript
function MapComponent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      document.body.appendChild(script);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && !map) {
      // Initialize map
      const newMap = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      });
      setMap(newMap);
    }
  }, [isLoaded, map]);

  return <div id="map" style={{ height: '400px', width: '100%' }} />;
}

// Use with dynamic import
const DynamicMapComponent = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
});
```

## Conclusion

By following these best practices, you can create robust Next.js applications that work reliably with static export. The key principles are:

1. Always check for browser environment before accessing browser APIs
2. Provide fallbacks for server rendering
3. Track initialization state to prevent re-render loops
4. Use error boundaries to gracefully handle failures
5. Lazy load browser-dependent components
6. Detect static export mode for conditional logic
7. Optimize your Next.js configuration

These practices will help ensure your application works correctly when deployed as a static export to services like Amazon S3 with CloudFront.
