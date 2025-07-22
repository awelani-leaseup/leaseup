import { InvoiceCreateResponse, PaymentRequestCreate } from './invoice.types';
import fetch from 'node-fetch';

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecretKey) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
}

export const createInvoice = async (invoice: PaymentRequestCreate) => {
  const res = await fetch('https://api.paystack.co/paymentrequest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${paystackSecretKey}`,
    },
    body: JSON.stringify(invoice),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to create invoice: ${res.statusText} ${res.status}`
    );
  }

  return res.json() as Promise<InvoiceCreateResponse>;
};
