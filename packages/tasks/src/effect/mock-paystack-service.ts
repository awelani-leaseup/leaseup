import { Context, Effect, Layer } from 'effect';
import { nanoid } from 'nanoid';
import type { PaymentRequestCreate } from '@leaseup/payments/open-api/paystack';

// Re-use the same error class from the original service
class PaystackApiError extends Error {
  constructor(options: { message: string }) {
    super(options.message);
    this.name = 'PaystackApiError';
  }
}

// Mock data generators
const generateMockCustomerCode = () => `CUS_${nanoid(10)}`;
const generateMockSubaccountCode = () => `ACCT_${nanoid(10)}`;
const generateMockSplitCode = () => `SPL_${nanoid(10)}`;
const generateMockRequestCode = () => `PRQ_${nanoid(10)}`;

// Configuration for mock behavior
interface MockPaystackConfig {
  simulateFailures?: boolean;
  failureRate?: number; // 0-1
  delayMs?: number;
}

// Default configuration
const defaultConfig: MockPaystackConfig = {
  simulateFailures: false,
  failureRate: 0.1,
  delayMs: 100,
};

// Mock Paystack Service interface (matching the real one)
export interface MockPaystackService {
  readonly createPaymentRequest: (
    data: PaymentRequestCreate
  ) => Effect.Effect<{ data?: any }, PaystackApiError>;
  readonly createCustomer: (data: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    metadata: {
      tenant_id: string;
      source: string;
    };
  }) => Effect.Effect<
    { data?: { data?: { customer_code?: string } } },
    PaystackApiError
  >;
  readonly createSubaccount: (data: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
    description: string;
    primary_contact_email?: string;
    primary_contact_name?: string;
    primary_contact_phone?: string;
  }) => Effect.Effect<
    { data?: { data?: { subaccount_code?: string } } },
    PaystackApiError
  >;
  readonly createSplit: (data: {
    name: string;
    type: string;
    subaccounts: Array<{ subaccount: string; share: string }>;
    currency: string;
  }) => Effect.Effect<
    { data?: { data?: { split_code?: string } } },
    PaystackApiError
  >;
}

// Mock service tag
export const MockPaystackServiceTag = Context.GenericTag<MockPaystackService>(
  'MockPaystackService'
);

// Utility function to simulate network delay and potential failures
const simulateApiCall = <T>(
  operation: () => T,
  config: MockPaystackConfig = defaultConfig
): Effect.Effect<T, PaystackApiError> =>
  Effect.gen(function* () {
    // Simulate network delay
    yield* Effect.sleep(config.delayMs ?? 100);

    // Simulate random failures if enabled
    if (config.simulateFailures) {
      const random = Math.random();
      if (random < (config.failureRate ?? 0.1)) {
        yield* Effect.fail(
          new PaystackApiError({
            message: 'Simulated Paystack API error',
          })
        );
      }
    }

    return operation();
  });

