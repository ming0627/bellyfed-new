# Bellyfed Services

This directory contains service modules for the Bellyfed application.

## Services

### API Service

The `ApiService` provides methods for making HTTP requests to the backend API.

#### Methods

| Method | Description                       |
| ------ | --------------------------------- |
| get    | Makes a GET request to the API    |
| post   | Makes a POST request to the API   |
| put    | Makes a PUT request to the API    |
| delete | Makes a DELETE request to the API |

#### Usage

```typescript
// GET request
const data = await ApiService.get('/restaurants');

// POST request
const result = await ApiService.post('/reviews', {
  rating: 5,
  comment: 'Great food!',
});
```

### Database Service

The `databaseService` provides methods for interacting with the database API.

#### Methods

| Method         | Description                       |
| -------------- | --------------------------------- |
| getUserData    | Gets user data from the database  |
| saveUserData   | Saves user data to the database   |
| updateUserData | Updates user data in the database |
| getDishVotes   | Gets vote statistics for a dish   |
| voteDish       | Records a vote for a dish         |
| getTopDishes   | Gets top-rated dishes             |
| getUserVotes   | Gets votes for a user             |

#### Usage

```typescript
// Get dish votes
const voteStats = await databaseService.getDishVotes(dishId);

// Vote for a dish
await databaseService.voteDish(dishId, restaurantId, rating);

// Get top dishes
const topDishes = await databaseService.getTopDishes(5);

// Get user votes
const userVotes = await databaseService.getUserVotes(userId);
```

### PostgreSQL Service

The `postgresService` provides methods for interacting with the PostgreSQL database directly.

#### Methods

| Method                | Description                     |
| --------------------- | ------------------------------- |
| getUserById           | Gets a user by ID               |
| createUser            | Creates a new user              |
| updateUser            | Updates a user                  |
| getDishById           | Gets a dish by ID               |
| getDishesByRestaurant | Gets dishes for a restaurant    |
| getDishVotes          | Gets vote statistics for a dish |
| voteDish              | Records a vote for a dish       |
| getUserVotes          | Gets votes for a user           |
| getTopDishes          | Gets top-rated dishes           |

#### Usage

```typescript
// Get dish votes
const voteStats = await postgresService.getDishVotes(dishId);

// Vote for a dish
await postgresService.voteDish(dishId, userId, restaurantId, rating);

// Get top dishes
const topDishes = await postgresService.getTopDishes(5);

// Get user votes
const userVotes = await postgresService.getUserVotes(userId);
```

### Cognito Auth Service

The `cognitoAuthService` provides methods for authenticating users with AWS Cognito.

#### Methods

| Method                 | Description                        |
| ---------------------- | ---------------------------------- |
| signIn                 | Signs in a user                    |
| signOut                | Signs out a user                   |
| signUp                 | Signs up a new user                |
| confirmSignUp          | Confirms a user's sign-up          |
| resendConfirmationCode | Resends a confirmation code        |
| forgotPassword         | Initiates the forgot password flow |
| confirmForgotPassword  | Confirms a new password            |
| getCurrentUser         | Gets the current user              |
| getCurrentSession      | Gets the current session           |

#### Usage

```typescript
// Sign in a user
await cognitoAuthService.signIn(username, password);

// Get the current user
const user = await cognitoAuthService.getCurrentUser();

// Sign out a user
await cognitoAuthService.signOut();
```

## Environment Configuration

The services support the following environments:

| Environment | API Endpoint                  |
| ----------- | ----------------------------- |
| dev         | https://api-dev.bellyfed.com  |
| test        | https://api-test.bellyfed.com |
| qa          | https://api-qa.bellyfed.com   |
| prod        | https://api.bellyfed.com      |

The environment is configured using the `API_ENV` environment variable in `.env.local`. If not specified, it defaults to `dev`.

## API Proxy

The API proxy routes requests to the appropriate backend API based on the path. It supports the following base URLs:

| Path                | Base URL              |
| ------------------- | --------------------- |
| /api/proxy          | API_BASE_URL          |
| /api/proxy/db       | DB_API_BASE_URL       |
| /api/proxy/rankings | RANKINGS_API_BASE_URL |

The base URLs are determined based on the environment:

```typescript
const API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api' // Use local API for development
    : `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1`;

const DB_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api/database' // Use local API for development
    : `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1/db`;

const RANKINGS_API_BASE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api/rankings' // Use local API for development
    : `https://api${API_ENV === 'prod' ? '' : '-' + API_ENV}.bellyfed.com/v1/rankings`;
```

## Error Handling

The services implement robust error handling with retry logic and fallbacks:

1. **Retry Logic**: The services implement retry logic with exponential backoff for transient errors.
2. **Fallbacks**: The services implement fallbacks to mock data for development.
3. **Error Logging**: The services log detailed error information for debugging.

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure that the `NEXT_PUBLIC_API_KEY` environment variable is set in `.env.local`.
2. **Database Connection Issues**: Check the database connection string in the Lambda function environment variables.
3. **Authentication Issues**: Ensure that the user is authenticated before making requests that require authentication.

### Debugging

1. **API Proxy Logs**: Check the API proxy logs in the browser console for detailed information about API requests and responses.
2. **Network Requests**: Use the browser's Network tab to inspect API requests and responses.
3. **Service Logs**: Check the service logs in the browser console for detailed information about service operations.
