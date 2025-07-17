# @leaseup/prisma

This package provides the Prisma ORM setup and database schema for the LeaseUp application. It serves as a centralized database layer that can be used across different services within the LeaseUp ecosystem.

## Overview

The @leaseup/prisma package handles all database operations and schema definitions for the LeaseUp property management system. It includes models for tenants, properties, leases, and other related entities.

## Installation

```bash
npm install @leaseup/prisma
# or
yarn add @leaseup/prisma
```

## Setup

1. Create a `.env` file in the root of your project and add your database connection string:

```.env
DATABASE_URL="postgresql://username:password@localhost:5432/leaseup?schema=public"
```

2. Generate the Prisma client:

```bash
npx prisma generate
```

3. Run migrations to set up your database:

```bash
npx prisma migrate dev
```

## Database Schema

The database schema includes the following main models:

- **User**: Authentication and user management
- **Tenant**: Information about tenants
- **Property**: Property details and metadata
- **Lease**: Lease agreements connecting tenants to properties
- **Payment**: Payment records and history
- **Maintenance**: Maintenance requests and their status

You can view the complete schema in the `schema.prisma` file.

## Available Scripts

- `build`: Builds the package for production
- `db:generate`: Generates the Prisma client
- `db:push`: Pushes the schema to the database without migrations
- `db:migrate`: Runs migrations to update the database schema
- `db:seed`: Seeds the database with initial data
- `db:studio`: Opens Prisma Studio for visual database management

Example usage:

```bash
npm run db:generate
npm run db:migrate
```

## Usage

### Importing the Prisma Client

```typescript
import { prisma } from '@leaseup/prisma';
```

### Example Queries

#### Finding a tenant

```typescript
const tenant = await prisma.tenant.findUnique({
  where: { id: tenantId },
  include: { leases: true },
});
```

#### Creating a new lease

```typescript
const newLease = await prisma.lease.create({
  data: {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    monthlyRent: 1500,
    tenant: { connect: { id: tenantId } },
    property: { connect: { id: propertyId } },
  },
});
```

## Development

### Making Schema Changes

1. Edit the `schema.prisma` file
2. Run `npm run db:generate` to update the Prisma client
3. Run `npm run db:migrate` to create and apply a migration

### Best Practices

- Always create migrations for schema changes
- Use transactions for operations that modify multiple records
- Follow the repository pattern for complex database operations
