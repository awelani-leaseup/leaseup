import { paystack } from './open-api/client';
import type {
  SubaccountCreateData,
  TransactionSplitData,
} from './transaction-splits.types';

export const createSubaccount = async (
  subaccountData: SubaccountCreateData
) => {
  return await paystack.POST('/subaccount', {
    body: {
      business_name: subaccountData.businessName,
      settlement_bank: subaccountData.settlementBank,
      account_number: subaccountData.accountNumber,
      percentage_charge: subaccountData.percentageCharge,
      description: subaccountData.description,
      primary_contact_email: subaccountData.primaryContactEmail,
      primary_contact_name: subaccountData.primaryContactName,
      primary_contact_phone: subaccountData.primaryContactPhone,
    },
  });
};

export const createTransactionSplit = async (
  transactionSplitData: TransactionSplitData
) => {
  return await paystack.POST('/split', {
    body: {
      name: transactionSplitData.name || 'Landlord Split',
      type: 'percentage',
      subaccounts: [
        {
          subaccount: transactionSplitData.landlordSubaccountId,
          share: '97.1',
        },
      ],
      currency: 'ZAR',
    },
  });
};
