-- BookMind Database Initialization Script
-- This script runs when the PostgreSQL container is first created

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- Create test database for integration tests
CREATE DATABASE bookmind_test;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bookmind TO bookmind;
GRANT ALL PRIVILEGES ON DATABASE bookmind_test TO bookmind;
