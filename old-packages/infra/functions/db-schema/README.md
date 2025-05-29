# Database Schema Lambda Function

This Lambda function is responsible for creating and updating the database schema in the Aurora PostgreSQL database. It executes SQL scripts in the `schema` directory in alphabetical order.

## Features

- Executes SQL scripts to create and update database schema
- Uses direct PostgreSQL connection for better performance and compatibility
- Supports executing specific files or groups of files by pattern
- Handles database resuming from auto-pause state with retry logic
- Provides detailed error information for troubleshooting

## Usage

The Lambda function can be invoked with the following event parameters:

```json
{
    "migrationName": "all",
    "specificFile": null
}
```

### Parameters

- `migrationName`: The name of the migration to run. Options:
    - `all`: Run all schema files (default)
    - `dishes` or `rankings`: Run files related to dishes and rankings
    - `restaurants`: Run files related to restaurants
    - `users`: Run files related to users
    - `pattern:xyz`: Run files matching the pattern "xyz"
- `specificFile`: Run a specific file in the schema directory (e.g., "01-init.sql")

## Development

### Building

To build the Lambda function:

```bash
npm install
npm run build
```

This will create a bundled JavaScript file in the `dist` directory.

### Adding New Schema Files

Add new SQL files to the `schema` directory. Files are executed in alphabetical order, so use a numeric prefix to control the order (e.g., `01-init.sql`, `02-users.sql`).

## Environment Variables

- `DB_SECRET_ARN`: ARN of the secret containing database credentials
- `DB_NAME`: Name of the database
- `NODE_ENV`: Environment (development or production)
