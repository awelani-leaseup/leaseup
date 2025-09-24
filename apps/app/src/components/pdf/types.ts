// Type definitions based on Prisma schema for PDF components

export interface LineItem {
  name?: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Transaction {
  id: string;
  amountPaid: number;
  createdAt: string | Date;
  description: string;
  referenceId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
}

export interface Tenant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  landlordId: string;
  landlord?: User;
}

export interface Property {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  landlord: User;
}

export interface Unit {
  id: string;
  name: string;
  property: Property;
}

export interface TenantLease {
  id: string;
  tenant: Tenant;
}

export interface Lease {
  id: string;
  unit?: Unit;
  tenantLease?: TenantLease[];
}

export interface Invoice {
  id: string;
  description: string;
  dueAmount: number;
  status:
    | "PENDING"
    | "PAID"
    | "CANCELLED"
    | "OVERDUE"
    | "PARTIALLY_PAID"
    | "DRAFT";
  createdAt: string | Date;
  dueDate?: string | Date | null;
  lineItems?: LineItem[] | null;
  transactions?: Transaction[];
  lease?: Lease;
  tenant?: Tenant;
}
