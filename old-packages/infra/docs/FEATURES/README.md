# Bellyfed Platform Features

This directory contains documentation for the core features of the Bellyfed platform. These documents outline the fundamental principles and features that define the Bellyfed platform.

## Feature Dependency Hierarchy

Bellyfed is built on a clear dependency hierarchy:

```
One-Best Ranking System (FOUNDATION)
├── Expert Recognition System
│   ├── Monetization Features
│   └── Professional Tools
├── Discovery Features
│   ├── Personalized Recommendations
│   └── Social Sharing
└── Data Intelligence
    ├── Trend Analysis
    └── Quality Metrics
```

## Key Features

1. [One-Best Ranking System](./01-ranking-system.md)

    - The foundation of the platform
    - Enables users to maintain personal "best-of" lists
    - Creates the data foundation for all other features
    - Establishes credibility through consistent rankings

2. [Expert Recognition System](./02-expert-recognition.md)
    - Built upon the One-Best Ranking System
    - Professional progression framework
    - Expertise badges and specializations
    - Monetization opportunities

## Implementation Status

- **One-Best Ranking System**: Phase 1 (Core Functionality) - Active Development
- **Expert Recognition System**: Phase 1 (Planning) - Dependencies on One-Best Ranking System

## Technical Implementation

The features are implemented using:

- **Frontend**: Next.js (React) for web, hosted on CloudFront with Lambda@Edge
- **Backend**: AWS Serverless Architecture (Lambda, API Gateway)
- **Database**: Hybrid approach with Amazon Aurora PostgreSQL
- **Infrastructure**: AWS CloudFront, S3, Lambda@Edge, Cognito
- **DevOps**: CI/CD with GitHub Actions

For detailed technical implementation information, see the [TECH](../TECH/) directory.

_Last updated: July 22, 2024_
