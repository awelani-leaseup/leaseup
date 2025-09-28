# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

LeaseUp is a comprehensive property management platform built as a TypeScript monorepo using Turborepo. The system automates rent collection, tenant management, lease tracking, and property administration through a modern web interface.

## Architecture

### Monorepo Structure
The project uses **Turborepo** for efficient monorepo management with pnpm workspaces. Key workspaces include:

**Apps:**
- `apps/app` - Main Next.js 15 application (port 3001) 
- `apps/web` - Marketing website and landing pages

**Core Packages:**
- `packages/prisma` - Database schema, ORM configuration, and data layer
- `packages/trpc` - Type-safe API layer with tRPC routers
- `packages/ui` - Shared React component library with Tailwind CSS
- `packages/tasks` - Background task processing with Trigger.dev
- `packages/payments` - Paystack payment processing integration
- `packages/novu` - Notification workflows and email/SMS templates

**Configuration Packages:**
- `packages/eslint-config` - Shared ESLint configurations
- `packages/typescript-config` - Shared TypeScript configurations

### Technology Stack

**Frontend:**
- Next.js 15 with React 19 (App Router)
- TypeScript with strict type checking
- Tailwind CSS 4.0+ for styling
- tRPC for type-safe client-server communication
- Tanstack Query for data fetching and caching
- Better Auth for authentication

**Backend & Database:**
- PostgreSQL with Prisma ORM
- Complex relational schema with Users, Tenants, Properties, Leases, Invoices, and more
- AWS S3 for file storage
- Paystack for payment processing

**Background Processing:**
- Trigger.dev for background tasks and cron jobs
- Novu for notification workflows

### Database Schema Design

The Prisma schema centers around core entities:
- **User** - Landlords with subscription management via Paystack
- **Property** - Single/multi-unit properties with amenities and features
- **Unit** - Individual rental units within properties
- **Tenant** - Renter profiles with contact info and documents
- **Lease** - Rental agreements linking tenants to units
- **Invoice** - Billing with categories (rent, deposits, utilities, etc.)
- **RecurringBillable** - Automated recurring charges
- **MaintenanceRequest** - Property maintenance tracking

Key relationships use junction tables (like TenantLease) to support multi-tenant leases.

## Development Commands

### Setup and Installation
```bash
pnpm install                    # Install all dependencies
pnpm run generate              # Generate Prisma client (runs automatically post-install)
```

### Development
```bash
pnpm dev                       # Start all apps in development mode
pnpm dev --filter=app          # Start main app only (port 3001)
pnpm dev --filter=web          # Start marketing site only
```

### Database Operations (from root)
```bash
# Navigate to packages/prisma for database operations
cd packages/prisma

# Core database commands
pnpm run db:generate           # Generate Prisma client
pnpm run db:migrate           # Run migrations (for production)
pnpm run db:push              # Push schema changes (for development)
pnpm run db:studio            # Open Prisma Studio
pnpm run seed                 # Seed database with sample data
```

### Building and Testing
```bash
pnpm build                     # Build all packages and apps
pnpm build --filter=app        # Build specific app
pnpm lint                      # Run linting across all packages
pnpm check-types               # TypeScript type checking
pnpm format                    # Format code with Prettier
```

### Running Single Tests or Components
```bash
# For app-specific operations
pnpm --filter=app run lint     # Lint specific app
pnpm --filter=app run typecheck # Type check specific app
```

## Key Architectural Patterns

### tRPC API Structure
The API layer uses tRPC for end-to-end type safety. Routers are defined in `packages/trpc` and consumed by the Next.js app with full TypeScript inference.

### Authentication Flow
Uses Better Auth with database sessions. User model includes Paystack integration for subscription billing and customer identification status tracking.

### File Management
AWS S3 integration handles document storage with the File model supporting attachments to properties, tenants, leases, invoices, and maintenance requests.

### Payment Processing
Paystack integration supports:
- Customer management and identification
- Subscription billing for landlord plans
- Invoice payment processing
- Transaction tracking

### Background Tasks
Trigger.dev handles:
- Automated invoice generation
- Payment processing workflows
- Notification delivery
- Recurring billing cycles

### Multi-tenancy
The system supports multiple landlords, each managing their own properties and tenants with proper data isolation through landlordId relationships.

## Environment Variables

Key environment variables to configure (see turbo.json for complete list):

**Database:**
- `DATABASE_URL` / `POSTGRES_PRISMA_URL` - PostgreSQL connection
- `POSTGRES_URL` / `DIRECT_URL` - Direct database connection

**Authentication:**
- `BETTER_AUTH_SECRET` - Authentication secret
- `BETTER_AUTH_URL` - Authentication base URL

**Payments:**
- `PAYSTACK_SECRET_KEY` - Paystack secret key for payments

**External Services:**
- `NOVU_API_SECRET` / `NOVU_SECRET_KEY` - Notification service
- `TRIGGER_SECRET_KEY` - Background task processing
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps integration

**File Storage:**
- `SUPABASE_SERVICE_ROLE_KEY` - File storage service

## Development Guidelines

### Database Changes
1. Always modify `packages/prisma/schema.prisma`
2. Run `pnpm run db:generate` to update the client
3. Use `pnpm run db:migrate` for production schema changes
4. Use `pnpm run db:push` for development iteration

### Package Dependencies
Internal packages use workspace dependencies (`workspace:*`). When adding cross-package dependencies, ensure proper build order in turbo.json.

### Type Safety
The project heavily leverages TypeScript and tRPC for end-to-end type safety. Always maintain type definitions when making API changes.

### Component Development
UI components are centralized in `packages/ui` using Tailwind CSS. Follow existing patterns for consistent styling and accessibility.