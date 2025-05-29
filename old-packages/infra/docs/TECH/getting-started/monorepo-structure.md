# Monorepo Structure

**Document Type:** TECH
**Last Updated:** December 2024
**Owner:** Architecture Team
**Reviewers:** Development Team

## Overview

This document provides an overview of the Bellyfed monorepo structure, which uses Turborepo and pnpm workspaces to organize the codebase.

## What is a Monorepo?

A monorepo is a single repository that contains multiple projects or packages. In the Bellyfed application, we use a monorepo to:

1. **Centralize Code**: Keep all related code in one place
2. **Share Code**: Easily share code between packages
3. **Coordinate Changes**: Make changes across multiple packages in a single commit
4. **Standardize Tooling**: Use consistent tooling across all packages
5. **Simplify CI/CD**: Build and deploy all packages from a single pipeline

## Bellyfed Monorepo Structure

The Bellyfed monorepo is organized as follows:

```
bellyfed/
├── packages/
│   ├── frontend/       # Next.js frontend application
│   ├── infra/          # AWS CDK infrastructure code
│   ├── shared/         # Shared utilities and types
│   └── seed/           # Seed data and utilities
├── package.json        # Root package.json
├── pnpm-workspace.yaml # pnpm workspace configuration
├── turbo.json          # Turborepo configuration
└── README.md           # Root README
```

### packages/frontend/

The frontend package contains the Next.js application, which includes:

```
packages/frontend/
├── app/                # Next.js app directory
│   ├── actions/        # Server Actions
│   ├── api/            # API routes
│   └── [country]/      # Dynamic country routes
├── components/         # React components
├── lib/                # Utility functions
│   ├── auth/           # Authentication utilities
│   ├── db/             # Database utilities
│   └── outbox/         # Outbox pattern implementation
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
├── next.config.js      # Next.js configuration
└── package.json        # Package configuration
```

### packages/infra/

The infrastructure package contains the AWS CDK code, which includes:

```
packages/infra/
├── bin/                # CDK entry point
├── lib/                # CDK constructs
│   ├── ecs-fargate-stack.ts  # ECS Fargate stack
│   ├── database-stack.ts     # Database stack
│   └── lambda-stack.ts       # Lambda stack
├── functions/          # Lambda functions
│   ├── outbox-processor/     # Outbox processor Lambda
│   └── batch-processor/      # Batch processor Lambda
├── docs/               # Documentation
├── cdk.json            # CDK configuration
└── package.json        # Package configuration
```

### packages/shared/

The shared package contains utilities and types used across the frontend and infrastructure packages:

```
packages/shared/
├── src/
│   ├── types/          # Shared TypeScript types
│   ├── utils/          # Shared utility functions
│   └── aws/            # AWS SDK clients and helpers
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

### packages/seed/

The seed package contains seed data and utilities for the Bellyfed platform:

```
packages/seed/
├── src/
│   ├── data/           # Seed data
│   └── scripts/        # Seed scripts
├── package.json        # Package configuration
└── tsconfig.json       # TypeScript configuration
```

## Workspace Configuration

The monorepo uses pnpm workspaces, which are configured in the `pnpm-workspace.yaml` file:

```yaml
packages:
    - 'packages/*'
```

## Turborepo Configuration

Turborepo is used to optimize the build process, which is configured in the `turbo.json` file:

```json
{
    "$schema": "https://turbo.build/schema.json",
    "globalDependencies": ["**/.env.*local"],
    "pipeline": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": [".next/**", "!.next/cache/**", "dist/**"]
        },
        "lint": {},
        "dev": {
            "cache": false,
            "persistent": true
        },
        "test": {
            "dependsOn": ["build"],
            "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
        }
    }
}
```

## Working with the Monorepo

### Installation

Install dependencies for all packages:

```bash
pnpm install
```

### Development

Start the development servers:

```bash
# Start all development servers
pnpm dev

# Start only the frontend
pnpm --filter @bellyfed/frontend dev

# Start only the infrastructure
pnpm --filter @bellyfed/infra dev
```

### Building

Build all packages:

```bash
# Build all packages
pnpm build

# Build only the frontend
pnpm --filter @bellyfed/frontend build

# Build only the infrastructure
pnpm --filter @bellyfed/infra build
```

### Testing

Run tests:

```bash
# Run all tests
pnpm test

# Run only the frontend tests
pnpm --filter @bellyfed/frontend test

# Run only the infrastructure tests
pnpm --filter @bellyfed/infra test
```

### Deployment

Deploy the infrastructure:

```bash
# Deploy all stacks
pnpm --filter @bellyfed/infra deploy

# Deploy a specific stack
pnpm --filter @bellyfed/infra deploy:dev
```

## Git Workflow

### Working with the Monorepo

With the monorepo structure, you can commit changes to multiple packages in a single commit:

```bash
# From the root directory
git add .
git commit -m "Your commit message"
git push origin your-branch-name
```

For package-specific changes, you can use the filter flag:

```bash
# Only build and test the frontend package
pnpm --filter @bellyfed/frontend build test
```

## Best Practices

1. **Use Shared Code**: Extract common code to the shared package
2. **Maintain Package Independence**: Each package should have its own dependencies
3. **Use Consistent Tooling**: Use the same linting, formatting, and testing tools across all packages
4. **Document Dependencies**: Clearly document dependencies between packages
5. **Optimize Build Process**: Use Turborepo caching to optimize the build process

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
