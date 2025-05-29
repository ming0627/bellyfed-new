# Typesense Backend Setup Guide

This guide provides instructions for setting up and configuring Typesense in the backend infrastructure.

## Prerequisites

- AWS CDK installed and configured
- Access to the `bellyfed-infra` repository
- Basic understanding of ECS, Lambda, and API Gateway

## Infrastructure Components

The Typesense backend infrastructure consists of the following components:

1. **Typesense ECS Service**: Runs the Typesense container in ECS Fargate
2. **EFS Volume**: Provides persistent storage for Typesense data
3. **Lambda Functions**: Handle data synchronization and search requests
4. **API Gateway**: Exposes the search API endpoints
5. **Security Groups**: Control access to the Typesense service
6. **IAM Roles**: Provide necessary permissions

## Deployment Steps

### 1. Configure Environment Variables

Set the following environment variables:

```bash
export TYPESENSE_API_KEY=your_api_key
```

### 2. Deploy the Infrastructure

Deploy the Typesense infrastructure stack:

```bash
npx cdk deploy BellyfedTypesenseInfraStack-{environment}
```

### 3. Deploy the Service

Deploy the Typesense service stack:

```bash
npx cdk deploy BellyfedTypesenseServiceStack-{environment}
```

### 4. Deploy the Lambda Functions

Deploy the Typesense Lambda stack:

```bash
npx cdk deploy BellyfedTypesenseLambdaStack-{environment}
```

## Configuration

### Typesense Configuration

The Typesense service is configured with the following parameters:

- **CPU**: 256 units (0.25 vCPU)
- **Memory**: 512 MB
- **Scaling**: Min 1, Max 2 instances
- **Port**: 8108
- **Protocol**: HTTP

These parameters can be adjusted in `lib/config.ts` based on your environment's needs.

### Schema Configuration

The dish schema is defined in `lib/typesense/typesense-dish-schema.ts`. You can modify this file to add or remove fields as needed.

```typescript
export const TYPESENSE_DISH_SCHEMA = {
    name: 'dishes',
    fields: [
        { name: 'dish_id', type: 'string' },
        { name: 'restaurant_id', type: 'string' },
        { name: 'name', type: 'string' },
        // Add more fields as needed
    ],
    default_sorting_field: 'created_at',
};
```

### Data Synchronization

The data synchronization Lambda function is configured to run every hour. You can adjust this schedule in `lib/typesense/typesense-lambda-stack.ts`:

```typescript
const syncSchedule = new events.Rule(this, 'DishSyncSchedule', {
    ruleName: `typesense-dish-sync-schedule-${props.environment}`,
    schedule: events.Schedule.rate(cdk.Duration.hours(1)), // Adjust as needed
    description: 'Scheduled event to sync dishes to Typesense',
});
```

## Testing

### Testing the API

You can test the search API using curl:

```bash
curl -X GET "https://api.bellyfed.com/api/dishes/search?q=sushi"
```

### Testing Data Synchronization

You can manually trigger the data synchronization Lambda function:

```bash
aws lambda invoke --function-name typesense-dish-sync-{environment} --payload '{}' response.json
```

## Monitoring

### CloudWatch Metrics

Monitor the Typesense service using CloudWatch metrics:

- **CPU Utilization**: Monitor CPU usage to determine if scaling is needed
- **Memory Utilization**: Monitor memory usage to detect potential issues
- **Request Count**: Monitor the number of search requests

### CloudWatch Logs

Check the CloudWatch logs for issues:

- **Typesense Service Logs**: `/aws/ecs/bellyfed-typesense-{environment}`
- **Dish Sync Lambda Logs**: `/aws/lambda/typesense-dish-sync-{environment}`
- **Dish Search Lambda Logs**: `/aws/lambda/typesense-dish-search-{environment}`

## Troubleshooting

### Common Issues

1. **Typesense Service Not Starting**:

    - Check the ECS service logs for errors
    - Verify that the security groups allow proper access
    - Ensure the EFS volume is mounted correctly

2. **Data Not Syncing**:

    - Check the dish sync Lambda logs for errors
    - Verify that the Lambda function has the necessary permissions
    - Ensure the database connection is working

3. **Search API Not Working**:
    - Check the dish search Lambda logs for errors
    - Verify that the API Gateway is configured correctly
    - Ensure the security groups allow proper access

## Adding New Collections

To add a new collection to Typesense:

1. Create a schema definition file in `lib/typesense/typesense-{collection}-schema.ts`
2. Create a sync function in `functions/typesense-{collection}-sync/index.ts`
3. Add the collection to the Lambda stack in `lib/typesense/typesense-lambda-stack.ts`
4. Update the API Gateway to expose the new search endpoint

## Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [ECS Fargate Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
