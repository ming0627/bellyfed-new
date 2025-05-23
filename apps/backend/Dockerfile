# Multi-stage Dockerfile for Bellyfed Backend (tRPC API)
# Optimized for production deployment with Turborepo monorepo structure

# Base stage with Node.js and pnpm
FROM node:18-alpine AS base
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage - install all dependencies
FROM base AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/*/package.json ./packages/*/

# Skip husky installation in Docker
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1

# Install dependencies with cache mount for faster builds
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --ignore-scripts

# Development stage - for local development with hot reload
FROM base AS development
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1

# Expose port
EXPOSE 4000

# Health check for development
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:4000/health || exit 1

# Start development server
CMD ["pnpm", "--filter", "@bellyfed/backend", "dev"]

# Build stage - compile the application for production
FROM base AS builder
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build shared packages first (dependency order)
RUN pnpm --filter "@bellyfed/types" build
RUN pnpm --filter "@bellyfed/config" build
RUN pnpm --filter "@bellyfed/utils" build
RUN pnpm --filter "@bellyfed/db" build
RUN pnpm --filter "@bellyfed/services" build
RUN pnpm --filter "@bellyfed/trpc" build

# Build the backend application
RUN pnpm --filter "@bellyfed/backend" build

# Verify build output exists
RUN ls -la /app/apps/backend/dist || (echo "Build failed - no dist directory" && exit 1)

# Production stage - minimal runtime image
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Copy build output with proper ownership
COPY --from=builder --chown=backend:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/packages ./packages
COPY --from=builder --chown=backend:nodejs /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder --chown=backend:nodejs /app/package.json ./package.json
COPY --from=builder --chown=backend:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Switch to non-root user
USER backend

# Expose port
EXPOSE 4000

# Health check for production
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:4000/health || exit 1

# Start the application
CMD ["pnpm", "--filter", "@bellyfed/backend", "start"]
