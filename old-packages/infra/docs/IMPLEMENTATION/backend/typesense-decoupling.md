# Typesense Decoupling Implementation

## Overview

This document describes the implementation of the Typesense decoupling improvements that enhance maintainability, testability, and security of the Typesense integration.

## Key Components

### 1. TypesenseParameterStore Class

A dedicated class that abstracts parameter store interactions, providing a centralized way to access Typesense-related SSM parameters.

```typescript
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

    // Additional methods for client parameters...
}
```

### 2. TypesenseConfiguration Interface

An interface that abstracts parameter access, providing a consistent way to access Typesense configuration.

```typescript
export interface TypesenseConfiguration {
    endpoint: string;
    apiKey: string;
    host?: string;
    port?: number;
    protocol?: string;
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

### 3. TypesenseSecurityConfig Interface

An interface for dependency injection of security groups, allowing components to depend on security configuration without direct references.

```typescript
export interface TypesenseSecurityConfig {
    serviceSecurityGroup: ec2.ISecurityGroup;
    // Other security-related properties
}
```

### 4. ITypesenseService Interface

An interface for Typesense service components, allowing components to depend on the interface rather than concrete implementations.

```typescript
export interface ITypesenseService {
    readonly endpoint: string;
    readonly apiKey: string;
    readonly securityGroup: ec2.ISecurityGroup;
}
```

### 5. Shared TypesenseClient Utility

A shared utility for Lambda functions to access Typesense, providing a consistent way to initialize the Typesense client.

```typescript
export async function getTypesenseClient(connectionTimeoutSeconds = 5): Promise<Typesense.Client> {
    const config = await getTypesenseConfig();

    return new Typesense.Client({
        nodes: [
            {
                host: config.host,
                port: config.port,
                protocol: config.protocol,
            },
        ],
        apiKey: config.apiKey,
        connectionTimeoutSeconds,
    });
}
```

## Benefits

### Maintainability

- **Centralized Configuration**: All Typesense parameter access is centralized in the TypesenseParameterStore class
- **Consistent Approach**: All components use the same approach to access parameters
- **Reduced Duplication**: Shared code reduces duplication and potential inconsistencies

### Testability

- **Easier Mocking**: Interfaces can be mocked for testing
- **Isolated Components**: Components can be tested in isolation
- **Clearer Dependencies**: Dependencies are explicitly defined

### Security

- **Better Isolation**: Components have clearer boundaries
- **Explicit Dependencies**: Security groups are explicitly passed to components
- **Reduced Permissions**: Components only have access to the parameters they need

## Usage Examples

### Adding Typesense Environment Variables

```typescript
// Before
const typesenseEndpointParam = ssm.StringParameter.fromStringParameterAttributes(
    scope,
    'TypesenseEndpointParam',
    {
        parameterName: `/bellyfed/${environment}/typesense/endpoint`,
    }
);

// After
const paramStore = new TypesenseParameterStore(scope, environment);
const typesenseEndpointParam = paramStore.getEndpoint();
```

### Lambda Stack with Security Group Injection

```typescript
// Before
export interface TypesenseLambdaStackProps extends cdk.StackProps {
    // ...
    typesenseSecurityGroup: ec2.ISecurityGroup;
}

// After
export interface TypesenseLambdaStackProps extends cdk.StackProps, TypesenseSecurityConfig {
    // ...
    // typesenseSecurityGroup is now provided by TypesenseSecurityConfig as serviceSecurityGroup
}
```

### Lambda Function with Shared Client

```typescript
// Before
const config = await getTypesenseConfig();
const client = new Typesense.Client({
    nodes: [{ host: config.host, port: config.port, protocol: config.protocol }],
    apiKey: config.apiKey,
    connectionTimeoutSeconds: 5,
});

// After
const client = await getTypesenseClient();
```

## Conclusion

These decoupling improvements enhance the maintainability, testability, and security of the Typesense integration. By using abstractions, interfaces, and dependency injection, we've created a more modular and flexible architecture that is easier to maintain and extend.
