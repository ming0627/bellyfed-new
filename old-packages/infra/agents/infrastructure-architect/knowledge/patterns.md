# Infrastructure Patterns

## API Gateway Configuration Pattern

### Custom Domain and SSL/TLS

- Use custom domains for professional and consistent API endpoints
- Format: `api-${environment}.bellyfed.com`
- Always use ACM certificates for SSL/TLS
- Configure TLS 1.2 or higher for security

### Stage Management

- Use semantic versioning in stage names (e.g., `v1`)
- Include stage variables for version and environment tracking
- Example variables:
    ```
    api.version: v1
    api.environment: ${environment}
    ```

### Performance Optimization

- Use Regional endpoint type for better latency
- Enable compression for responses (threshold: 1024 bytes)
- Configure appropriate throttling limits:
    - Rate limit: 100 requests per second
    - Burst limit: 200 requests

### Security Best Practices

- Enable API key validation
- Implement usage plans with quotas
- Configure CORS with specific allowed origins
- Use CloudWatch for logging and monitoring

### Resource Tagging

Standard tags for API Gateway resources:

- Environment: ${environment}
- Service: bellyfed-api
- Version: v1

### Example Configuration

```typescript
const api = new apigateway.RestApi(this, `${props.environment}-bellyfed-api`, {
    restApiName: `${props.environment}-bellyfed-api`,
    domainName: {
        domainName: `api-${props.environment}.bellyfed.com`,
        certificate: acm.Certificate.fromCertificateArn(
            this,
            `${props.environment}-api-cert`,
            'arn:aws:acm:ap-southeast-1:590184067494:certificate/1f461ea5-50dc-45be-87a6-449e0eae1193'
        ),
        endpointType: apigateway.EndpointType.REGIONAL,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    },
    deployOptions: {
        stageName: 'v1',
        metricsEnabled: true,
        variables: {
            'api.version': 'v1',
            'api.environment': props.environment,
        },
    },
});
```

Example:

- Method: GET
- Path: /restaurants
- Function: RestaurantListHandler
- API: Public
- Service: bellyfed-api
