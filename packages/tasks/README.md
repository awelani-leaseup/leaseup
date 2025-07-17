# Tasks Package

This package contains scheduled tasks for the LeaseUp application.

## Available Tasks

### 1. Check Upcoming Invoices (`send-monthly-invoices.ts`)

- **Schedule**: Daily at 7:00 AM (Johannesburg time)
- **Purpose**: Creates invoices for leases with automatic invoicing enabled
- **Function**: `checkUpcomingInvoicesTask`
- **Retry Logic**: Triggers individual `createInvoiceTask` tasks with built-in retry mechanism

### 2. Create Invoice (`send-monthly-invoices.ts`)

- **Purpose**: Creates individual invoices with built-in retry logic
- **Function**: `createInvoiceTask`
- **Retry Logic**: Uses Trigger.dev's built-in retry mechanism with exponential backoff

### 3. Send Late Payment Reminders (`send-late-payment-reminders.ts`)

- **Schedule**: Daily at 9:00 AM (Johannesburg time)
- **Purpose**: Sends SMS notifications to tenants for invoices overdue by more than 3 days
- **Function**: `sendLatePaymentRemindersTask`

## Retry Configuration

The tasks use Trigger.dev's built-in retry logic configured in `trigger.config.ts`:

```typescript
retries: {
  enabledInDev: true,
  default: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
    randomize: true,
  },
}
```

The `createInvoiceTask` has its own retry configuration:

```typescript
retry: {
  maxAttempts: 3,
  factor: 2,
  minTimeoutInMs: 1000,
  maxTimeoutInMs: 10000,
  randomize: true,
}
```

When the `createInvoiceTask` throws an error (e.g., Paystack API failure, database connection issue), Trigger.dev will automatically retry it up to 3 times with exponential backoff (1s, 2s, 4s delays). This is particularly useful for handling transient API failures from Paystack or database connection issues.

## Environment Variables

Add these environment variables to your `.env` file:

### Required for Invoice Generation

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

### Required for SMS Notifications

```env
# SMS Configuration
SMS_ENABLED=true
SMS_PROVIDER=twilio  # or 'aws-sns'
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_FROM_NUMBER=+1234567890
```

### Optional Configuration

```env
# Task Configuration
TASK_BATCH_SIZE=10
TASK_CHECK_DAYS_AHEAD=50
```

## SMS Implementation

The late payment reminders task includes SMS sending functionality. Choose your preferred SMS service provider:

### Option 1: Twilio

1. Install the Twilio package:

```bash
npm install twilio
```

2. Update the `sendSmsViaTwilio` function in `send-late-payment-reminders.ts`:

```typescript
import twilio from 'twilio';

async function sendSmsViaTwilio(
  phoneNumber: string,
  message: string,
  accountSid: string,
  authToken: string,
  fromNumber: string
): Promise<boolean> {
  try {
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    logger.error('Failed to send SMS via Twilio', { error });
    return false;
  }
}
```

3. Set environment variables:

```env
SMS_PROVIDER=twilio
SMS_API_KEY=your_twilio_account_sid
SMS_API_SECRET=your_twilio_auth_token
SMS_FROM_NUMBER=your_twilio_phone_number
```

### Option 2: AWS SNS

1. Install the AWS SNS package:

```bash
npm install @aws-sdk/client-sns
```

2. Update the `sendSmsViaAwsSns` function in `send-late-payment-reminders.ts`:

```typescript
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

async function sendSmsViaAwsSns(
  phoneNumber: string,
  message: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<boolean> {
  try {
    const snsClient = new SNSClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await snsClient.send(
      new PublishCommand({
        Message: message,
        PhoneNumber: phoneNumber,
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to send SMS via AWS SNS', { error });
    return false;
  }
}
```

3. Set environment variables:

```env
SMS_PROVIDER=aws-sns
SMS_API_KEY=your_aws_access_key_id
SMS_API_SECRET=your_aws_secret_access_key
```

## Tenant Paystack Customer Creation

For the invoice generation to work properly, each tenant needs a Paystack customer ID. You'll need to implement customer creation when tenants are added to the system.

### Implementation Steps:

1. **Create a function to create Paystack customers** (already implemented in `packages/payments/src/invoice.ts`)

2. **Update tenant creation flow** to create Paystack customers automatically

3. **Add a migration script** to create customers for existing tenants

Example migration script:

```typescript
// scripts/create-paystack-customers.ts
import { db } from '@leaseup/prisma/db';
import { createCustomer } from '@leaseup/payments/invoice';

async function createPaystackCustomersForExistingTenants() {
  const tenantsWithoutCustomerId = await db.tenant.findMany({
    where: {
      paystackCustomerId: null,
    },
  });

  for (const tenant of tenantsWithoutCustomerId) {
    try {
      const customerResponse = await createCustomer({
        email: tenant.email,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        phone: tenant.phone,
      });

      if (customerResponse.status === 'success') {
        await db.tenant.update({
          where: { id: tenant.id },
          data: { paystackCustomerId: customerResponse.data.customer_code },
        });

        console.log(
          `Created Paystack customer for tenant: ${tenant.firstName} ${tenant.lastName}`
        );
      }
    } catch (error) {
      console.error(
        `Failed to create customer for tenant ${tenant.id}:`,
        error
      );
    }
  }
}
```

## Development

To run the tasks locally:

```bash
pnpm dev
```

To deploy the tasks:

```bash
pnpm deploy
```

## Monitoring and Debugging

### Logs to Monitor

1. **Invoice Creation Logs**:

   - `Starting check for upcoming invoices`
   - `Found X leases with automatic invoices enabled`
   - `Created new invoice`
   - `Failed to create invoice`

2. **SMS Notification Logs**:
   - `Starting late payment reminders check`
   - `Found X invoices overdue by more than 3 days`
   - `SMS notification sent`
   - `Failed to send SMS notification`

### Common Issues and Solutions

1. **"No Paystack customer ID found for tenant"**

   - Solution: Run the customer creation migration script
   - Ensure new tenants get customer IDs created automatically

2. **"PAYSTACK_SECRET_KEY environment variable is required"**

   - Solution: Add the environment variable to your `.env` file

3. **"SMS configuration missing"**

   - Solution: Configure SMS environment variables or set `SMS_ENABLED=false` for development

4. **"Paystack API error"**
   - Check your Paystack API key validity
   - Verify the customer ID exists in Paystack
   - Check Paystack account balance and limits

## Task Configuration

The tasks are configured with sensible defaults but can be customized:

- **Max Duration**: 5 minutes per task
- **Retry Logic**: 3 attempts with exponential backoff
- **Batch Processing**: 10 invoices per batch
- **Check Period**: 50 days ahead for upcoming invoices
- **Timezone**: Africa/Johannesburg

## Production Considerations

1. **Environment Variables**: Use production Paystack keys
2. **SMS Service**: Choose a reliable SMS provider for production
3. **Monitoring**: Set up alerts for task failures
4. **Rate Limiting**: Be mindful of API rate limits
5. **Error Handling**: Monitor and address failed invoice creations
6. **Backup**: Ensure database backups are in place
