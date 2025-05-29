# BellyFed Authentication Documentation

## Overview

BellyFed uses a secure server-side authentication system based on AWS Cognito for user management and HttpOnly cookies for session management. This approach provides robust security by keeping authentication tokens server-side and inaccessible to client-side JavaScript.

## Authentication Architecture

The authentication system consists of the following components:

1. **Server-Side API Endpoints** (`/api/auth/*`): Handle authentication operations like login, logout, token refresh, and status checks.
2. **Middleware**: Protects routes by verifying authentication status using HttpOnly cookies.
3. **AuthContext**: Provides authentication state and methods to React components.
4. **AuthStateManager**: Manages authentication state persistence across page loads and refreshes.
5. **ProtectedRoute**: Component that restricts access to authenticated users only.

## Authentication Flow

### Sign In Flow

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐
│  Browser │     │ Next.js API│     │ AWS Cognito  │     │ Database│
└────┬─────┘     └─────┬─────┘     └──────┬───────┘     └────┬────┘
     │                 │                   │                  │
     │ POST /api/auth/login                │                  │
     │────────────────>│                   │                  │
     │                 │ InitiateAuth      │                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │ AuthenticationResult                 │
     │                 │<──────────────────│                  │
     │                 │                   │                  │
     │                 │ Set HttpOnly Cookies                 │
     │ Response with   │                   │                  │
     │ HttpOnly Cookies│                   │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
     │ GET /api/auth/status                │                  │
     │────────────────>│                   │                  │
     │                 │ GetUser           │                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │ User Attributes   │                  │
     │                 │<──────────────────│                  │
     │                 │                   │                  │
     │ User Info       │                   │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
```

### Token Refresh Flow

```
┌──────────┐     ┌───────────┐     ┌──────────────┐
│  Browser │     │ Next.js API│     │ AWS Cognito  │
└────┬─────┘     └─────┬─────┘     └──────┬───────┘
     │                 │                   │
     │ POST /api/auth/refresh              │
     │────────────────>│                   │
     │                 │ InitiateAuth      │
     │                 │ (REFRESH_TOKEN)   │
     │                 │──────────────────>│
     │                 │                   │
     │                 │ New Tokens        │
     │                 │<──────────────────│
     │                 │                   │
     │                 │ Update HttpOnly Cookies
     │ Response with   │                   │
     │ Updated Cookies │                   │
     │<────────────────│                   │
     │                 │                   │
```

### Protected Route Flow

```
┌──────────┐     ┌───────────┐     ┌──────────────┐
│  Browser │     │ Next.js    │     │ Middleware   │
└────┬─────┘     │ Page Router│     │              │
     │           └─────┬─────┘     └──────┬───────┘
     │ Request         │                   │
     │ Protected Page  │                   │
     │─────────────────────────────────────>
     │                 │                   │
     │                 │                   │ Check HttpOnly
     │                 │                   │ Cookies
     │                 │                   │
     │                 │                   │ If Not Authenticated
     │ Redirect to     │                   │
     │ Sign In Page    │                   │
     │<─────────────────────────────────────
     │                 │                   │
     │                 │                   │ If Authenticated
     │ Protected Page  │                   │
     │ Content         │                   │
     │<─────────────────────────────────────
     │                 │                   │
```

## API Endpoints

### `/api/auth/login`

**Method**: POST
**Purpose**: Authenticates a user and sets HttpOnly cookies
**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "isSignedIn": true,
  "isAuthenticated": true,
  "username": "user@example.com",
  "email": "user@example.com",
  "expiresAt": 1634567890000
}
```

**Cookies Set**:

- `access_token`: HttpOnly cookie containing the Cognito access token
- `id_token`: HttpOnly cookie containing the Cognito ID token
- `refresh_token`: HttpOnly cookie containing the Cognito refresh token
- `auth_email`: HttpOnly cookie containing the user's email

### `/api/auth/logout`

**Method**: POST
**Purpose**: Logs out a user by clearing HttpOnly cookies and invalidating the session in Cognito
**Request Body**: None
**Response**:

```json
{
  "success": true,
  "isAuthenticated": false
}
```

**Cookies Cleared**:

- `access_token`
- `id_token`
- `refresh_token`
- `auth_email`

### `/api/auth/refresh`

**Method**: POST
**Purpose**: Refreshes authentication tokens using the refresh token
**Request Body**: None (uses refresh_token cookie)
**Response**:

```json
{
  "success": true,
  "isAuthenticated": true,
  "email": "user@example.com",
  "expiresAt": 1634567890000
}
```

**Cookies Updated**:

- `access_token`: Updated with new access token
- `id_token`: Updated with new ID token
- `auth_email`: Preserved

### `/api/auth/status`

**Method**: GET
**Purpose**: Checks the current authentication status and returns user information
**Request Body**: None (uses access_token cookie)
**Response**:

