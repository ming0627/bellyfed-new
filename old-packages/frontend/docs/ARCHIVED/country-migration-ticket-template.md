# Country Routing Migration Ticket Template

## Title

Migrate [Page Name] to Dynamic Country Routing

## Description

### Background

We are transitioning from hardcoded country routes (e.g., `/my/page-name`) to dynamic country routes (e.g., `/[country]/page-name`). This ticket covers migrating the [Page Name] page to the new routing system.

### Requirements

- Create a new dynamic country page at `src/pages/[country]/page-name.tsx`
- Ensure proper fallback to default country for invalid country codes
- Maintain all existing functionality
- Update any internal links to use the dynamic route
- Verify SEO metadata is correctly preserved

### Implementation Steps

1. Use the template at `src/templates/DynamicCountryPageTemplate.tsx` as a starting point
2. Update the redirect path in the `useEffect` hook to match your page
3. Replace the placeholder component with your actual page component
4. Customize `getStaticProps` if additional data fetching is required
5. Create/update the fallback page at `src/pages/my/page-name.tsx` if needed
6. Test with valid country codes (e.g., `/my/page-name`, `/sg/page-name`)
7. Test with invalid country codes (should redirect to default)
8. Update any hardcoded internal links to the page

### Testing

- Verify the page loads correctly with valid country codes
- Verify invalid country codes redirect to the default country
- Test all page functionality to ensure it works as expected
- Verify SEO tags are correctly applied
- Check for any broken links or styling issues

### Resources

- [Country Routing Migration Guide](../docs/country-routing-migration-guide.md)
- [DynamicCountryPageTemplate](../src/templates/DynamicCountryPageTemplate.tsx)
- [Country Route Helpers](../src/utils/countryRouteHelpers.ts)
- [Example Implementation](../src/pages/[country]/example-migration.tsx)

## Acceptance Criteria

- [ ] Page is accessible via `/{country}/page-name` for all valid country codes
- [ ] Invalid country codes redirect to `/my/page-name`
- [ ] All existing functionality works correctly
- [ ] Internal links to the page use the dynamic route
- [ ] SEO metadata is correctly preserved
- [ ] Build passes without new errors
- [ ] Code follows the established patterns

## Definition of Done

- [ ] Code passes linting and type checks
- [ ] Changes have been peer-reviewed
- [ ] Testing completed for all supported countries
- [ ] PR merged and deployed to staging
- [ ] Verified in production
