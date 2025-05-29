# Restaurant Import Tools

This directory contains tools for importing restaurant data from Google Maps API to the PostgreSQL RDS database.

## Overview

The tools provide two ways to import restaurant data:

1. **Command-line interface** - For quick imports using the terminal
2. **Web interface** - A user-friendly admin panel for searching and importing restaurants

## Prerequisites

- Node.js 16+
- PostgreSQL RDS database
- Google Maps API key with Places API enabled

## Setup

1. Install dependencies:

   ```
   cd scripts
   npm install
   ```

2. Create a `.env` file based on the `.env.example` template:

   ```
   cp .env.example .env
   ```

3. Edit the `.env` file with your actual credentials:

   ```
   # Google Maps API Key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

   # PostgreSQL Database Connection
   DATABASE_URL=postgresql://bellyfed_admin:password@localhost:5432/bellyfed_dev

   # Optional: Set to true to run in test mode (no database writes)
   TEST_MODE=false

   # Optional: Maximum number of results to process
   MAX_RESULTS=20
   ```

## Command-line Usage

You can import restaurants directly from the command line:

```bash
# Basic usage
npm run import

# With custom parameters
npm run import "Fried Rice" 100 3.5 20

# Parameters:
# 1. Dish type (e.g., "Fried Rice", "Nasi Lemak")
# 2. Minimum reviews (e.g., 100)
# 3. Minimum rating (e.g., 3.5)
# 4. Maximum results (e.g., 20)
```

Or run the script directly:

```bash
node import-restaurants-cli.js "Fried Rice" 100 3.5 20
```

### Mock Import (No API Key Required)

For testing without a Google Maps API key, use the mock import:

```bash
# Basic usage
npm run mock-import

# With custom parameters
npm run mock-import "Spicy" 1000 4.5 3
```

## Web Interface

The web interface is available at `/admin/import-restaurants` in the Bellyfed application.

Features:

- Search for restaurants with specific criteria
- Preview search results before importing
- Select which restaurants to import
- View import results and statistics

## Admin API

The application includes secure admin API endpoints for restaurant management:

- `POST /api/admin/restaurants/search` - Search for restaurants using Google Maps API
- `POST /api/admin/restaurants/import` - Import restaurants to the PostgreSQL database

These endpoints are protected by authentication middleware that ensures only authorized users can access them. The middleware supports two authentication methods:

1. **Session-based authentication** - For browser-based access by admin users
2. **API key authentication** - For service-to-service calls using the `x-admin-api-secret` header

To use the API programmatically, set the `ADMIN_API_SECRET` environment variable and include it in your requests.

## Database Schema

The scripts will automatically create the necessary database tables if they don't exist:

### Restaurants Table

```sql
CREATE TABLE restaurants (
  restaurant_id UUID PRIMARY KEY,
  google_place_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  website VARCHAR(255),
  hours JSONB,
  cuisine_type VARCHAR(100)[],
  price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Dishes Table

```sql
CREATE TABLE dishes (
  dish_id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(restaurant_id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(255),
  dish_type VARCHAR(100) NOT NULL,
  tags VARCHAR(50)[],
  is_seasonal BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Files

- `import-to-postgres.js` - Core library for importing restaurants to PostgreSQL
- `import-restaurants-cli.js` - Command-line interface for importing restaurants
- `mock-import.js` - Mock version for testing without Google Maps API key
- `../pages/admin/import-restaurants.js` - Web interface for importing restaurants
- `../pages/api/admin/restaurants/search.js` - API endpoint for searching restaurants
- `../pages/api/admin/restaurants/import.js` - API endpoint for importing restaurants
- `../pages/api/admin/mock-search-restaurants.js` - Mock API endpoint for testing
- `../pages/api/admin/mock-import-restaurants.js` - Mock API endpoint for testing
- `../src/middleware/adminAuthMiddleware.js` - Authentication middleware for admin API endpoints

## Example

```bash
# Import the top 20 Fried Rice restaurants in Singapore with at least 100 reviews and 3.5+ rating
npm run import "Fried Rice" 100 3.5 20
```
