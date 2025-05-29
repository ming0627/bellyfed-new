# Preventing Hydration Errors in Next.js

This guide explains how to prevent hydration errors in our Next.js application, especially when using static export.

## What are Hydration Errors?

Hydration errors occur when the HTML generated on the server doesn't match what React expects to render on the client. This commonly happens with:

- SVG elements with dynamic attributes
- Components that use browser APIs (window, document, localStorage)
- Components with state that changes immediately after mounting

## Solutions

We've implemented several solutions to prevent hydration errors:

### 1. Use the `ClientOnly` Component

For components that should only render on the client:

```tsx
import { ClientOnly } from '@/components/ui/client-only';

function MyComponent() {
  return (
    <ClientOnly>
      <ComponentWithBrowserAPIs />
    </ClientOnly>
  );
}
```

You can also provide a fallback to show during server rendering:

```tsx
<ClientOnly fallback={<LoadingSpinner />}>
  <ComplexChart data={data} />
</ClientOnly>
```

### 2. Use the `ClientSVG` Component

For SVG icons, especially those with dynamic attributes:

```tsx
import { ClientSVG } from '@/components/ui/client-svg';

function StarIcon({ filled }) {
  return (
    <ClientSVG className="w-4 h-4 text-yellow-500">
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </ClientSVG>
  );
}
```

### 3. Use Conditional Hooks

When using hooks that access browser APIs:

```tsx
function MyComponent() {
  const [browserData, setBrowserData] = useState(null);

  useEffect(() => {
    // Only run on the client
    if (typeof window !== 'undefined') {
      setBrowserData(window.localStorage.getItem('myData'));
    }
  }, []);

  // Safe to render server-side
  return <div>{browserData || 'Loading...'}</div>;
}
```

### 4. Use Dynamic Imports for Browser-Only Components

For components that rely heavily on browser APIs:

```tsx
import dynamic from 'next/dynamic';

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }, // Never renders on the server
);

function LocationPage() {
  return (
    <div>
      <h1>Our Location</h1>
      <MapComponent />
    </div>
  );
}
```

## Best Practices

1. **Avoid Conditional Rendering Based on State That Changes After Mount**

   - This is the most common cause of hydration errors

2. **Initialize State with Values That Work on Both Server and Client**

   - Use empty arrays, null, or default values that make sense

3. **Use Feature Detection Instead of Browser Detection**

   - Check for specific APIs rather than assuming browser environment

4. **Test in Development Mode**

   - Hydration errors are more visible in development

5. **Consider Using React Suspense**
   - For data fetching and loading states

## Debugging Hydration Errors

If you encounter a hydration error:

1. Look at the component mentioned in the error
2. Check for any state that changes immediately after mounting
3. Look for browser API usage
4. Wrap the problematic part with `ClientOnly`
5. For SVGs with dynamic attributes, use `ClientSVG`

Remember: The goal is to ensure the initial render on the client matches exactly what was rendered on the server.
