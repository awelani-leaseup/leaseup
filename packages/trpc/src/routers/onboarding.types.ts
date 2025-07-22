import * as v from 'valibot';

export const VOnboardingInput = v.object({
  businessName: v.string(),
  numberOfProperties: v.number(),
  numberOfUnits: v.number(),
  fullName: v.pipe(v.string(), v.nonEmpty('Full Name is required')),
  email: v.pipe(v.string(), v.nonEmpty('Email is required')),
  phone: v.pipe(v.string(), v.nonEmpty('Phone is required')),
  addressLine1: v.pipe(v.string(), v.nonEmpty('Address Line 1 is required')),
  addressLine2: v.optional(v.string()),
  city: v.pipe(v.string(), v.nonEmpty('City is required')),
  state: v.pipe(v.string(), v.nonEmpty('State is required')),
  zip: v.pipe(v.string(), v.nonEmpty('Zip is required')),
  countryCode: v.pipe(v.string(), v.nonEmpty('Country is required')),
  documentType: v.pipe(v.string(), v.nonEmpty('Document Type is required')),
  idNumber: v.pipe(v.string(), v.nonEmpty('ID Number is required')),
  bankCode: v.pipe(v.string(), v.nonEmpty('Bank Code is required')),
  accountNumber: v.pipe(v.string(), v.nonEmpty('Account Number is required')),
});

export type OnboardingInput = v.InferInput<typeof VOnboardingInput>;
