import { PaymentRequestCreate } from './invoice.types';
import fetch from 'node-fetch';

export const createInvoice = async (invoice: PaymentRequestCreate) => {
  const paystackSecretKey =
    process.env.PAYSTACK_SECRET_KEY ||
    'sk_test_5ef59214386204ce14f664f98322ce7b93b590ce';

  if (!paystackSecretKey) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
  }

  const res = await fetch('https://api.paystack.co/paymentrequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer sk_test_5ef59214386204ce14f664f98322ce7b93b590ce`,
    },
    body: JSON.stringify(invoice),
  });

  return res.json();
};

export const createCustomer = async (customerData: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
  const paystackSecretKey =
    process.env.PAYSTACK_SECRET_KEY ||
    'sk_test_5ef59214386204ce14f664f98322ce7b93b590ce';

  if (!paystackSecretKey) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
  }

  const res = await fetch('https://api.paystack.co/customer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${paystackSecretKey}`,
    },
    body: JSON.stringify({
      email: customerData.email,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      phone: customerData.phone,
    }),
  });

  return res.json();
};
