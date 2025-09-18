-- PostgreSQL Extensions for LeaseUp
-- This script runs automatically when the database is first created

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing and encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable unaccent for text search without accents
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Enable pg_trgm for fuzzy text matching and similarity
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Log the successful initialization
SELECT 'Database extensions initialized successfully' AS message;
