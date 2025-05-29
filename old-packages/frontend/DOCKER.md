# Docker Configuration for Bellyfed

This document explains how to use Docker with the Bellyfed application.

## Docker Setup

The Bellyfed application uses a multi-stage Docker build process that supports both development and production environments from a single Dockerfile.

### Key Files

- `Dockerfile`: A multi-stage Dockerfile that supports both development and production builds
- `docker-compose.yml`: Base Docker Compose configuration
- `docker-compose.dev.yml`: Development-specific overrides
- `docker-compose.prod.yml`: Production-specific overrides
- `.dockerignore`: Files to exclude from the Docker build context

## Development Environment

To start the development environment:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will:

- Build the Docker image using the `development` target
- Mount your local code directory as a volume for live reloading
- Start the Next.js development server
- Expose the application on port 3000

### Features of Development Environment

- Live code reloading (changes to your code will be reflected immediately)
- Development-specific environment variables
- Node modules are preserved in the container to avoid compatibility issues

## Production Environment

To start the production environment:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

Or simply:

```bash
docker-compose up
```

This will:

- Build the Docker image using the `production` target
- Run the optimized production build of the Next.js application
- Expose the application on port 3000

### Features of Production Environment

- Optimized build for performance
- Security enhancements (non-root user)
- Health checks
- Resource limits
- Production-specific environment variables

## Building for Deployment

To build the Docker image for deployment to ECR:

```bash
docker build -t bellyfed-frontend:latest --target production .
docker tag bellyfed-frontend:latest ${ECR_REPOSITORY_URI}:latest
docker push ${ECR_REPOSITORY_URI}:latest
```

## Troubleshooting

### Common Issues

1. **Node modules not updating**: If you install new npm packages, you may need to rebuild the Docker image:

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
   ```

2. **Permission issues**: If you encounter permission issues, check that the volumes are mounted correctly and that the user in the container has the right permissions.

3. **Port conflicts**: If port 3000 is already in use, you can change the port mapping in the docker-compose file:
   ```yaml
   ports:
     - '3001:3000' # Maps container port 3000 to host port 3001
   ```

### Debugging

To access the container shell for debugging:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec nextjs sh
```
