# Infrastructure Architect Agent Changelog

All notable changes to the Infrastructure Architect agent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.1.2] - 2024-12-09

### Added

- Comprehensive user management infrastructure documentation
- API Gateway endpoint configurations for user operations
- DynamoDB schema and query patterns for user data
- Security and monitoring guidelines for user services

### Changed

- Updated Lambda function integration patterns
- Refined error handling approaches
- Enhanced cost optimization strategies

## [v1.1.1] - 2024-12-07

### Added

- Detailed stack dependencies and deployment order documentation
- CodeBuild pipeline deployment process
- GSI deployment sequence information
- Pipeline features overview

### Changed

- Updated deployment workflow to focus on automated pipeline
- Refined environment-specific deployment guidelines
- Reorganized deployment documentation structure

### Fixed

- Corrected manual deployment commands
- Updated outdated deployment instructions

## [v1.1.0] - 2024-12-07

### Changed

- Consolidated monitoring stacks into a single InfrastructureMonitoring stack
- Renamed ApplicationMonitoring to InfrastructureMonitoring to better reflect its purpose
- Improved monitoring organization by combining import monitoring with infrastructure monitoring

### Added

- Comprehensive infrastructure monitoring for:
    - API Gateway metrics and alarms
    - SQS queues and DLQ monitoring
    - EventBridge delivery and failures
    - Import process success rates and progress
    - Lambda function errors
- Unified alerting through SNS (email and Slack notifications)

## [v1.0.3] - 2024-12-07

### Changed

- Standardized Lambda handler files:
    - Renamed all handler.ts to index.ts
    - Made index.handler the default in LambdaFactory
    - Removed redundant handler path specifications
    - Simplified Lambda configurations

## [v1.0.2] - 2024-12-07

### Changed

- Updated Lambda timeouts from 3s to 15s for better reliability
- Maintained other cost optimizations:
    - 128MB memory allocation
    - Centralized error handling with 3 retries
    - Dist-only deployments

## [v1.0.1] - 2024-12-07

### Changed

- Optimized Lambda functions for cost efficiency:
    - Standardized memory to 128MB minimum
    - Set default timeout to 3 seconds (except batch operations)
    - Ensured all functions use centralized error handling with 3 retries
    - Updated deployment to only include /dist directory

## [v1.0.0] - 2024-12-07 14:51:26 +08:00

### Added

- Initial agent profile and capabilities
- Cost optimization knowledge base
- Development workflow guidelines
- Monitoring and security best practices
- Environment-specific recommendations

### Documentation

- Created standard directory structure
- Added comprehensive README
- Included detailed knowledge base documents

### Infrastructure

- Defined current infrastructure components
- Added monitoring strategies
- Documented deployment processes
- Established security guidelines

## [2024-12-09] - API Gateway Updates

### Added

- Custom domain configuration for API Gateway using ACM certificate
- Stage variables for version and environment tracking
- Resource tagging for better management
- Compression settings for optimized response sizes

### Changed

- Updated API Gateway endpoint structure to follow REST API best practices
- Configured regional endpoint type for better performance
- Implemented TLS 1.2 security policy
- Set up custom domain format: `api-${environment}.oishiiteru.com`

### Technical Details

- ACM Certificate ARN: `arn:aws:acm:ap-southeast-1:590184067494:certificate/1f461ea5-50dc-45be-87a6-449e0eae1193`
- Stage Name: `v1`
- Endpoint Type: Regional
- Security Policy: TLS 1.2
- Minimum Compression Size: 1024 bytes
