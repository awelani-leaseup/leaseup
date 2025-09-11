# ⚠️ IMPORTANT: Prisma Migration Required

## Database Schema Changes

The subscription management system has added new fields to the `User` model. You need to run the following commands to update your database and Prisma client:

### Step 1: Generate Migration

```bash
cd packages/prisma
npx prisma migrate dev --name add_subscription_fields
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Apply to Production (when ready)

```bash
npx prisma migrate deploy
```

## New Fields Added

The following fields were added to the `User` model:

- `paystackSubscriptionStatus` - Subscription status tracking
- `subscriptionPlanCode` - Paystack plan code
- `subscriptionAmount` - Subscription amount in kobo/cents
- `subscriptionCurrency` - Currency (NGN, ZAR, etc.)
- `subscriptionInterval` - Billing interval
- `nextPaymentDate` - Next payment date
- `subscriptionCreatedAt` - Subscription creation date
- `subscriptionUpdatedAt` - Last update date
- `lastPaymentFailure` - Last failure reason
- `paymentRetryCount` - Number of retry attempts

## Current Status

❌ **The TypeScript compilation will fail until you run the migration commands above.**

The new subscription effect handlers reference these fields, but they don't exist in the generated Prisma client yet.

## After Migration

Once you've run the migration:

1. The TypeScript errors will be resolved
2. All subscription webhook handlers will work correctly
3. The subscription management utilities will be fully functional

## Alternative: Temporary Workaround

If you can't run migrations immediately, you can temporarily comment out the new field assignments in the effect files until you're ready to migrate.
