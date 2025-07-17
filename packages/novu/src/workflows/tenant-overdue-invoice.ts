import { workflow } from '@novu/framework';
import { WORKFLOW } from './workflows';

export const overdueInvoicesWorkflow = workflow(
  WORKFLOW.LANDLORD_INVOICES_STATUS,
  async ({ step }) => {
    await step.email('email', () => ({
      subject: 'Your LeaseUp Invoice is Overdue',
      body: 'Your LeaseUp invoice is overdue. Please pay it as soon as possible.',
    }));
  }
);
