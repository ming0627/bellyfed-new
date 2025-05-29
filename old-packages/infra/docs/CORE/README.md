# Core Platform Documentation

This directory contains documentation for the core platform concepts of Bellyfed. These documents outline the fundamental principles and features that define the Bellyfed platform.

## Core Platform Architecture

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

## Key Documents

1. [Platform Overview](./platform-overview.md)

    - Core vision and mission
    - Platform architecture
    - Implementation timeline
    - Technical implementation

2. [One-Best Ranking System](./one-best-ranking-system.md)

    - Fundamental principles
    - Technical implementation
    - Ranking rules and flow
    - API endpoints
    - Database interactions

3. [Expert Recognition System](./expert-recognition-system.md)
    - Career progression framework
    - Expertise badges
    - Monetization opportunities
    - Dependencies on One-Best Ranking System
    - Implementation timeline

## Dependency Relationship

The core platform is built on a clear dependency relationship:

1. **One-Best Ranking System** is the primary foundation

    - Must be implemented first
    - All other features depend on it
    - Creates the essential data structure

2. **Expert Recognition System** builds upon the One-Best Ranking System
    - Requires ranking data to function
    - Cannot be implemented without the ranking system
    - Extends the core functionality

This dependency relationship is critical to understand when planning development and feature implementation.

## Implementation Status

- **One-Best Ranking System**: Phase 1 (Core Functionality) - Active Development
- **Expert Recognition System**: Phase 1 (Planning) - Dependencies on One-Best Ranking System

_Last updated: July 22, 2024_
