# Infrastructure Architect - Development Workflow Knowledge Base

Version: v1.1.0
Last Updated: 2024-12-07 16:33:38 +08:00
Status: Active

This document contains the Infrastructure Architect agent's knowledge about development workflows and best practices for the Oishiiteru infrastructure.

## Environment Strategy Knowledge

### Environment Purposes

- **Dev**: Rapid development and testing
- **Staging**: Integration testing and UAT
- **QA**: Quality assurance and testing
- **Prod**: Production environment

## Deployment Process Guidance

### Stack Dependencies and Deployment Order

The stacks must be deployed in the following order due to dependencies:

1. **DynamoDB Stack**: Base tables and GSIs
2. **SSM Stack**: Parameter store for ARNs and configurations
3. **SQS Stack**: Message queues (depends on SSM)
4. **SharedResources Stack**: Common resources
5. **Lambda Stack**: Functions (depends on DynamoDB, SSM, SQS, and SharedResources)
6. **EventBridge Stack**: Event rules (depends on Lambda)
7. **API Gateway Stack**: API endpoints (depends on Lambda and SSM)
8. **Infrastructure Monitoring Stack**: Monitoring resources (depends on all other stacks)

### Automated Deployment Process

The project uses an automated CI/CD pipeline in CodeBuild that handles deployments:

```bash
# The pipeline automatically runs:
cdk deploy --require-approval never --context environment="$ENVIRONMENT" --context gsi_stage=none "*"
```

### Manual Deployment (Development Only)

```bash
# Deploy to dev (not recommended for staging/prod)
npm run cdk deploy -- --app "npx ts-node bin/cdk.ts" "*-dev"

# Destroy dev resources
npm run cdk destroy -- --app "npx ts-node bin/cdk.ts" "*-dev"
```

### Environment-Specific Deployments

- **Dev/Staging**: Automated via CodeBuild pipeline
- **Production**: Requires manual approval in pipeline
- **GSI Deployments**: Handled separately after main deployment

### GSI Deployment Process

GSIs are deployed in sequence after the main infrastructure:

1. establishment-location
2. establishment-cuisine
3. establishment-price
4. menuitem-category
5. review-user

### Pipeline Features

- Automated testing and building
- Stack dependency management
- GSI deployment orchestration
- Documentation synchronization
- Production approval gates

## Testing Strategy Guidance

### Unit Testing

- Test individual constructs
- Mock AWS services using aws-cdk-lib/assertions
- Run: `npm run test`

### Integration Testing

- Test stack interactions
- Use real AWS services in dev environment
- Run: `npm run integration-test`

### Load Testing

- Use Artillery for API load testing
- Run in staging environment
- Monitor costs during tests

## CI/CD Pipeline Knowledge

### GitHub Actions Workflow Stages

1. **Pull Request Stage**:

    - Lint code
    - Run unit tests
    - Synthesize CDK stacks
    - Deploy to dev environment

2. **Main Branch Stage**:

    - Deploy to staging
    - Run integration tests
    - Deploy to QA if tests pass

3. **Release Stage**:
    - Deploy to production
    - Run smoke tests
    - Monitor deployment

## Monitoring and Debugging Guidelines

### CloudWatch Logs

- Use Log Insights for debugging
- Set up log metric filters
- Create custom dashboards

### X-Ray Tracing

- Enable tracing in staging and prod
- Analyze service dependencies
- Track performance bottlenecks

## Security Best Practices

### IAM Roles

- Use least privilege principle
- Rotate access keys regularly
- Audit IAM permissions monthly

### Secrets Management

- Use SSM Parameter Store
- Encrypt sensitive values
- Different values per environment

## Code Organization Standards

### Best Practices

- Keep constructs modular
- Use consistent naming conventions
- Document stack dependencies

### Resource Management

- Tag all resources
- Clean up unused resources
- Regular cost reviews

### Configuration Management

- Use config.ts for environment settings
- Version control configurations
- Document configuration changes

## Lambda Function Standards

### File Structure

- All Lambda functions reside in `functions/` directory
- Each function has its own directory with:
    - `index.ts` (main handler file)
    - `dist/` (compiled code)
    - `package.json`
    - `tsconfig.json`

### Naming Conventions

- Function handler is standardized to `index.handler`
- Function directory name matches the Lambda function name
- TypeScript source files are compiled to `dist/` directory

### Configuration Standards

- Default configurations in LambdaFactory:
    - Memory: 128MB
    - Timeout: 15 seconds
    - Max Retries: 3
    - Handler: index.handler
- Override defaults only when necessary (e.g., longer timeout for batch operations)

### Best Practices

- Keep function code in `index.ts`
- Only deploy compiled code from `dist/` directory
- Use centralized error handling with retry mechanism
- Follow the principle of least privilege for IAM permissions

## Lambda Function Patterns

### Restaurant Query Function

The restaurant query function (`restaurant-query`) handles all restaurant-related queries with these endpoints:

1. **Get Restaurant by ID**: `/restaurants/{id}`

    - Returns a single restaurant by its ID
    - Uses DynamoDB GetCommand for efficient single-item retrieval

2. **List Restaurants**: `/restaurants/list`

    - Returns a paginated list of restaurants
    - Supports query parameters:
        - `limit`: Maximum number of restaurants to return
        - `nextToken`: Token for pagination

3. **Search Restaurants**: `/restaurants`
    - Searches restaurants with filters (cuisine, location, price)
    - Uses GSIs for efficient filtered queries:
        - LocationIndex: Query by city and rating
        - CuisineIndex: Query by cuisine and rating

Example Lambda response format:

```typescript
{
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: Restaurant[],
    count: number,
    nextToken?: string  // Base64 encoded LastEvaluatedKey
  })
}
```

### Performance Considerations

- Use GSIs for filtered queries (cuisine, location)
- Use Scan for listing all items, but with pagination
- Monitor table capacity during high-traffic periods
- Consider implementing caching for frequently accessed data

## Troubleshooting Knowledge

### Common Issues and Solutions

1. **Deployment Failures**:

    - Check CloudFormation events
    - Verify IAM permissions
    - Review resource limits

2. **Performance Issues**:

    - Check CloudWatch metrics
    - Review Lambda cold starts
    - Analyze API Gateway latency

3. **Cost Spikes**:
    - Review Cost Explorer
    - Check resource utilization
    - Verify auto-scaling settings

## Agent Responsibilities

As the Infrastructure Architect agent, I will:

1. Guide users through deployment processes
2. Recommend testing strategies
3. Help troubleshoot infrastructure issues
4. Ensure security best practices
5. Maintain infrastructure documentation

## Last Updated

2024-12-07 16:33:38 +08:00

## Deployment Commands

For deploying infrastructure:

```bash
# Deploy all stacks
cdk deploy --require-approval never --context environment="$ENVIRONMENT" "*"

# Deploy specific stack
cdk deploy --require-approval never --context environment="$ENVIRONMENT" "StackName-${ENVIRONMENT}"
```
