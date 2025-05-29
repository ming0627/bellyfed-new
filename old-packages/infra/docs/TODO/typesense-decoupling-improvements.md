# Typesense Decoupling Improvements

## Overview

This document outlines recommended improvements to the Typesense implementation to enhance decoupling, maintainability, and security. These changes should be implemented in future sprints to improve the overall architecture.

## Current Issues

1. **Direct SSM Parameter Dependencies**:

    - The `addTypesenseEnvironmentVariables` function directly references specific SSM parameter paths
    - This creates tight coupling between the ECS service and the exact parameter structure

2. **Hard-coded Parameter Names**:

    - Parameter names like `/bellyfed/${environment}/typesense/endpoint` are hard-coded
    - This makes it difficult to change the parameter structure without modifying multiple files

3. **Direct Security Group References**:
    - Lambda functions and EFS directly reference the Typesense security group
    - This creates tight coupling between infrastructure components

## Recommended Improvements

### 1. Parameter Store Abstraction

Create a dedicated class to handle parameter store interactions:

```typescript
// Create a parameter store abstraction
export class TypesenseParameterStore {
    constructor(
        private scope: Construct,
        private environment: string
    ) {}

    getEndpoint(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseEndpointParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/endpoint`,
            }
        );
    }

    getApiKey(): ssm.IStringParameter {
        return ssm.StringParameter.fromStringParameterAttributes(
            this.scope,
            'TypesenseApiKeyParam',
            {
                parameterName: `/bellyfed/${this.environment}/typesense/api-key`,
            }
        );
    }
}
```

### 2. Configuration Interface

Create a configuration interface to abstract parameter access:

```typescript
export interface TypesenseConfiguration {
    endpoint: string;
    apiKey: string;
}

export function getTypesenseConfiguration(
    scope: Construct,
    environment: string
): TypesenseConfiguration {
    try {
        const paramStore = new TypesenseParameterStore(scope, environment);
        return {
            endpoint: paramStore.getEndpoint().stringValue,
            apiKey: paramStore.getApiKey().stringValue,
        };
    } catch (error) {
        console.warn(`Error getting Typesense configuration: ${error}`);
        return {
            endpoint: '',
            apiKey: '',
        };
    }
}
```

### 3. Dependency Injection for Security Groups

Use dependency injection for security groups:

```typescript
export interface TypesenseSecurityConfig {
  serviceSecurityGroup: ec2.ISecurityGroup;
  // Other security-related properties
}

// Then in the Lambda stack:
constructor(scope: Construct, id: string, props: TypesenseLambdaStackProps & TypesenseSecurityConfig) {
  // Use props.serviceSecurityGroup instead of direct reference
}
```

### 4. Event-Based Communication

Implement event-based communication between components:

- Use EventBridge for communication between components instead of direct references
- For example, when Typesense is updated, emit an event that other components can subscribe to

### 5. Interface-Based Design

Create interfaces for all major components:

```typescript
export interface ITypesenseService {
    readonly endpoint: string;
    readonly apiKey: string;
    readonly securityGroup: ec2.ISecurityGroup;
}

// Then components can depend on the interface rather than concrete implementations
```

## Implementation Plan

1. Create the `TypesenseParameterStore` class
2. Implement the configuration interface
3. Update Lambda stacks to use dependency injection
4. Create interfaces for all major components
5. Update existing code to use the new abstractions

## Benefits

- **Easier to Change**: Components can be modified independently
- **Better Testability**: Components can be tested in isolation
- **Clearer Responsibilities**: Each component has a well-defined responsibility
- **Reduced Cognitive Load**: Developers only need to understand interfaces
- **More Resilient to Changes**: Impact of changes is contained

## Security Improvements

- Better isolation between components
- Clearer permission boundaries
- More explicit dependencies
- Improved error handling

## Maintainability Improvements

- Centralized configuration
- Consistent approach to parameter access
- Clearer component boundaries
- Better documentation
