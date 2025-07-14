import { PaymentRequestCreate } from './invoice.types';
import fetch from 'node-fetch';

export const createInvoice = async (invoice: PaymentRequestCreate) => {
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
