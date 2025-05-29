# Bellyfed Documentation

**Document Type:** CORE
**Last Updated:** December 2024
**Owner:** Documentation Team
**Reviewers:** Architecture Team

Welcome to the Bellyfed platform documentation. Bellyfed is a dish-centric food review platform built on our innovative One-Best Ranking System. This documentation is organized into six main spaces and follows Confluence-compatible formatting standards.

> **IMPORTANT UPDATE**: The application has been migrated to Next.js 15 with Server Actions and the outbox pattern for event handling. The frontend is now hosted on ECS Fargate to support Incremental Static Regeneration (ISR). See [Next.js 15 Migration](ARCHITECTURE/next-server-actions-migration.md) and [ECS Fargate Stack](OPERATIONS/deployment/ecs-fargate-stack.md) for details on the current architecture.

## Architecture Documentation (ARCHITECTURE)

Documentation for the system architecture and design.

### System Architecture

- [Architecture Overview](ARCHITECTURE/system/architecture.md)
- [Next.js 15 Migration](ARCHITECTURE/next-server-actions-migration.md)
- [Lambda Function Migration](ARCHITECTURE/lambda-migration.md)

### Event-Driven Architecture

- [Event-Driven Architecture](ARCHITECTURE/event-driven/event-flows.md)
- [Outbox Pattern Implementation](ARCHITECTURE/event-driven/outbox-pattern.md)

### Database Architecture

- [Database Architecture](ARCHITECTURE/database/architecture.md)

### Authentication Architecture

- [Authentication Architecture](ARCHITECTURE/auth/authentication-architecture.md)

## Core Platform Documentation (CORE)

Documentation for the core platform concepts and principles.

- [Platform Overview](CORE/platform-overview.md)
- [One-Best Ranking System](CORE/one-best-ranking-system.md)
- [Expert Recognition System](CORE/expert-recognition-system.md)

## Feature Documentation (FEATURES)

Detailed documentation for specific platform features.

- [One-Best Ranking System](FEATURES/01-ranking-system.md)
- [Expert Recognition System](FEATURES/02-expert-recognition.md)

## Development Documentation (DEVELOPMENT)

Documentation for developers and engineers.

### Getting Started

- [Development Environment Setup](DEVELOPMENT/getting-started/dev-environment-setup.md)
- [First Time Contributors](DEVELOPMENT/getting-started/first-time-contributors.md)
- [Monorepo Structure](DEVELOPMENT/getting-started/monorepo-structure.md)

### Standards

- [Coding Standards](DEVELOPMENT/standards/coding-standards.md)
- [TypeScript Error Patterns](DEVELOPMENT/standards/typescript-error-patterns.md)
- [Testing Standards](DEVELOPMENT/standards/testing-standards.md)
- [Documentation Standards](DEVELOPMENT/standards/documentation-standards.md)

### Frontend Development

- [Next.js 15 Implementation](DEVELOPMENT/frontend/nextjs-15-implementation.md)
- [Server Actions Guide](DEVELOPMENT/frontend/server-actions-guide.md)
- [Prisma Integration](DEVELOPMENT/frontend/prisma-integration.md)
- [Frontend Testing](DEVELOPMENT/frontend/testing.md)
- [Typesense Integration](DEVELOPMENT/frontend/typesense-integration.md)

### Backend Development

- [AWS Resource Standards](DEVELOPMENT/backend/aws-resources.md)
- [Lambda Standards](DEVELOPMENT/backend/lambda-standards.md)
- [Event Processing](DEVELOPMENT/backend/event-processing.md)
- [Outbox Processor Implementation](DEVELOPMENT/backend/outbox-processor.md)
- [Typesense Setup](DEVELOPMENT/backend/typesense-setup.md)

### API

- [API Reference](DEVELOPMENT/api/api-reference.md)
- [API Guidelines](DEVELOPMENT/api/README.md)
- [Server Actions API](DEVELOPMENT/api/server-actions-api.md)

### Security

- [Security Standards](DEVELOPMENT/security/security-standards.md)
- [Authentication Security](DEVELOPMENT/security/authentication-security.md)
- [Data Protection](DEVELOPMENT/security/data-protection.md)

## Operations Documentation (OPERATIONS)

Documentation for DevOps and SRE teams.

### Getting Started

- [Operations Onboarding](OPERATIONS/getting-started/onboarding.md)
- [Infrastructure Overview](OPERATIONS/getting-started/infrastructure-overview.md)
- [Monorepo CI/CD](OPERATIONS/getting-started/monorepo-cicd.md)

