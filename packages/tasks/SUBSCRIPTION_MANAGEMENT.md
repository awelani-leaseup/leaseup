# Comprehensive Subscription Management System

This document outlines the complete subscription management system implemented for handling Paystack subscription webhooks and managing landlord subscriptions.

## Overview

The system handles the full subscription lifecycle from creation to cancellation, including payment failures and card expiry notifications. It's built using Effect-TS for robust error handling and composability.

## Webhook Events Handled

### 1. `subscription.create`

**File**: `packages/tasks/src/effect/subscription-create.ts`
**Trigger**: When a landlord subscribes to a plan
**Actions**:

- Finds landlord by customer email
- Updates database with comprehensive subscription data
- Sends welcome notification via Novu
- Prevents duplicate subscriptions

### 2. `subscription.disable`

**File**: `packages/tasks/src/effect/subscription-disable.ts`
**Trigger**: When a subscription is cancelled or completed
**Actions**:

- Updates subscription status to cancelled/completed
- Clears active subscription data
- Sends cancellation/completion notification
- Provides reactivation options

### 3. `subscription.not_renewing`

**File**: `packages/tasks/src/effect/subscription-not-renewing.ts`
**Trigger**: When a subscription won't renew automatically
**Actions**:

- Updates status to non-renewing
- Notifies landlord about non-renewal
- Provides renewal options
- Maintains subscription until final payment date

### 4. `subscription.expiring_cards`

**File**: `packages/tasks/src/effect/subscription-expiring-cards.ts`
**Trigger**: Monthly notification of cards expiring that month
**Actions**:

- Processes array of expiring subscriptions
- Sends proactive card update notifications
- Provides payment method update links
- Prevents service interruption

### 5. `invoice.payment_failed`

**File**: `packages/tasks/src/effect/invoice-payment-failed.ts`
**Trigger**: When subscription payment fails
**Actions**:

- Updates subscription status to "attention"
- Records failure reason and retry count
- Sends payment failure notification
- Provides payment method update options

## Database Schema

### Enhanced User Model

```prisma
model User {
  // ... existing fields
  paystackSubscriptionId     String?    // SUB_xxx
  paystackSubscriptionStatus String?    // active, non-renewing, attention, completed, cancelled
  subscriptionPlanCode       String?    // PLN_xxx
  subscriptionAmount         Int?       // in kobo/cents
  subscriptionCurrency       String?    // NGN, ZAR, etc.
  subscriptionInterval       String?    // monthly, yearly, etc.
  nextPaymentDate           DateTime?
  subscriptionCreatedAt     DateTime?
  subscriptionUpdatedAt     DateTime?
  lastPaymentFailure        String?    // Last failure reason
  paymentRetryCount         Int?       @default(0)
}
```

## Subscription Statuses

| Status         | Description                                      | Actions Required       |
| -------------- | ------------------------------------------------ | ---------------------- |
| `active`       | Currently active, will be charged on schedule    | None                   |
| `non-renewing` | Active but won't renew automatically             | Offer renewal options  |
| `attention`    | Payment issue (expired card, insufficient funds) | Update payment method  |
| `completed`    | Subscription completed successfully              | Offer new subscription |
| `cancelled`    | Subscription cancelled                           | Offer reactivation     |

## Utility Functions

### Subscription Helpers

**File**: `packages/tasks/src/utils/subscription-helpers.ts`

Key functions:

- `getActiveSubscriptions()` - Get all active subscriptions
- `getSubscriptionsNeedingAttention()` - Get subscriptions with payment issues
- `getSubscriptionsExpiringSoon(days)` - Get subscriptions expiring soon
- `getSubscriptionStats()` - Get subscription statistics
- `updateSubscriptionStatus()` - Update subscription status
- `clearSubscriptionData()` - Clear subscription data
- `formatSubscriptionAmount()` - Format amounts for display
- `getSubscriptionStatusInfo()` - Get status display information

## Webhook Handler

**File**: `apps/app/src/app/api/paystack-webhook-handler/route.ts`

