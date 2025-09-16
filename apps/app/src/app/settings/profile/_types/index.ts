import * as v from "valibot";

export const VPersonalInfoSchema = v.object({
  fullName: v.pipe(v.string(), v.nonEmpty("Full Name is required")),
  email: v.pipe(v.string(), v.email("Invalid email format")),
  phone: v.pipe(v.string(), v.nonEmpty("Phone is required")),
});

export const VBusinessInfoSchema = v.object({
  businessName: v.pipe(v.string(), v.nonEmpty("Business Name is required")),
  numberOfProperties: v.pipe(
    v.number(),
    v.minValue(0, "Number of properties must be 0 or greater"),
  ),
  numberOfUnits: v.pipe(
    v.number(),
    v.minValue(0, "Number of units must be 0 or greater"),
  ),
});

export const VAddressInfoSchema = v.object({
  addressLine1: v.pipe(v.string(), v.nonEmpty("Address Line 1 is required")),
  addressLine2: v.optional(v.string()),
  city: v.pipe(v.string(), v.nonEmpty("City is required")),
  state: v.pipe(v.string(), v.nonEmpty("State/Province is required")),
  zip: v.pipe(v.string(), v.nonEmpty("ZIP/Postal Code is required")),
  countryCode: v.pipe(v.string(), v.nonEmpty("Country is required")),
});

export const VProfilePictureSchema = v.object({
  image: v.optional(v.string()),
});

export type PersonalInfoData = v.InferInput<typeof VPersonalInfoSchema>;
export type BusinessInfoData = v.InferInput<typeof VBusinessInfoSchema>;
export type AddressInfoData = v.InferInput<typeof VAddressInfoSchema>;
export type ProfilePictureData = v.InferInput<typeof VProfilePictureSchema>;
