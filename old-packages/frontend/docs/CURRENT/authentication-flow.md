# Authentication Flow Diagrams

This document provides visual representations of the authentication flows in the BellyFed application.

## Sign In Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextAPI as Next.js API
    participant Cognito as AWS Cognito

    Browser->>NextAPI: POST /api/auth/login
    NextAPI->>Cognito: InitiateAuth
    Cognito-->>NextAPI: AuthenticationResult
    NextAPI-->>Browser: Response with HttpOnly Cookies

    Browser->>NextAPI: GET /api/auth/status
    NextAPI->>Cognito: GetUser
    Cognito-->>NextAPI: User Attributes
    NextAPI-->>Browser: User Info
```

## Token Refresh Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextAPI as Next.js API
    participant Cognito as AWS Cognito

    Browser->>NextAPI: POST /api/auth/refresh
    NextAPI->>Cognito: InitiateAuth (REFRESH_TOKEN)
    Cognito-->>NextAPI: New Tokens
    NextAPI-->>Browser: Response with Updated Cookies
```

## Protected Route Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Router as Next.js Router
    participant Middleware
    participant AuthContext
    participant API as API Endpoints

    Browser->>Middleware: Request Protected Page

    alt No HttpOnly Cookies
        Middleware-->>Browser: Redirect to Sign In
    else Has HttpOnly Cookies
        Middleware->>Router: Continue to Page
        Router->>AuthContext: Initialize
        AuthContext->>API: GET /api/auth/status
        API-->>AuthContext: Authentication Status

        alt Not Authenticated
            AuthContext->>API: POST /api/auth/refresh
            API-->>AuthContext: Refresh Result

            alt Refresh Failed
                AuthContext-->>Browser: Redirect to Sign In
            else Refresh Succeeded
                AuthContext-->>Browser: Render Protected Content
            end
        else Authenticated
            AuthContext-->>Browser: Render Protected Content
        end
    end
```

## Sign Out Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextAPI as Next.js API
    participant Cognito as AWS Cognito

    Browser->>NextAPI: POST /api/auth/logout
    NextAPI->>Cognito: GlobalSignOut
    Cognito-->>NextAPI: Success
    NextAPI-->>Browser: Clear HttpOnly Cookies
    Browser->>Browser: Redirect to Sign In
```

## Component Interaction

```mermaid
graph TD
    A[Browser] --> B[Middleware]
    B -->|Protected Route| C[ProtectedRoute Component]
    B -->|Public Route| D[Page Component]

    C --> E[AuthContext]
    D --> E

    E -->|Status Check| F[/api/auth/status]
    E -->|Sign In| G[/api/auth/login]
    E -->|Sign Out| H[/api/auth/logout]
    E -->|Refresh| I[/api/auth/refresh]

    F --> J[AWS Cognito]
    G --> J
    H --> J
    I --> J
```

## Authentication State Management

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated

    Unauthenticated --> Authenticating: Sign In
    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failure

    Authenticated --> TokenRefresh: Token Expiring
    TokenRefresh --> Authenticated: Success
    TokenRefresh --> Unauthenticated: Failure

    Authenticated --> Unauthenticated: Sign Out
    Authenticated --> Unauthenticated: Session Timeout
```

These diagrams can be rendered using Mermaid-compatible tools or viewers.
