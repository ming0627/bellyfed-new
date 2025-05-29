# Bellyfed Frontend Scripts

This document provides an overview of the npm scripts available in the Bellyfed frontend repository.

## Development Scripts

### `npm run dev`

Starts the Next.js development server. This is the primary script you'll use during local development.

```bash
npm run dev
```

The development server will be available at http://localhost:3000 by default.

### `npm run build`

Builds the Next.js application for production. This generates static files in the `out` directory.

```bash
npm run build
```

### `npm run start`

Starts the Next.js production server. This is typically used to test the production build locally.

```bash
npm run start
```

## Testing Scripts

### `npm run test`

Runs the Jest test suite once.

```bash
npm run test
```

### `npm run test:watch`

Runs the Jest test suite in watch mode, which automatically reruns tests when files change.

```bash
npm run test:watch
```

### `npm run lint`

Runs ESLint to check for code style issues.

```bash
npm run lint
```

## Deployment Scripts

### `npm run deploy`

Builds the application and deploys it to ECS Fargate. This script requires the following environment variables to be set:

- `ECR_REPOSITORY_URI`: The URI of the ECR repository to push the Docker image to
- `ECS_CLUSTER_NAME`: The name of the ECS cluster
- `ECS_SERVICE_NAME`: The name of the ECS service

```bash
npm run deploy
```

The script performs the following actions:

1. Builds the Next.js application (`npm run build`)
2. Builds a Docker image
3. Tags the Docker image
4. Pushes the Docker image to ECR
5. Updates the ECS service with the new image

## Usage Examples

### Local Development

```bash
npm run dev
```

### Testing Changes

```bash
npm run lint
npm run test
```

### Manual Deployment

```bash
# Set environment variables
export ECR_REPOSITORY_URI=590184067494.dkr.ecr.ap-southeast-1.amazonaws.com/bellyfed-dev
export ECS_CLUSTER_NAME=bellyfed-dev-cluster
export ECS_SERVICE_NAME=bellyfed-dev

# Deploy
npm run deploy
```

Note: Manual deployment is typically not necessary as the CI/CD pipeline handles deployment automatically when changes are pushed to the repository.
