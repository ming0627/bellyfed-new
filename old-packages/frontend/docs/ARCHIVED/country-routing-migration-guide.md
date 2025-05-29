# Country Routing Migration Guide

This guide provides detailed instructions for migrating pages from the old `/my/` route structure to the new dynamic country routing system using `[country]` path parameter.

## Background

We are moving from a dual routing system with hardcoded country paths (e.g., `/my/restaurants`) to a dynamic country-based routing system (e.g., `/[country]/restaurants`). This change enhances flexibility, simplifies routing logic, and provides better support for multi-country deployments.

## Migration Process

### Step 1: Check if a dynamic page already exists

First, check if a dynamic page already exists at `src/pages/[country]/your-page-name.tsx`. If it does, you may only need to update it to ensure proper country validation and redirect handling.

### Step 2: Create a new dynamic country page

If the dynamic page doesn't exist yet, you'll need to create one:

1. Create a new file at `src/pages/[country]/your-page-name.tsx`
2. Use the template below as a starting point

```tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { COUNTRIES } from '@/config/countries';

// Import your actual page component
import YourPageComponent from '@/components/YourPageComponent';

export default function DynamicCountryPage() {
  const router = useRouter();
  const { country } = router.query;

  // Validate country code
  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      // Redirect to default country if the code is invalid
      router.replace('/my/your-page-name');
    }
  }, [country, router]);

  // Extract any other path or query parameters you need
  const { otherParam } = router.query;

  // Pass necessary props to your component
  return (
    <YourPageComponent
      country={country as string}
      otherParam={otherParam as string}
    />
  );
}

// Pre-render for valid country codes
export async function getStaticPaths() {
  return {
    paths: Object.keys(COUNTRIES).map((countryCode) => ({
      params: { country: countryCode },
    })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
}: {
  params: { country: string };
}) {
  return {
    props: {
      country: params.country,
    },
    revalidate: 3600,
  };
}
```

### Step 3: Update or create the base component

If your page logic is already in a separate component, you may not need to change it. Otherwise:

1. Extract the core functionality from your existing page into a reusable component
2. Place it in an appropriate location in the component structure
3. Ensure it accepts the necessary props (country code, etc.)

### Step 4: Test thoroughly

Test the new dynamic page with:

1. Valid country codes (e.g., `/my/your-page`, `/sg/your-page`)
2. Invalid country codes (should redirect to default)
3. All query parameters and interactions
4. Performance and SEO considerations

### Step 5: Update references

Update any links or redirects in your application that point to the old route:

1. Update navigation menus
2. Update any hardcoded links in components
3. Update any redirects in other pages
4. Update SEO metadata

## Examples

### Before: `/pages/my/restaurants.tsx`

```tsx
import RestaurantListComponent from '@/components/RestaurantListComponent';

export default function MyRestaurants() {
  return <RestaurantListComponent country="my" />;
}
```

### After: `/src/pages/[country]/restaurants.tsx`

```tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { COUNTRIES } from '@/config/countries';
import RestaurantListComponent from '@/components/RestaurantListComponent';

export default function CountryRestaurants() {
  const router = useRouter();
  const { country } = router.query;

  useEffect(() => {
    if (country && !COUNTRIES[country as string]) {
      router.replace('/my/restaurants');
    }
  }, [country, router]);

  return <RestaurantListComponent country={country as string} />;
}

export async function getStaticPaths() {
  return {
    paths: Object.keys(COUNTRIES).map((countryCode) => ({
      params: { country: countryCode },
    })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
}: {
  params: { country: string };
}) {
  return {
    props: {
      country: params.country,
    },
    revalidate: 3600,
  };
}
```

## Handling Special Cases

### Pages with API calls

If your page makes API calls that depend on the country code:

1. Update API service functions to accept the country code as a parameter
2. Update any hardcoded country references in API call parameters
3. Pass the country code from the dynamic page to your API service

### Pages with authentication

If your page requires authentication:

1. Make sure authentication checks still work with the dynamic country code
2. Update any redirect URLs to use the dynamic country code

### Pages with complex state

If your page manages complex state:

1. Make sure state initialization respects the country parameter
2. Update any country-dependent state logic

## Timeline

Aim to complete the migration for all pages within the timeline specified in the migration plan. Remember to coordinate with other team members to avoid conflicts during the migration process.

## Getting Help

If you encounter issues during migration:

1. Refer to Next.js documentation for dynamic routing
2. Check the implementation of already migrated pages
3. Reach out to the tech lead for assistance
