import * as v from 'valibot';

export const VTenantSchema = v.object({
  avatarUrl: v.nullable(v.string()),
  firstName: v.pipe(v.string(), v.minLength(1, 'First name is required')),
  lastName: v.pipe(v.string(), v.minLength(1, 'Last name is required')),
  dateOfBirth: v.pipe(v.date('Date of birth is required')),
  primaryEmail: v.pipe(v.string(), v.email('Invalid Email')),
  primaryPhoneNumber: v.pipe(
    v.string(),
    v.minLength(1, 'Phone number is required')
  ),
  additionalEmails: v.array(v.pipe(v.string(), v.email('Invalid Email'))),
  additionalPhones: v.array(
    v.pipe(v.string(), v.minLength(1, 'Phone Number is required'))
  ),
  emergencyContacts: v.array(
    v.object({
      fullName: v.pipe(v.string(), v.minLength(1, 'Full Name is required')),
      email: v.pipe(v.string(), v.email('Invalid Email')),
      phoneNumber: v.pipe(
        v.string(),
        v.minLength(1, 'Phone number is required')
      ),
      relationship: v.string(),
    })
  ),
  vehicles: v.array(
    v.object({
      make: v.pipe(v.string(), v.minLength(1, 'Make is required'), v.trim()),
      model: v.string(),
      year: v.string(),
      color: v.string(),
      licensePlate: v.string(),
    })
  ),
  files: v.nullable(
    v.array(
      v.object({
        id: v.optional(v.string()),
        url: v.string(),
        name: v.string(),
        type: v.string(),
        size: v.number(),
      })
    )
  ),
});

export const VRemoveTenantSchema = v.object({
  id: v.string(),
});

export const VGetTenantByIdSchema = v.object({
  id: v.string(),
});

export const VGetTenantTransactionsSchema = v.object({
  id: v.string(),
});

export const VDeleteTenantFileSchema = v.object({
  id: v.string(),
});

export const VAddTenantFilesSchema = v.object({
  tenantId: v.string(),
  files: v.array(
    v.object({
      url: v.string(),
      name: v.string(),
      type: v.string(),
      size: v.number(),
    })
  ),
});

export const VUpdateTenantSchema = v.object({
  id: v.string(),
  avatarUrl: v.nullable(v.string()),
  firstName: v.pipe(v.string(), v.minLength(1, 'First name is required')),
  lastName: v.pipe(v.string(), v.minLength(1, 'Last name is required')),
  dateOfBirth: v.pipe(v.date('Date of birth is required')),
  primaryEmail: v.pipe(v.string(), v.email('Invalid Email')),
  primaryPhoneNumber: v.pipe(
    v.string(),
    v.minLength(1, 'Phone number is required')
  ),
  additionalEmails: v.array(v.pipe(v.string(), v.email('Invalid Email'))),
  additionalPhones: v.array(
    v.pipe(v.string(), v.minLength(1, 'Phone Number is required'))
  ),
  emergencyContacts: v.array(
    v.object({
      fullName: v.pipe(v.string(), v.minLength(1, 'Full Name is required')),
      email: v.pipe(v.string(), v.email('Invalid Email')),
      phoneNumber: v.pipe(
        v.string(),
        v.minLength(1, 'Phone number is required')
      ),
      relationship: v.string(),
    })
  ),
  vehicles: v.array(
    v.object({
      make: v.pipe(v.string(), v.minLength(1, 'Make is required'), v.trim()),
      model: v.string(),
      year: v.string(),
      color: v.string(),
      licensePlate: v.string(),
    })
  ),
});

export const VGetAllTenantsSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
  search: v.optional(v.string()),
  propertyId: v.optional(v.string()),
  status: v.optional(
    v.union([
      v.literal('active'),
      v.literal('inactive'),
      v.literal('no_lease'),
      v.literal('all'),
    ])
  ),
  sortBy: v.optional(
    v.union([
      v.literal('firstName'),
      v.literal('lastName'),
      v.literal('email'),
      v.literal('createdAt'),
      v.literal('updatedAt'),
    ]),
    'createdAt'
  ),
  sortOrder: v.optional(v.union([v.literal('asc'), v.literal('desc')]), 'desc'),
});
