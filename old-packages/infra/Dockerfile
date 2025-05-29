# Base stage for all environments
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage - shared by all environments
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* .npmrc ./
# Skip husky installation for all environments
ENV HUSKY=0
# Install dependencies with pnpm
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --ignore-scripts

# Development stage - used for local development
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set environment variables to skip husky
ENV HUSKY_SKIP_INSTALL=1
ENV HUSKY=0
ENV NODE_ENV=development
# Expose the port
EXPOSE 3000
# Start the development server
CMD ["pnpm", "run", "dev"]

# Build stage - used to build the production application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set environment variables to skip husky
ENV HUSKY_SKIP_INSTALL=1
ENV HUSKY=0
# Increase memory for Node.js during build
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Build the application with optimized settings
RUN pnpm run build:fast
# Debug: List the build output
RUN ls -la /app/functions/*/dist || echo "No dist directories found"

# Production stage - the final image for production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/functions/*/dist ./functions/

# Copy node_modules and package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Switch to the non-root user
USER nextjs

# Expose the port that the application will run on
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add health check using standardized health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["pnpm", "start"]
