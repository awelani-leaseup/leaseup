# LeaseUp

A comprehensive property management platform that simplifies rental management for landlords. LeaseUp automates rent collection, tenant management, lease tracking, and property administration through an intuitive web interface.

## 🏠 Features

### Core Functionality

- **Property Management**: Manage single and multi-unit properties with detailed information and documentation
- **Tenant Management**: Complete tenant profiles, contact information, and relationship tracking
- **Lease Management**: Digital lease agreements with automated renewals and tracking
- **Online Rent Collection**: Automated invoicing, payment processing, and rent reminders
- **Document Management**: Secure storage and organization of property documents
- **Financial Reporting**: Track payments, generate reports, and monitor property performance

### Automation & Notifications

- **Automated Rent Reminders**: Email/SMS notifications for upcoming rent payments
- **Invoice Generation**: Automatic monthly invoice creation and distribution
- **Payment Notifications**: Instant alerts when rent is received
- **Maintenance Tracking**: Request and track property maintenance issues

## 🛠 Technology Stack

### Frontend

- **Next.js 15** with React 19
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **tRPC** for type-safe API communication
- **Tanstack Query** for data fetching and caching

### Backend

- **PostgreSQL** database
- **Prisma ORM** for database management
- **Better Auth** for authentication
- **tRPC** for API layer

### Infrastructure & Services

- **Paystack** for payment processing
- **AWS S3** for file storage
- **Novu** for notification workflows
- **Trigger.dev** for background task processing
- **Effect-TS** for functional programming patterns

### Development Tools

- **Turborepo** for monorepo management
- **ESLint** & **Prettier** for code quality
- **Uppy** for file uploads

## 📁 Project Structure

This is a Turborepo monorepo containing the following apps and packages:

### Apps

- **`apps/app`**: Main LeaseUp application (Next.js)
- **`apps/web`**: Marketing website and landing pages
- **`apps/docs`**: Documentation site

### Packages

- **`packages/prisma`**: Database schema and ORM configuration
- **`packages/trpc`**: tRPC routers and API definitions
- **`packages/ui`**: Shared React component library
- **`packages/tasks`**: Background task processing and cron jobs
- **`packages/payments`**: Payment processing and Paystack integration
- **`packages/novu`**: Notification workflows and templates
- **`packages/supabase`**: Supabase configuration
- **`packages/eslint-config`**: Shared ESLint configurations
- **`packages/typescript-config`**: Shared TypeScript configurations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.0.0+
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd leaseup
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
# Copy environment example files and configure
cp .env.example .env.local
```

4. Set up the database:

```bash
# Generate Prisma client
pnpm run db:generate

# Run database migrations
pnpm run db:migrate

# Seed the database (optional)
pnpm run db:seed
```

### Development

Start the development servers:

```bash
# Start all apps and services
pnpm dev

# Or start specific apps
pnpm dev --filter=app          # Main application (port 3001)
pnpm dev --filter=web          # Marketing site
pnpm dev --filter=docs         # Documentation
```

### Building

Build all apps and packages:

```bash
pnpm build
```

Build specific packages:

```bash
pnpm build --filter=app
pnpm build --filter=web
```

## 📝 Available Scripts

### Root Level

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications and packages
- `pnpm lint` - Run linting across all packages
- `pnpm format` - Format code with Prettier
- `pnpm check-types` - Run TypeScript type checking

### Database (from packages/prisma)

- `pnpm run db:generate` - Generate Prisma client
- `pnpm run db:migrate` - Run database migrations
- `pnpm run db:push` - Push schema changes without migrations
- `pnpm run db:seed` - Seed database with sample data
- `pnpm run db:studio` - Open Prisma Studio

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="..."

# Payments
PAYSTACK_SECRET_KEY="..."
PAYSTACK_PUBLIC_KEY="..."

# AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET_NAME="..."

# Notifications
NOVU_API_KEY="..."
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Check the [documentation](./apps/docs)
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using [Turborepo](https://turbo.build/repo)
