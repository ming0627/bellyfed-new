# Connecting to AWS API Environments

This document explains how to connect your local development environment to different API environments (local, dev, test, qa, prod).

## Configuration Overview

The Bellyfed application can connect to different API environments:

- **Local API**: `http://localhost:3001/api`
- **Dev API**: `https://api-dev.bellyfed.com/v1`
- **Test API**: `https://api-test.bellyfed.com/v1`
- **QA API**: `https://api-qa.bellyfed.com/v1`
- **Production API**: `https://api.bellyfed.com/v1`

## How to Configure API Connection

### 1. Environment Variables

The API connection is controlled by two environment variables in `.env.local`:

```
# API Environment (dev, test, qa, prod)
API_ENV=dev

# Whether to use AWS API (true) or local API (false)
USE_AWS_API=true
```

- `API_ENV`: Determines which AWS environment to use (dev, test, qa, prod)
- `USE_AWS_API`: Toggles between using AWS API (`true`) or local API (`false`)

### 2. Implementation Details

The API proxy configuration is implemented in `src/pages/api/proxy/[...path].ts`:

```typescript
// Base URLs for different API endpoints
const USE_AWS_API = process.env.USE_AWS_API === 'true';

const API_BASE_URL =
  USE_AWS_API || process.env.NODE_ENV !== 'development'
    ? `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1`
    : 'http://localhost:3001/api'; // Fallback to local API if not using AWS
```

### 3. How to Switch Between Environments

#### To use local API:

1. Set `USE_AWS_API=false` in `.env.local`
2. Restart the development server

#### To use AWS dev API:

1. Set `USE_AWS_API=true` in `.env.local`
2. Set `API_ENV=dev` in `.env.local`
3. Restart the development server

#### To use other AWS environments:

1. Set `USE_AWS_API=true` in `.env.local`
2. Set `API_ENV` to the desired environment (`test`, `qa`, or `prod`) in `.env.local`
3. Restart the development server

## API Endpoints

The application uses three main API base URLs:

1. **Main API**: For general API requests

   - Local: `http://localhost:3001/api`
   - AWS: `https://api-{env}.bellyfed.com/v1`

2. **Database API**: For database operations

   - Local: `http://localhost:3001/api/database`
   - AWS: `https://api-{env}.bellyfed.com/v1/db`

3. **Rankings API**: For ranking operations
   - Local: `http://localhost:3001/api/rankings`
   - AWS: `https://api-{env}.bellyfed.com/v1/rankings`

## Troubleshooting

If you encounter API connection issues:

1. Check that your API key is valid (`NEXT_PUBLIC_API_KEY` in `.env.local`)
2. Verify that the API environment is accessible
3. Check the server logs for detailed error messages
4. Ensure you've restarted the development server after changing environment variables

## API Key Configuration

The API key is configured in `.env.local`:

```
NEXT_PUBLIC_API_KEY=your-api-key
```

This key is sent with all API requests in the `x-api-key` header.
