export type CustomerCreateResponse = {
  status: boolean;
  message: string;
  data: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: number;
    identified: boolean;
    identifications: null;
    createdAt: string;
    updatedAt: string;
  };
};

export type CustomerGetResponse = {
  status: boolean;
  message: string;
  data: {
    transactions: [];
    subscriptions: [];
    authorizations: [
      {
        authorization_code: string;
        bin: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        channel: string;
        card_type: string;
        bank: string;
        country_code: string;
        brand: string;
        reusable: boolean;
        signature: string;
        account_name: string;
      },
    ];
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    metadata: any;
    domain: string;
    customer_code: string;
    risk_action: string;
    id: number;
    integration: number;
    createdAt: string;
    updatedAt: string;
    created_at: string;
    updated_at: string;
    total_transactions: number;
    total_transaction_value: number[];
    dedicated_account: null;
    identified: boolean;
    identifications: null;
  };
};
