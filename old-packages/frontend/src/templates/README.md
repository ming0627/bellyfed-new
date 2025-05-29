# Bellyfed Templates

This directory contains templates for common patterns and components used throughout the Bellyfed application.

## Templates

### DynamicCountryPageTemplate.tsx

A template for creating new country-specific pages using Next.js dynamic routing with the `[country]` parameter.

#### Purpose

This template provides a standardized approach for creating country-specific pages with proper routing, validation, and data handling. It ensures that all country-specific pages follow the same pattern and include essential functionality.

#### Features

- Country code validation with redirection to default country for invalid codes
- Pre-rendering of pages for all supported country codes
- Type-safe implementation with TypeScript
- Loading state management with React Suspense
- Structured approach for adding country-specific data fetching

#### Usage

1. Copy `DynamicCountryPageTemplate.tsx` to `src/pages/[country]/your-page-name.tsx`
2. Replace the placeholder component with your actual component
3. Update imports to include your components and required data
4. Customize `getStaticProps` for country-specific data fetching if needed
5. Update the page name in the router.replace path (e.g., `/my/your-page-name`)

#### Code Snippets

**Basic Template Structure:**

```tsx
export default function YourCountryPage() {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code and redirect if invalid
  useEffect(() => {
    if (country && typeof country === 'string' && !COUNTRIES[country]) {
      router.replace('/my/your-page-name');
    }
  }, [country, router]);

  return <YourPageComponent />;
}

// Pre-render paths for all valid countries
export async function getStaticPaths() {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  // Country-specific data fetching
  return {
    props: {
      // Your props here
    },
  };
}
```

#### Notes

- The template uses placeholder code that might cause linter errors until replaced with actual implementations
- Be sure to uncomment the actual imports when implementing your page
- Update the fallback strategy based on your page's needs (true/false/blocking)
