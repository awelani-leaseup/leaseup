import * as v from "valibot";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const FileSchema = v.pipe(
  v.file(),
  v.mimeType(
    ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"],
    "Please select a PDF file.",
  ),
  v.maxSize(MAX_SIZE, "Please select a file smaller than 5 MB."),
);

export const VPropertySchema = v.object({
  propertyName: v.pipe(v.string(), v.minLength(1, "Property name is required")),
  propertyType: v.pipe(v.string(), v.minLength(1, "Property type is required")),
  fullAddressId: v.string(),
  propertyUnits: v.array(
    v.object({
      unitNumber: v.pipe(v.string(), v.minLength(1, "Unit number is required")),
      bedrooms: v.pipe(
        v.number(),
        v.minValue(0, "Please enter a valid number"),
      ),
      bathrooms: v.pipe(
        v.number(),
        v.minValue(0, "Please enter a valid number"),
      ),
      sqmt: v.pipe(v.number(), v.minValue(0, "Please enter a valid number")),
      rent: v.pipe(v.number(), v.minValue(0, "Please enter a valid number")),
      deposit: v.pipe(v.number(), v.minValue(0, "Please enter a valid number")),
    }),
  ),
  addressLine1: v.pipe(
    v.string(),
    v.minLength(1, "Address line 1 is required"),
  ),
  addressLine2: v.pipe(v.string()),
  city: v.pipe(v.string(), v.minLength(1, "City is required")),
  state: v.pipe(v.string(), v.minLength(1, "State is required")),
  zip: v.pipe(v.string(), v.minLength(1, "Zip code is required")),
  countryCode: v.pipe(v.string(), v.minLength(1, "Country code is required")),
  propertyFeatures: v.array(v.string()),
  propertyAmenities: v.array(v.string()),
  bedrooms: v.pipe(
    v.number("Bedrooms required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  bathrooms: v.pipe(
    v.number("Bathrooms required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  sqmt: v.pipe(
    v.number("Square meters required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  marketRent: v.pipe(
    v.number("Market rent required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  deposit: v.pipe(
    v.number("Deposit required"),
    v.minValue(0, "Please enter a valid number"),
  ),
  files: v.nullable(v.array(FileSchema)),
});
