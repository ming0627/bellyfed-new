# Multi-stage Dockerfile for Bellyfed Documentation (Next.js)
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
COPY apps/docs/package.json ./apps/docs/
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
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1

# Expose port
EXPOSE 3001

# Health check for development
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:3001/api/health || exit 1

# Start development server
CMD ["pnpm", "--filter", "@bellyfed/docs", "dev"]

# Build stage - compile the application for production
FROM base AS builder
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build shared packages first (minimal for docs)
RUN pnpm --filter "@bellyfed/types" build
RUN pnpm --filter "@bellyfed/config" build
RUN pnpm --filter "@bellyfed/ui" build

# Build the docs application
RUN pnpm --filter "@bellyfed/docs" build

# Verify build output exists
RUN ls -la /app/apps/docs/.next || (echo "Build failed - no .next directory" && exit 1)

# Production stage - minimal runtime image
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 docs

# Copy public assets
COPY --from=builder /app/apps/docs/public ./apps/docs/public

# Create .next directory with proper ownership
RUN mkdir -p apps/docs/.next
RUN chown docs:nodejs apps/docs/.next

# Copy build output with proper ownership
COPY --from=builder --chown=docs:nodejs /app/apps/docs/.next ./apps/docs/.next
COPY --from=builder --chown=docs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=docs:nodejs /app/packages ./packages
COPY --from=builder --chown=docs:nodejs /app/apps/docs/package.json ./apps/docs/package.json
COPY --from=builder --chown=docs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=docs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Switch to non-root user
USER docs

# Expose port
EXPOSE 3001

# Health check for production
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["pnpm", "--filter", "@bellyfed/docs", "start"]