The webhook handler routes incoming Paystack webhooks to appropriate effect handlers:

```typescript
switch (payload.event) {
  case 'subscription.create':
    await runProcessSubscriptionCreateEffect(payload);
    break;
  case 'subscription.disable':
    await runProcessSubscriptionDisableEffect(payload);
    break;
  case 'subscription.not_renewing':
    await runProcessSubscriptionNotRenewingEffect(payload);
    break;
  case 'subscription.expiring_cards':
    await runProcessExpiringCardsEffect(payload);
    break;
  case 'invoice.payment_failed':
    await runProcessInvoicePaymentFailedEffect(payload);
    break;
}
```

## Notification Workflows

The system integrates with Novu for sending notifications:

### Welcome Notification

- **Workflow ID**: `welcome`
- **Trigger**: New subscription created
- **Content**: Welcome message, plan details, dashboard link

### Payment Failure Notification

- **Workflow ID**: `subscription-payment-failed`
- **Trigger**: Payment fails
- **Content**: Failure reason, retry info, update payment link

### Card Expiring Notification

- **Workflow ID**: `subscription-card-expiring`
- **Trigger**: Card expiring soon
- **Content**: Card details, expiry date, update payment link

### Subscription Cancelled/Completed

- **Workflow ID**: `subscription-cancelled` / `subscription-completed`
- **Trigger**: Subscription ends
- **Content**: End reason, reactivation options

### Non-Renewal Notification

- **Workflow ID**: `subscription-not-renewing`
- **Trigger**: Subscription won't renew
- **Content**: Last payment date, renewal options

## Database Migration

To add the new subscription fields to your existing database:

1. Update your `schema.prisma` file with the new fields
2. Run the migration script: `packages/prisma/migrations/add_subscription_fields.sql`
3. Generate Prisma client: `npx prisma generate`
4. Apply migration: `npx prisma db push`

## Error Handling

All effects use Effect-TS for robust error handling:

- Comprehensive logging for debugging
- Graceful failure handling
- Database connection cleanup
- Notification failure tolerance (doesn't fail entire process)

## Security

- IP whitelist validation for webhook endpoints
- Payload validation using Effect-TS schemas
- Secure database operations with proper error handling

## Monitoring & Analytics

### Key Metrics to Track

- Active subscription count
- Subscription churn rate
- Payment failure rate
- Card expiry notifications sent
- Successful renewals vs cancellations

### Useful Queries

```typescript
// Get subscription statistics
const stats = await getSubscriptionStats();

// Get subscriptions needing attention
const attentionNeeded = await getSubscriptionsNeedingAttention();

// Get subscriptions expiring in next 7 days
const expiringSoon = await getSubscriptionsExpiringSoon(7);
```

## Testing

### Example Payloads

Test payloads are provided in:

- `packages/tasks/src/effect/subscription-create.example.ts`

### Manual Testing

1. Use Paystack's webhook testing tools
2. Send test webhooks to your local development server
3. Verify database updates and notifications

## Deployment Checklist

- [ ] Database schema updated with new fields
- [ ] Migration script executed
- [ ] Webhook endpoint configured in Paystack dashboard
- [ ] Novu workflows created for all notification types
- [ ] Environment variables configured
- [ ] IP whitelist updated for production
- [ ] Monitoring and alerting configured

## Future Enhancements

1. **Subscription Analytics Dashboard**

   - Real-time subscription metrics
   - Payment failure trends
   - Customer lifecycle analytics

2. **Automated Dunning Management**

   - Progressive payment retry logic
   - Automated grace periods
   - Smart subscription pausing

3. **Customer Self-Service Portal**

   - Update payment methods
   - Pause/resume subscriptions
   - View billing history

4. **Advanced Notifications**
   - SMS notifications for critical events
   - In-app notifications
   - Customizable notification preferences

## Support

For issues or questions:

1. Check the logs for detailed error messages
2. Verify webhook payload structure matches schemas
3. Ensure database fields are properly migrated
4. Confirm Novu workflows are configured correctly
