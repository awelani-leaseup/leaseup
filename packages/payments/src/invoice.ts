import { PaymentRequestCreate } from './invoice.types';
import fetch from 'node-fetch';

export const createInvoice = async (invoice: PaymentRequestCreate) => {
  const res = await fetch('https://api.paystack.co/paymentrequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify(invoice),
  });

  return res.json();
};
