# Pages Directory Removal Plan

## Overview

This document outlines the plan for completely removing the legacy `/pages` directory and finalizing our transition to the dynamic country routing system using only `/src/pages/[country]`.

## Current Status

We've made significant progress in our migration:

1. ✅ Middleware has been updated to support dynamic country routing
2. ✅ Template and helper utilities have been created for migrating pages
3. ✅ Most country-specific content pages have been migrated to `/src/pages/[country]/`
4. ❌ `/pages` directory still exists with wrapper components for backward compatibility

## Migration Tasks

### 1. Review API Routes

All API routes should be in `/src/pages/api`. There are still some routes in `/pages/api` that need to be migrated:

- [ ] Inventory all API routes in `/pages/api/admin`
- [ ] Migrate any missing API routes to `/src/pages/api/*`
- [ ] Verify API functionality after migration

### 2. Review Special Pages

Special pages that don't use country routing need to be moved:

- [ ] Move `/pages/_app.tsx` functionality to `/src/pages/_app.tsx` (if not already done)
- [ ] Verify `/pages/signin.tsx` is fully migrated to `/src/pages/signin.tsx`
- [ ] Check if `/pages/index.tsx` needs to be updated

### 3. Remove Wrapper Components

The `/pages/my/*` files are currently wrapper components that import from `/src/pages/[country]/*`. These should be removed after ensuring redirects work:

- [ ] Verify middleware properly redirects `/my/*` routes to `/my/*` with the dynamic implementation
- [ ] Add deprecation console warnings to all wrapper components
- [ ] Test all routes to ensure they work properly without the wrappers

### 4. Update References

Update any remaining code that references the old structure:

- [ ] Search for hardcoded references to `/pages/my/` in imports
- [ ] Search for hardcoded references to `/my/` in navigation links
- [ ] Update any documentation that references the old structure

### 5. Clean Up and Removal

After thorough testing, delete the `/pages` directory:

- [ ] Back up the `/pages` directory (optional, since we have version control)
- [ ] Remove the `/pages` directory
- [ ] Run build and test to ensure no errors
- [ ] Deploy and verify in staging environment

## Implementation Steps

### Step 1: Migrate API Routes

For each API route in `/pages/api`:

1. Create the same file path in `/src/pages/api`
2. Copy the implementation, updating any imports as necessary
3. Test the API functionality to ensure it works the same

Example:

```typescript
// Move from /pages/api/admin/example.ts to /src/pages/api/admin/example.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Implementation remains the same
}
```

### Step 2: Update Special Next.js Pages

For special Next.js pages like `_app.tsx`:

1. Ensure `/src/pages/_app.tsx` contains all necessary functionality
2. Verify that no custom logic exists in `/pages/_app.tsx` that isn't in the `/src/pages` version

### Step 3: Update Middleware for Hard Removal

Update middleware to handle complete removal of `/pages/my`:

```typescript
// In src/middleware.ts
if (pathSegments[0] === 'my') {
  // Set a 301 redirect from /my/* to /my/* using the dynamic country route
  const url = request.nextUrl.clone();
  url.pathname = `/my${pathname.substring(3)}`;

  // Add a response header to indicate this is a legacy route
  const response = NextResponse.redirect(url, 301);
  response.headers.set('X-Legacy-Route', 'true');
  addSecurityHeaders(response);
  return response;
}
```

### Step 4: Testing Procedure

Before removing `/pages`:

1. Create a comprehensive list of all routes in the application
2. Test each route with and without the country parameter
3. Test with invalid country codes to ensure proper fallbacks
4. Test the expected redirects from old routes to new routes
5. Verify all links work correctly throughout the application
6. Verify authentication flows work correctly

### Step 5: Deployment Strategy

To minimize impact:

1. Deploy the updated middleware before removing `/pages`
2. Monitor for any error spikes
3. If no issues are found, remove `/pages`
4. Deploy the final version without `/pages`
5. Continue monitoring for any issues

## Timeline

**Day 1-2**: Migrate API routes and test
**Day 3-4**: Update middleware and prepare for removal  
**Day 5**: Testing all routes
**Day 6**: Deploy changes to staging and verify
**Day 7**: Deploy to production and remove `/pages`

## Rollback Plan

If issues arise:

1. Restore the `/pages` directory from version control
2. Revert middleware changes to use the old routing system
3. Deploy the reverted changes

## Conclusion

Once this plan is completed, we will have fully migrated to the new dynamic country routing system. This will simplify our codebase, make it more maintainable, and better support multi-country deployments.