```json
{
  "isAuthenticated": true,
  "user": {
    "id": "user-uuid",
    "username": "user@example.com",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### `/api/debug-auth`

**Method**: GET
**Purpose**: Provides debugging information about authentication state
**Request Body**: None
**Response**:

```json
{
  "authState": {
    "hasAccessToken": true,
    "hasIdToken": true,
    "hasRefreshToken": true
  },
  "cookieNames": ["access_token", "id_token", "refresh_token", "auth_email"],
  "requestHeaders": {
    "host": "example.com",
    "referer": "https://example.com/page",
    "user-agent": "Mozilla/5.0..."
  }
}
```

## Security Features

### HttpOnly Cookies

All authentication tokens are stored in HttpOnly cookies, which means they cannot be accessed by client-side JavaScript. This protects against XSS attacks that attempt to steal authentication tokens.

### Server-Side Validation

All authentication operations are performed server-side, with tokens validated against AWS Cognito. This ensures that even if a client attempts to forge cookies, they will be rejected by the server.

### Automatic Token Refresh

The system automatically refreshes tokens when they expire, ensuring a seamless user experience while maintaining security. The refresh mechanism works as follows:

1. When a user's access token expires, the system attempts to use the refresh token to obtain new tokens
2. If the refresh is successful, new HttpOnly cookies are set with the updated tokens
3. The user's session continues seamlessly without requiring re-authentication
4. If the refresh fails, the user is redirected to the login page

### CSRF Protection

The login form includes CSRF protection to prevent cross-site request forgery attacks. Additionally, the refresh token endpoint can accept a CSRF token to provide an extra layer of security.

## Implementation Details

### Middleware (middleware.ts)

The middleware checks for authentication on protected routes by verifying the presence of HttpOnly cookies:

```typescript
// Check if user is authenticated by looking for auth tokens in cookies
const accessToken = request.cookies.get('access_token');
const idToken = request.cookies.get('id_token');
const refreshToken = request.cookies.get('refresh_token');

// User is authenticated if they have:
// 1. Both access and ID tokens, OR
// 2. A refresh token (which can be used to obtain new tokens)
const isAuthenticated = !!(accessToken && idToken) || !!refreshToken;
```

### AuthContext (contexts/AuthContext.tsx)

The AuthContext provides authentication state and methods to React components:

```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status from the server
  const checkAuthStatus = async () => {
    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include', // Important to include cookies
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    return { isAuthenticated: false };
  };

  // Other authentication methods...
};
```

### ProtectedRoute (components/ProtectedRoute.tsx)

The ProtectedRoute component restricts access to authenticated users only:

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if we're authenticated according to the AuthContext
    if (isAuthenticated) {
      setIsChecking(false);
    } else {
      // If not authenticated, redirect to signin
      redirectToSignin(router);
    }
  }, [router, isAuthenticated]);

  // Render logic...
};
```

## Usage Examples

### Protecting a Page

To protect a page, use the ProtectedRoute component:

```tsx
// pages/profile.tsx
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

export default ProfilePage;
```

### Accessing Authentication State

To access authentication state in a component:

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

To protect an API route, use the withApiAuth higher-order function:

```typescript
// pages/api/user/profile.ts
import { withApiAuth } from '@/utils/serverAuth';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // The user object is added to the request by withApiAuth
  const user = req.user;

  // Return user profile data
  res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    // Other profile data...
  });
};

export default withApiAuth(handler);
```

## Best Practices

1. **Always use HttpOnly cookies** for storing authentication tokens.
2. **Never store authentication tokens in localStorage or sessionStorage**.
3. **Always include `credentials: 'include'`** when making fetch requests to API endpoints that require authentication.
4. **Use the AuthContext** for accessing authentication state and methods.
5. **Use the ProtectedRoute component** to restrict access to authenticated users.
6. **Implement proper error handling** for authentication failures.
7. **Regularly refresh tokens** to maintain session security.
8. **Implement CSRF protection** for authentication endpoints.
9. **Log out users when their session expires** or when they close the browser.
10. **Implement rate limiting** to prevent brute force attacks.

## Troubleshooting

### Common Issues

1. **Authentication state not persisting after page refresh**

   - Ensure that HttpOnly cookies are being set correctly
   - Check that the server is properly validating tokens

2. **Redirect loops on protected pages**

   - Check that the middleware is correctly identifying authenticated users
   - Ensure that the ProtectedRoute component is working correctly

3. **API requests failing with 401 Unauthorized**
   - Ensure that `credentials: 'include'` is set in fetch requests
   - Check that the tokens are valid and not expired

### Debugging

For debugging authentication issues, use the `/api/debug-auth` endpoint to check the current authentication state.

## Security Considerations

1. **XSS Protection**: HttpOnly cookies protect against XSS attacks by preventing client-side JavaScript from accessing authentication tokens.

2. **CSRF Protection**: The login form includes CSRF protection to prevent cross-site request forgery attacks.

3. **Token Expiration**: Access tokens have a short expiration time (1 hour) to limit the window of opportunity for attackers.

4. **Refresh Token Rotation**: Consider implementing refresh token rotation for additional security.

5. **Secure and SameSite Cookies**: In production, cookies are set with the Secure and SameSite=Strict flags to prevent CSRF attacks and ensure cookies are only sent over HTTPS.

## Future Improvements

1. **Implement Strict-Transport-Security header** for additional security.
2. **Add rate limiting** to prevent brute force attacks.
3. **Implement refresh token rotation** for additional security.
4. **Add multi-factor authentication** for sensitive operations.
5. **Implement IP-based anomaly detection** to identify suspicious login attempts.
