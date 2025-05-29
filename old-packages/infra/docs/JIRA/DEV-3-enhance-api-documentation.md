# DEV-3: Enhance API Documentation

## Summary

Improve API documentation with OpenAPI specifications and interactive documentation.

## Description

The current API documentation is incomplete and lacks interactive features, making it difficult for developers to understand and use the API. This task involves enhancing the API documentation with OpenAPI specifications and interactive documentation.

## Acceptance Criteria

- [ ] Create OpenAPI specifications for all API endpoints
- [ ] Implement automatic OpenAPI generation from code
- [ ] Add request and response examples for all endpoints
- [ ] Implement interactive API documentation with Swagger UI
- [ ] Add authentication documentation
- [ ] Create API versioning strategy
- [ ] Update existing documentation to reflect the new approach

## Technical Details

The implementation should include:

1. **OpenAPI Specification**:

    ```yaml
    openapi: 3.0.0
    info:
        title: Bellyfed API
        description: API for the Bellyfed platform
        version: 1.0.0
    servers:
        - url: https://api-dev.bellyfed.com
          description: Development server
        - url: https://api-prod.bellyfed.com
          description: Production server
    paths:
        /rankings:
            get:
                summary: Get rankings
                description: Get rankings for a specific dish
                parameters:
                    - name: dishId
                      in: query
                      required: true
                      schema:
                          type: string
                responses:
                    '200':
                        description: Successful response
                        content:
                            application/json:
                                schema:
                                    $ref: '#/components/schemas/RankingsResponse'
                    '400':
                        description: Bad request
                        content:
                            application/json:
                                schema:
                                    $ref: '#/components/schemas/ErrorResponse'
                    '401':
                        description: Unauthorized
                        content:
                            application/json:
                                schema:
                                    $ref: '#/components/schemas/ErrorResponse'
    components:
        schemas:
            RankingsResponse:
                type: object
                properties:
                    rankings:
                        type: array
                        items:
                            $ref: '#/components/schemas/Ranking'
            Ranking:
                type: object
                properties:
                    id:
                        type: string
                    dishId:
                        type: string
                    userId:
                        type: string
                    rating:
                        type: number
                    comment:
                        type: string
                    createdAt:
                        type: string
                        format: date-time
            ErrorResponse:
                type: object
                properties:
                    error:
                        type: object
                        properties:
                            code:
                                type: string
                            message:
                                type: string
    ```

2. **Automatic OpenAPI Generation**:

    ```typescript
    // Use tsoa for automatic OpenAPI generation
    import { Controller, Get, Path, Query, Route, Tags } from 'tsoa';

    @Route('rankings')
    @Tags('Rankings')
    export class RankingsController extends Controller {
        /**
         * Get rankings for a specific dish
         * @param dishId The ID of the dish
         * @returns Rankings for the dish
         */
        @Get()
        public async getRankings(@Query() dishId: string): Promise<RankingsResponse> {
            // Implementation
        }
    }
    ```

3. **Swagger UI Integration**:

    ```typescript
    // Add Swagger UI to Express app
    import * as express from 'express';
    import * as swaggerUi from 'swagger-ui-express';
    import * as swaggerDocument from './swagger.json';

    const app = express();

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    ```

## Benefits

- Improved developer experience
- Better understanding of API capabilities
- Interactive API testing
- Consistent API documentation
- Easier onboarding for new developers
- Better API versioning strategy

## Priority

Medium

## Estimated Story Points

5

## Dependencies

None - can be implemented independently of other tasks

## Attachments

- [API Reference](../DEVELOPMENT/backend/api-reference.md)
- [API Integration](../DEVELOPMENT/backend/api-integration.md)
