export interface SubaccountCreateData {
  businessName: string;
  settlementBank: string;
  accountNumber: string;
  percentageCharge: number;
  description?: string;
  primaryContactEmail?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
}

export interface SubaccountCreateResponse {
  status: boolean;
  message: string;
  data?: {
    subaccount_code: string;
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
    settlement_schedule: string;
    active: boolean;
    migrate: boolean;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface TransactionSplitData {
  landlordSubaccountId: string;
  name?: string;
}

export interface TransactionSplitResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    split_code: string;
    type: string;
    currency: string;
    integration: number;
    domain: string;
    active: boolean;
    bearer_type: string;
    bearer_subaccount: string | null;
    createdAt: string;
    updatedAt: string;
    subaccounts: Array<{
      subaccount: string;
      share: string;
    }>;
  };
}
