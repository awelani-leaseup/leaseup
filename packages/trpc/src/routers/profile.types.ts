import * as v from 'valibot';

export const VPersonalInfoInput = v.object({
  fullName: v.pipe(v.string(), v.nonEmpty('Full Name is required')),
  phone: v.pipe(v.string(), v.nonEmpty('Phone is required')),
});

export const VBusinessInfoInput = v.object({
  businessName: v.pipe(v.string(), v.nonEmpty('Business Name is required')),
  numberOfProperties: v.pipe(
    v.number(),
    v.minValue(0, 'Number of properties must be 0 or greater')
  ),
  numberOfUnits: v.pipe(
    v.number(),
    v.minValue(0, 'Number of units must be 0 or greater')
  ),
});

export const VAddressInfoInput = v.object({
  addressLine1: v.pipe(v.string(), v.nonEmpty('Address Line 1 is required')),
  addressLine2: v.optional(v.string()),
  city: v.pipe(v.string(), v.nonEmpty('City is required')),
  state: v.pipe(v.string(), v.nonEmpty('State/Province is required')),
  zip: v.pipe(v.string(), v.nonEmpty('ZIP/Postal Code is required')),
  countryCode: v.pipe(v.string(), v.nonEmpty('Country is required')),
});

export const VProfilePictureInput = v.object({
  image: v.optional(v.string()),
});

export const VChangePasswordInput = v.pipe(
  v.object({
    password: v.pipe(v.string(), v.nonEmpty('Password is required')),
    confirmPassword: v.pipe(v.string(), v.nonEmpty('Password is required')),
    currentPassword: v.pipe(v.string(), v.nonEmpty('Password is required')),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      (input) => input.password === input.confirmPassword,
      'The two passwords do not match.'
    ),
    ['currentPassword']
  )
);
