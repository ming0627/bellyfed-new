# Authentication Quick Reference Guide

## Overview

BellyFed uses a secure server-side authentication system with AWS Cognito and HttpOnly cookies. This guide provides a quick reference for developers working with the authentication system.

## Key Components

- **Server-Side API Endpoints** (`/api/auth/*`): Handle authentication operations
- **Middleware**: Protects routes using HttpOnly cookies
- **AuthContext**: Provides authentication state to React components
- **ProtectedRoute**: Component for restricting access to authenticated users

## API Endpoints

| Endpoint            | Method | Purpose                                      |
| ------------------- | ------ | -------------------------------------------- |
| `/api/auth/login`   | POST   | Authenticates user and sets HttpOnly cookies |
| `/api/auth/logout`  | POST   | Logs out user and clears cookies             |
| `/api/auth/refresh` | POST   | Refreshes authentication tokens              |
| `/api/auth/status`  | GET    | Checks authentication status                 |
| `/api/debug-auth`   | GET    | Provides debugging information               |

## Authentication Flow

1. **Sign In**:

   - User submits credentials to `/api/auth/login`
   - Server authenticates with Cognito and sets HttpOnly cookies
   - Client updates UI based on authentication state

2. **Session Validation**:

   - Middleware checks HttpOnly cookies on protected routes
   - If valid, request proceeds; if invalid, redirects to sign in

3. **Token Refresh**:

   - When tokens expire, client calls `/api/auth/refresh`
   - Server uses refresh token to obtain new tokens
   - HttpOnly cookies are updated with new tokens

4. **Sign Out**:
   - User initiates sign out
   - Client calls `/api/auth/logout`
   - Server clears HttpOnly cookies and invalidates session in Cognito

## Code Examples

### Protecting a Page

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      <div>
        <h1>Profile Page</h1>
        {/* Protected content */}
      </div>
    </ProtectedRoute>
  );
};
```

### Accessing Authentication State

```tsx
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name || user?.username}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

### Protecting API Routes

```typescript
import { withApiAuth } from '@/utils/serverAuth';

const handler = async (req, res) => {
  // The user object is added to the request by withApiAuth
  const user = req.user;

  // Protected API logic here
  res.status(200).json({ data: 'Protected data' });
};

export default withApiAuth(handler);
```

### Making Authenticated API Requests

```typescript
// Always include credentials to send cookies
const response = await fetch('/api/protected-endpoint', {
  method: 'GET',
  credentials: 'include',
});
```

## Security Best Practices

1. **Never store tokens in localStorage or sessionStorage**
2. **Always use HttpOnly cookies for authentication tokens**
3. **Include `credentials: 'include'` in fetch requests**
4. **Use the ProtectedRoute component for protected pages**
5. **Implement CSRF protection for authentication endpoints**

## Troubleshooting

If authentication issues occur:

1. Check browser cookies to ensure HttpOnly cookies are set
2. Use `/api/debug-auth` endpoint to check authentication state
3. Check browser console for errors
4. Verify that API requests include `credentials: 'include'`
5. Check that the middleware is correctly identifying authenticated users
6. Verify that the refresh token mechanism is working properly:
   - Check that the refresh token cookie is being set with a long expiration
   - Ensure the `/api/auth/refresh` endpoint is accessible
   - Verify that the status endpoint is attempting to refresh tokens when needed

For more detailed information, see the full [Authentication Documentation](./authentication.md).
