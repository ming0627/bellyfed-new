# Rankings Backend Requirements

This document outlines the requirements for the backend infrastructure needed to support the rankings feature.

## Infrastructure Requirements

### S3 Bucket for Photo Storage

- [ ] Create S3 bucket for storing ranking photos
- [ ] Configure CORS to allow uploads from frontend domains
- [ ] Set up bucket policy for public read access
- [ ] Implement lifecycle rules for cost optimization
- [ ] Store bucket name and ARN in SSM Parameter Store

### Database Tables

- [ ] Create `dishes` table for storing dish information
- [ ] Create `user_rankings` table for storing user rankings
- [ ] Create `ranking_photos` table for storing photo URLs
- [ ] Set up proper indexes for performance
- [ ] Implement constraints for data integrity

### IAM Permissions

- [ ] Grant ECS task role permissions to access S3 bucket
- [ ] Add policies for S3 operations (GET, PUT, DELETE, LIST)
- [ ] Ensure least privilege principle is followed

### Environment Variables

- [ ] Add S3 bucket name to ECS task environment variables
- [ ] Add AWS region to ECS task environment variables

## API Requirements

The frontend will need the following API endpoints:

### Dish Endpoints

- [ ] `GET /api/dishes` - List dishes with filtering options
- [ ] `GET /api/dishes/:id` - Get a specific dish by ID
- [ ] `GET /api/dishes/slug/:slug` - Get a specific dish by slug
- [ ] `POST /api/dishes` - Create a new dish (admin only)
- [ ] `PUT /api/dishes/:id` - Update a dish (admin only)
- [ ] `DELETE /api/dishes/:id` - Delete a dish (admin only)

### Rankings Endpoints

- [ ] `GET /api/rankings/my` - Get all rankings for the current user
- [ ] `GET /api/rankings/my/:dishSlug` - Get current user's ranking for a specific dish
- [ ] `POST /api/rankings/my/:dishSlug` - Create a new ranking
- [ ] `PUT /api/rankings/my/:dishSlug` - Update an existing ranking
- [ ] `DELETE /api/rankings/my/:dishSlug` - Delete a ranking
- [ ] `GET /api/rankings/local/:dishSlug` - Get local rankings for a dish
- [ ] `GET /api/rankings/global/:dishSlug` - Get global rankings for a dish

### Photo Upload Endpoint

- [ ] `POST /api/upload/ranking-photo` - Upload a photo for a ranking

## Deployment Requirements

- [ ] Deploy S3 bucket stack to development environment
- [ ] Execute database migration to create tables
- [ ] Update ECS task definition with new environment variables
- [ ] Verify infrastructure is correctly set up

## Testing Requirements

- [ ] Test S3 bucket access from ECS task
- [ ] Verify database tables are created correctly
- [ ] Test API endpoints with sample data
- [ ] Validate photo upload flow