// Mock implementation
export const createMockPaystackService = (
  config: MockPaystackConfig = defaultConfig
): MockPaystackService => ({
  createPaymentRequest: (requestData) =>
    simulateApiCall(() => {
      console.log('Mock: Creating payment request', {
        customer: requestData.customer,
        amount: requestData.amount,
        currency: requestData.currency,
        description: requestData.description,
      });

      const requestCode = generateMockRequestCode();

      return {
        data: {
          status: true,
          message: 'Payment request created successfully',
          data: {
            id: Math.floor(Math.random() * 1000000),
            domain: 'test',
            amount: requestData.amount,
            currency: requestData.currency || 'ZAR',
            due_date: requestData.due_date,
            has_invoice: true,
            invoice_number: Math.floor(Math.random() * 10000),
            description: requestData.description,
            pdf_url: null,
            line_items: requestData.line_items || [],
            tax: requestData.tax || [],
            request_code: requestCode,
            status: 'pending',
            paid: false,
            paid_at: null,
            metadata: null,
            notifications: [],
            offline_reference: nanoid(),
            customer: {
              id: Math.floor(Math.random() * 1000000),
              first_name: 'Mock',
              last_name: 'Customer',
              email: requestData.customer,
              customer_code: generateMockCustomerCode(),
              phone: null,
              metadata: null,
              risk_action: 'default',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      };
    }, config),

  createCustomer: (customerData) =>
    simulateApiCall(() => {
      console.log('Mock: Creating Paystack customer', {
        email: customerData.email,
        first_name: customerData.first_name,
        last_name: customerData.last_name,
      });

      const customerCode = generateMockCustomerCode();

      return {
        data: {
          status: true,
          message: 'Customer created successfully',
          data: {
            email: customerData.email,
            integration: Math.floor(Math.random() * 1000000),
            domain: 'test',
            customer_code: customerCode,
            id: Math.floor(Math.random() * 1000000),
            identified: false,
            identifications: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone: customerData.phone,
            metadata: customerData.metadata,
            risk_action: 'default',
          },
        },
      };
    }, config),

  createSubaccount: (subaccountData) =>
    simulateApiCall(() => {
      console.log('Mock: Creating Paystack subaccount', {
        business_name: subaccountData.business_name,
        settlement_bank: subaccountData.settlement_bank,
        account_number: subaccountData.account_number,
      });

      const subaccountCode = generateMockSubaccountCode();

      return {
        data: {
          status: true,
          message: 'Subaccount created successfully',
          data: {
            integration: Math.floor(Math.random() * 1000000),
            domain: 'test',
            subaccount_code: subaccountCode,
            business_name: subaccountData.business_name,
            description: subaccountData.description,
            primary_contact_name: subaccountData.primary_contact_name,
            primary_contact_email: subaccountData.primary_contact_email,
            primary_contact_phone: subaccountData.primary_contact_phone,
            metadata: null,
            percentage_charge: subaccountData.percentage_charge,
            settlement_bank: subaccountData.settlement_bank,
            account_number: subaccountData.account_number,
            settlement_schedule: 'auto',
            active: true,
            migrate: false,
            id: Math.floor(Math.random() * 1000000),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            product_limitation: null,
          },
        },
      };
    }, config),

  createSplit: (splitData) =>
    simulateApiCall(() => {
      console.log('Mock: Creating Paystack split group', {
        name: splitData.name,
        type: splitData.type,
        currency: splitData.currency,
      });

      const splitCode = generateMockSplitCode();

      return {
        data: {
          status: true,
          message: 'Split created successfully',
          data: {
            id: Math.floor(Math.random() * 1000000),
            name: splitData.name,
            type: splitData.type,
            currency: splitData.currency,
            integration: Math.floor(Math.random() * 1000000),
            domain: 'test',
            split_code: splitCode,
            active: true,
            bearer_type: 'subaccount',
            bearer_subaccount: splitData.subaccounts[0]?.subaccount || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subaccounts: splitData.subaccounts.map((sub, index) => ({
              subaccount: {
                id: Math.floor(Math.random() * 1000000),
                subaccount_code: sub.subaccount,
                business_name: `Mock Business ${index + 1}`,
                description: `Mock subaccount ${index + 1}`,
                primary_contact_name: null,
                primary_contact_email: null,
                primary_contact_phone: null,
                metadata: null,
                percentage_charge: parseFloat(sub.share),
                settlement_bank: 'mock-bank',
                account_number: '1234567890',
              },
              share: parseFloat(sub.share),
            })),
            total_subaccounts: splitData.subaccounts.length,
          },
        },
      };
    }, config),
});

// Layer for dependency injection
export const MockPaystackServiceLive = (config?: MockPaystackConfig) =>
  Layer.succeed(MockPaystackServiceTag, createMockPaystackService(config));

// Default layer with standard configuration
export const MockPaystackServiceDefaultLive = MockPaystackServiceLive();

// Layer with failure simulation enabled for testing
export const MockPaystackServiceWithFailuresLive = MockPaystackServiceLive({
  simulateFailures: true,
  failureRate: 0.2,
  delayMs: 200,
});

// Utility to create a fast mock (no delays) for unit tests
export const MockPaystackServiceFastLive = MockPaystackServiceLive({
  simulateFailures: false,
  delayMs: 0,
});
