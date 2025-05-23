-- Database initialization script for Bellyfed
-- Creates necessary extensions and initial schema

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist (this runs in the context of the postgres database)
-- The actual bellyfed database is created by the POSTGRES_DB environment variable

-- Set timezone
SET timezone = 'UTC';

-- Create initial schema (will be managed by Prisma migrations in production)
-- This is just for Docker initialization

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Bellyfed database initialized successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto, pg_trgm';
    RAISE NOTICE 'Timezone set to UTC';
END $$;
