import { CustomerCreateResponse, CustomerGetResponse } from './customer.types';

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

if (!paystackSecretKey) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
}

export const createCustomer = async (customerData: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) => {
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

  if (!res.ok) {
    throw new Error(
      `Failed to create customer: ${res.statusText} ${res.status}`
    );
  }

  return res.json() as Promise<CustomerCreateResponse>;
};

export const getCustomer = async (customerId: string) => {
  const res = await fetch(`https://api.paystack.co/customer/${customerId}`, {
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get customer: ${res.statusText} ${res.status}`);
  }

  return res.json() as Promise<CustomerGetResponse>;
};