### Deployment

- [Deployment Overview](OPERATIONS/deployment/overview.md)
- [ECS Fargate Deployment](OPERATIONS/deployment/ecs-fargate-stack.md)
- [Database Deployment](OPERATIONS/deployment/database-deployment.md)
- [Lambda Deployment](OPERATIONS/deployment/lambda-deployment.md)
- [Release Process](OPERATIONS/deployment/release-process.md)

### Monitoring

- [Monitoring Overview](OPERATIONS/monitoring/overview.md)
- [CloudWatch Dashboards](OPERATIONS/monitoring/cloudwatch-dashboards.md)
- [Alerts and Notifications](OPERATIONS/monitoring/alerts.md)
- [Outbox Pattern Monitoring](OPERATIONS/monitoring/outbox-monitoring.md)

### Maintenance

- [Database Maintenance](OPERATIONS/maintenance/database.md)
- [ECS Maintenance](OPERATIONS/maintenance/ecs.md)
- [Lambda Maintenance](OPERATIONS/maintenance/lambda.md)
- [Typesense Maintenance](OPERATIONS/maintenance/typesense.md)

## Product Documentation (PROD)

Documentation for product managers, stakeholders, and users.

### Getting Started

- [Product Overview](PROD/getting-started/overview.md)
- [Feature Documentation](PROD/getting-started/features.md)

### Features

- [Feature Specifications](PROD/features/README.md)
- [User Guides](PROD/features/user-guides.md)

## Documentation Standards

Our documentation follows specific standards to maintain consistency and quality:

- [Documentation Standards](_standards/documentation-standards.md)
- [Templates](templates/) for creating new documentation

## Documentation Organization

This documentation is organized into the following main sections:

1. **Core Platform Documentation (CORE)**: Core platform concepts and principles
2. **Feature Documentation (FEATURES)**: Detailed documentation for specific platform features
3. **Development Documentation (DEVELOPMENT)**: Documentation for developers and engineers
4. **Operations Documentation (OPERATIONS)**: Documentation for DevOps and SRE teams
5. **Product Documentation (PROD)**: Documentation for product managers, stakeholders, and users
6. **Architecture Documentation (ARCHITECTURE)**: Detailed architecture documentation
7. **Archived Documentation (ARCHIVED)**: Historical documentation kept for reference

### Documentation Standards

All documentation follows these standards:

1. **Markdown Format**: All documentation is written in Markdown
2. **Document Type**: Each document includes a document type header
3. **Last Updated**: Each document includes a last updated date
4. **Owner**: Each document includes an owner
5. **Reviewers**: Each document includes reviewers
6. **Consistent Structure**: All documents follow a consistent structure
7. **Cross-References**: All documents include cross-references to related documents
8. **Confluence Compatibility**: All documentation follows Confluence-compatible formatting

### Confluence Migration

This documentation is designed to be migrated to Confluence using an automated migration tool. The documentation structure maps to Confluence spaces as follows:

| Documentation Directory | Confluence Space | Space Key |
| ----------------------- | ---------------- | --------- |
| ARCHITECTURE            | Architecture     | ARCH      |
| CORE                    | Core Platform    | CORE      |
| DEVELOPMENT             | Development      | DEV       |
| FEATURES                | Features         | FEAT      |
| OPERATIONS              | Operations       | OPS       |
| PROD                    | Product          | PROD      |

For more information on Confluence migration, see:

- [Confluence Migration Guide](CONFLUENCE_MIGRATION_GUIDE.md): Guide for migrating documentation to Confluence
- [Confluence Formatting Guide](_standards/confluence-formatting-guide.md): Guide for Confluence-compatible formatting

### Recent Architectural Changes

1. **Next.js 15 Migration**: Migrated to Next.js 15 with Server Actions for improved developer experience
2. **Outbox Pattern**: Implemented the outbox pattern for reliable event delivery
3. **ECS Fargate Hosting**: Migrated from CloudFront with Lambda@Edge to ECS Fargate for ISR support
4. **Monorepo Structure**: Reorganized the codebase into a monorepo with Turborepo and pnpm workspaces
5. **Prisma Integration**: Added Prisma for database operations
6. **Lambda Function Migration**: Replaced many Lambda functions with Next.js 15 Server Actions
7. **Hybrid Architecture**: Maintained AWS event-driven architecture for specific use cases

If you find any outdated references or inconsistencies, please report them to the documentation team or create a pull request with the necessary updates.

---

**Labels:** documentation, bellyfed, overview, architecture, development, operations
