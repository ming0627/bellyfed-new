# Typesense Onboarding Guide

This guide provides an overview of Typesense in the Bellyfed platform for new team members.

## What is Typesense?

Typesense is a fast, typo-tolerant search engine that's designed to be a simpler and more lightweight alternative to Elasticsearch or OpenSearch. It's optimized for search-as-you-type experiences with typo tolerance and provides relevant results in milliseconds.

## Why We Use Typesense

We chose Typesense for the following reasons:

1. **Lightweight**: Requires minimal resources compared to Elasticsearch/OpenSearch
2. **Simple**: Easy to set up and maintain
3. **Fast**: Optimized for search-as-you-type experiences
4. **Typo-Tolerant**: Handles typos and misspellings gracefully
5. **Cost-Effective**: Lower resource requirements mean lower costs

## Typesense in Bellyfed

In the Bellyfed platform, Typesense is used for:

1. **Dish Search**: Fast, relevant search for dishes across restaurants
2. **Future Use Cases**: Restaurant search and user search (planned)

## Repository Structure

Typesense implementation is split across two repositories:

### Infrastructure Repository (`bellyfed-infra`)

Contains all the infrastructure code for Typesense:

- `lib/typesense/typesense-infrastructure-stack.ts`: Defines the Typesense ECS infrastructure
- `lib/typesense/typesense-service-stack.ts`: Defines the Typesense service
- `lib/typesense/typesense-lambda-stack.ts`: Defines the Lambda functions for Typesense
- `lib/typesense/typesense-utils.ts`: Utility functions for Typesense
- `lib/typesense/typesense-dish-schema.ts`: Schema definition for dishes
- `functions/typesense-dish-sync/index.ts`: Lambda function for syncing dish data
- `functions/typesense-dish-search/index.ts`: Lambda function for searching dishes

### Frontend Repository (`bellyfed`)

Contains the frontend code for interacting with Typesense:

- `src/utils/typesense.ts`: Typesense client utility
- `src/api/dishSearch.ts`: API client for dish search
- `src/components/DishSearch.tsx`: Search component
- `src/pages/rank-dish.tsx`: Page that integrates the search component

## Key Documentation

To get started with Typesense, review these documents:

1. [Typesense Architecture](../ARCHITECTURE/typesense/architecture.md): Overview of the Typesense implementation
2. [Typesense Migration Guide](../ARCHITECTURE/typesense/migration-guide.md): How we're transitioning from existing search to Typesense
3. [Frontend Typesense Integration](../IMPLEMENTATION/frontend/typesense-integration.md): Guide for implementing Typesense in the frontend

## Getting Started with Typesense

### For Backend Developers

1. **Review the Architecture**: Understand how Typesense is deployed and configured
2. **Explore the Schema**: Look at the dish schema to understand the data structure
3. **Test the API**: Use the `/api/dishes/search` endpoint to test search functionality

### For Frontend Developers

1. **Install Dependencies**: Add the Typesense client to the frontend
2. **Create API Client**: Implement the API client for dish search
3. **Build UI Components**: Create search components that use Typesense

## Common Tasks

### Adding a New Collection

1. Define the schema in `lib/typesense/typesense-{collection}-schema.ts`
2. Create a sync function in `functions/typesense-{collection}-sync/index.ts`
3. Add the collection to the Lambda stack in `lib/typesense/typesense-lambda-stack.ts`

### Updating a Schema

1. Update the schema definition in `lib/typesense/typesense-{collection}-schema.ts`
2. Update the sync function to handle the new fields
3. Deploy the changes
4. Run a full sync to update the data

### Troubleshooting

If you encounter issues with Typesense:

1. **Check Logs**: Look at CloudWatch logs for the Typesense service and Lambda functions
2. **Verify Connectivity**: Ensure the security groups allow proper communication
3. **Test Directly**: Use the Typesense API directly to test functionality
4. **Check Data**: Verify that data is being synced correctly

## Resources

- [Typesense Documentation](https://typesense.org/docs/)
- [Typesense JavaScript Client](https://github.com/typesense/typesense-js)
- [Typesense API Reference](https://typesense.org/docs/latest/api/)
