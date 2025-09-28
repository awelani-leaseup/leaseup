import { workflow } from '@novu/framework';
import { WORKFLOW } from './workflows';

export const landlordInvoicesPostedWorkflow = workflow(
  WORKFLOW.LANDLORD_INVOICES_POSTED,
  async ({ step, payload }) => {
    await step.inApp('inbox', () => ({
      subject: 'Invoices Posted Successfully',
      body: `${payload.postedInvoicesCount} invoice${payload.postedInvoicesCount > 1 ? 's' : ''} totaling ${payload.totalAmount} ${payload.postedInvoicesCount > 1 ? 'have' : 'has'} been posted to your tenants.`,
      primaryAction: {
        label: 'View Invoices',
        redirect: {
          target: '_self',
          url: '/invoices',
        },
      },
    }));

    await step.email('email', () => ({
      subject: 'Invoices Posted - LeaseUp',
      body: `Dear ${payload.landlordName},

Your invoices have been successfully posted to your tenants!

Invoice Summary:
- Number of invoices: ${payload.postedInvoicesCount}
- Total amount: ${payload.totalAmount}
- Date posted: ${payload.invoiceDate}

Your tenants have been notified and can now view and pay their invoices through the LeaseUp platform.

You can track the status of these invoices and view payment updates in your dashboard.

Best regards,
LeaseUp Team`,
    }));
  },
  {
    preferences: {},
  }
);
