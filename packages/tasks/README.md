# Trigger Tasks

This package contains scheduled tasks for the LeaseUp application.

## Tasks

### Create Monthly Invoices

**File:** `src/trigger/send-monthly-invoices.ts`

This task automatically creates invoices for leases with automatic invoices enabled that are due in the next 50 days.

**What it does:**

1. Fetches all leases where `automaticInvoice` is set to `true`
2. Calculates the next invoice due date based on the lease start date and invoice cycle
3. Checks if an invoice already exists for that cycle (prevents duplicates)
4. Creates new invoices for leases that need them within the next 50 days
5. Logs detailed information about created invoices including:
   - Invoice ID
   - Lease ID
   - Due date
   - Rent amount and currency
   - Unit and property information
   - Tenant details

**How to schedule this task:**

To run this task daily, you need to set up a cron job or use Trigger.dev's scheduling feature. Here are the options:

### Option 1: Using Trigger.dev Dashboard

1. Deploy your trigger tasks
2. Go to the Trigger.dev dashboard
3. Create a new scheduled job
4. Set the cron expression to `0 9 * * *` (runs daily at 9 AM)
5. Point it to the `check-upcoming-invoices` task

### Option 2: Using Cron Job

If you're running this locally or on a server, you can set up a cron job:

```bash
# Add this to your crontab (crontab -e)
0 9 * * * cd /path/to/your/project/packages/tasks && pnpm trigger dev
```

### Option 3: Using GitHub Actions

Create a GitHub Action workflow:

```yaml
name: Daily Invoice Check
on:
  schedule:
    - cron: '0 9 * * *' # Runs daily at 9 AM UTC
jobs:
  check-invoices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: cd packages/tasks && pnpm trigger dev
```

## Development

To run the tasks locally:

```bash
cd packages/tasks
pnpm trigger dev
```

This will start the Trigger.dev development server and allow you to test your tasks.

## Environment Variables

Make sure you have the following environment variables set:

- `DATABASE_URL`: Your PostgreSQL database connection string
- `DIRECT_URL`: Direct database connection string (for Prisma)
- `TRIGGER_API_KEY`: Your Trigger.dev API key
- `TRIGGER_API_URL`: Your Trigger.dev API URL

## Database Schema Requirements

This task requires the following database schema:

- `Lease` table with fields:

  - `automaticInvoice` (boolean)
  - `startDate` (DateTime)
  - `invoiceCycle` (enum)
  - `leaseType` (enum)
  - `rent` (Float)
  - `rentDueCurrency` (String)

- Related tables: `Unit`, `Property`, `TenantLease`, `Tenant`

## Testing

You can test the task by running it manually through the Trigger.dev dashboard or by calling it programmatically:

```typescript
import { checkUpcomingInvoicesTask } from './src/trigger/send-monthly-invoices';

// Test the task
const result = await checkUpcomingInvoicesTask.run({});
console.log(result);
```
