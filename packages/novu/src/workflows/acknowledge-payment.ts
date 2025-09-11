import { workflow } from '@novu/framework';
import { WORKFLOW } from './workflows';

export const acknowledgePaymentWorkflow = workflow(
  WORKFLOW.ACKNOWLEDGE_PAYMENT,
  async ({ step, payload }) => {
    await step.inApp('inbox', () => ({
      subject: 'Payment Received from Tenant',
      body: `Payment of ${payload.currency} ${payload.amountPaid} received from ${payload.tenantName} for ${payload.description}.`,
      primaryAction: {
        label: 'View Transaction',
        redirect: {
          target: '_self',
          url: `/transactions/${payload.transactionId}`,
        },
      },
    }));

    await step.email('email', () => ({
      subject: 'Payment Received - LeaseUp',
      body: `Dear ${payload.landlordName},

You have received a payment from your tenant!

Payment Details:
- Tenant: ${payload.tenantName}
- Amount: ${payload.currency} ${payload.amountPaid}
- Property: ${payload.propertyName}
- Unit: ${payload.unitName}
- Transaction ID: ${payload.transactionId}
- Date: ${payload.paidAt}
- Description: ${payload.description}

The payment has been successfully processed and will be transferred to your account according to your settlement schedule.

Best regards,
LeaseUp Team`,
    }));
  },
  {
    preferences: {},
  }
);
