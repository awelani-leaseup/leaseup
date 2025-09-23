import * as v from 'valibot';

export const PropertyType = v.union([
  v.literal('SINGLE_UNIT'),
  v.literal('MULTI_UNIT'),
]);

const MAX_SIZE = 5 * 1024 * 1024; // 10MB

const ImageSchema = v.pipe(
  v.file('Please select an image file.'),
  v.mimeType(
    ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'],
    'Please select a JPEG, PNG, JPG, or WEBP file.'
  ),
  v.maxSize(MAX_SIZE, 'Please select a file smaller than 10 MB.')
);

export const VCreatePropertySchema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Enter a valid name'), v.trim()),
  propertyType: PropertyType,
  addressLine1: v.string(),
  addressLine2: v.string(),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
  propertyUnits: v.array(
    v.object({
      unitNumber: v.pipe(
        v.string(),
        v.minLength(1, 'Enter a valid number'),
        v.trim()
      ),
      bedrooms: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
      bathrooms: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
      sqmt: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
      marketRent: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
    })
  ),
  features: v.array(v.string()),
  amenities: v.array(v.string()),
  files: v.array(
    v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.number(),
    })
  ),
});

export const VUpdatePropertySchema = v.object({
  id: v.pipe(v.string(), v.minLength(1, 'Property ID is required')),
  name: v.pipe(v.string(), v.minLength(1, 'Enter a valid name'), v.trim()),
  propertyType: PropertyType,
  addressLine1: v.string(),
  addressLine2: v.string(),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
  propertyUnits: v.array(
    v.object({
      id: v.optional(v.string()), // For existing units
      unitNumber: v.pipe(
        v.string(),
        v.minLength(1, 'Enter a valid number'),
        v.trim()
      ),
      bedrooms: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
      bathrooms: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
      sqmt: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
      marketRent: v.pipe(v.number(), v.minValue(0, 'Enter a valid number')),
    })
  ),
  features: v.array(v.string()),
  amenities: v.array(v.string()),
  files: v.array(
    v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.number(),
    })
  ),
});
