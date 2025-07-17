import { workflow } from '@novu/framework';
import { WORKFLOW } from './workflows';

export const welcomeWorkflow = workflow(
  WORKFLOW.WELCOME_LANDLORD,
  async ({ step }) => {
    await step.inApp('inbox', () => ({
      subject: 'Welcome to LeaseUp',
      body: 'Create your first property to start collecting rent.',
      primaryAction: {
        label: 'Add Property',
        redirect: {
          target: '_self',
          url: '/properties/create',
        },
      },
    }));
  },
  {
    preferences: {},
  }
);
