import { faker } from '@faker-js/faker';
import { db } from './src/db.ts';
import { auth } from './seed/auth.ts';
import {
  InvoiceCategory,
  InvoiceStatus,
  InvoiceCycle,
  LeaseTermType,
  PropertyAmenity,
  PropertyFeature,
  PropertyType,
  TenantIncomeType,
  LeaseStatus,
} from './generated/client/client.js';

function generateSouthAfricanIntlNumber() {
  const prefixes = [
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '71',
    '72',
    '73',
    '74',
    '76',
    '78',
    '79',
    '81',
    '82',
    '83',
    '84',
  ];
  const prefix = faker.helpers.arrayElement(prefixes);

  const lineNumber = faker.string.numeric(7);

  return `+27${prefix}${lineNumber}`;
}

const PASSWORD = '123456789';

async function main() {
  console.log('🌱 Starting database seed...');

  // Delete in correct order respecting foreign key constraints
  await db.$executeRawUnsafe(`DELETE FROM "transaction";`);
  await db.$executeRawUnsafe(`DELETE FROM "invoice";`);
  await db.$executeRawUnsafe(`DELETE FROM "recurring_billable";`);
  await db.$executeRawUnsafe(`DELETE FROM "maintenance_request";`);
  await db.$executeRawUnsafe(`DELETE FROM "file";`);
  await db.$executeRawUnsafe(`DELETE FROM "tenant_lease";`);
  await db.$executeRawUnsafe(`DELETE FROM "lease";`);
  await db.$executeRawUnsafe(`DELETE FROM "unit";`);
  await db.$executeRawUnsafe(`DELETE FROM "tenant";`);
  await db.$executeRawUnsafe(`DELETE FROM "property";`);
  await db.$executeRawUnsafe(`DELETE FROM "account";`);
  await db.$executeRawUnsafe(`DELETE FROM "session";`);
  await db.$executeRawUnsafe(`DELETE FROM "user";`);

  const USER_COUNT = faker.number.int({ min: 10, max: 20 });

  const userPromises: Promise<
    Awaited<ReturnType<typeof auth.api.signUpEmail>>
  >[] = new Array(USER_COUNT).fill(null).map(() => {
    return auth.api.signUpEmail({
      body: {
        email: faker.internet.email(),
        password: PASSWORD,
        name: faker.person.fullName(),
      },
    });
  });

  console.log(`📝 Creating ${USER_COUNT} users with accounts...`);

  const users = await Promise.all(userPromises);

  users.forEach(async (user) => {
    await db.user.update({
      where: {
        id: user.user.id,
      },
      data: {
        name: user.user.name,
        image: faker.image.avatar(),
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        countryCode: 'ZA',
      },
    });
  });

  console.log(`✅ Successfully created ${USER_COUNT} users with accounts!`);

  console.log('🏘️ Creating properties...');

  const propertyPromises: Promise<
    Awaited<ReturnType<typeof db.property.createManyAndReturn>>
  >[] = users.map(async (user) => {
    return db.property.createManyAndReturn({
      data: Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => ({
          landlordId: user.user.id,
          name: faker.company.name(),
          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.location.secondaryAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zip: faker.location.zipCode(),
          countryCode: 'ZA',
          propertyType: faker.helpers.arrayElement(Object.values(PropertyType)),
          amenities: faker.helpers.arrayElements(
            Object.values(PropertyAmenity)
          ) as unknown as string[],
          features: faker.helpers.arrayElements(
            Object.values(PropertyFeature)
          ) as unknown as string[],
        })
      ),
    });
  });

  const properties = await Promise.all(propertyPromises);

  const allProperties = properties.flatMap((property) => property);

  const unitPromises: Promise<
    Awaited<ReturnType<typeof db.unit.createManyAndReturn>>
  >[] = allProperties.map(async (property) => {
    return db.unit.createManyAndReturn({
      data: Array.from(
        {
          length: faker.number.int({
            min: 1,
            max: property.propertyType === PropertyType.MULTI_UNIT ? 20 : 1,
          }),
        },
        () => ({
          propertyId: property.id,
          name: faker.number.int({ min: 1, max: 1000 }).toString(),
          bedrooms: faker.number.int({ min: 0.5, max: 5 }),
          bathrooms: faker.number.int({ min: 0.5, max: 5 }),
          deposit: faker.number.int({ min: 1000, max: 10000 }),
          marketRent: faker.number.int({ min: 1000, max: 10000 }),
          sqmt: faker.number.int({ min: 100, max: 1000 }),
        })
      ),
    });
  });

  const units = await Promise.all(unitPromises);

  const allUnits = units.flatMap((unit) => unit);

  console.log('✅ Successfully created properties!');

  console.log('Create Tenants for properties...');

  const tenantPromises: Promise<
    Awaited<ReturnType<typeof db.tenant.createManyAndReturn>>
  >[] = users.map(async (user) => {
    return db.tenant.createManyAndReturn({
      data: Array.from(
        { length: faker.number.int({ min: 10, max: 50 }) },
        () => ({
          email: faker.internet.email(),
          avatarUrl: faker.image.avatar(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          phone: generateSouthAfricanIntlNumber(),
          landlordId: user.user.id,
          paystackCustomerId: 'CUS_8jb0ozhu6wpknbk',
          dateOfBirth: faker.date.birthdate(),
          tenantEmergencyContact: {
            name: faker.person.fullName(),
            phone: generateSouthAfricanIntlNumber(),
          },
          tenantIncome: {
            income: faker.number.int({ min: 1000, max: 10000 }),
            incomeType: faker.helpers.arrayElement(
              Object.values(TenantIncomeType)
            ),
          },
          additionalEmails: [faker.internet.email()],
          additionalPhones: [generateSouthAfricanIntlNumber()],
          emergencyContacts: {
            name: faker.person.fullName(),
            phone: generateSouthAfricanIntlNumber(),
          },
          vehicles: {
            make: faker.vehicle.manufacturer(),
            model: faker.vehicle.model(),
            year: faker.date.birthdate(),
            color: faker.color.rgb(),
            licensePlate: faker.vehicle.vrm(),
          },
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        })
      ),
    });
  });

  const tenants = await Promise.all(tenantPromises);

  console.log('✅ Successfully created tenants for properties!');

  console.log('Creating leases for tenants...');

  const allTenants = tenants.flatMap((tenant) => tenant);

  // Create leases per landlord with limits: max 1 lease per tenant, max 20 per landlord
  const leasePromises: Promise<
    Awaited<ReturnType<typeof db.lease.createManyAndReturn>>
  >[] = users.map(async (user) => {
    const landlordTenants = allTenants.filter(
      (tenant) => tenant.landlordId === user.user.id
    );

    const landlordProperties = allProperties
      .filter((property) => property.landlordId === user.user.id)
      .map((property) => property.id);

    const landlordUnits = allUnits
      .filter((unit) => landlordProperties.includes(unit.propertyId))
      .map((unit) => unit.id);

    // Limit to max 20 leases per landlord and max 1 lease per tenant
    const maxLeases = Math.min(
      20,
      landlordTenants.length,
      landlordUnits.length
    );
    const selectedTenants = faker.helpers.arrayElements(
      landlordTenants,
      maxLeases
    );

    return db.lease.createManyAndReturn({
      data: selectedTenants.map(() => {
        const leaseTermType = faker.helpers.arrayElement(
          Object.values(LeaseTermType)
        );

        return {
          unitId: faker.helpers.arrayElement(landlordUnits),
          startDate: faker.helpers.arrayElement([
            faker.date.past(),
            faker.date.future(),
          ]),
          endDate:
            leaseTermType === LeaseTermType.MONTHLY
              ? faker.date.future()
              : undefined,
          rent: faker.number.int({ min: 1000, max: 10000 }),
          deposit: faker.number.int({ min: 1000, max: 10000 }),
          status: LeaseStatus.ACTIVE,
          rentDueCurrency: 'ZAR',
          leaseType: leaseTermType,
          invoiceCycle: InvoiceCycle.MONTHLY,
          automaticInvoice: true,
        };
      }),
    });
  });

  const leases = await Promise.all(leasePromises);

  const allLeases = leases.flatMap((lease) => lease);

  // Create tenant-lease associations ensuring each lease gets one tenant
  const tenantLeasePromises: {
    leaseId: string;
    tenantId: string;
  }[] = [];

  users.forEach((user, userIndex) => {
    const landlordTenants = allTenants.filter(
      (tenant) => tenant.landlordId === user.user.id
    );
    const landlordLeases = leases[userIndex] || [];

    // Match each lease with a unique tenant (one-to-one mapping)
    const shuffledTenants = faker.helpers.shuffle([...landlordTenants]);

    landlordLeases.forEach((lease, leaseIndex) => {
      if (shuffledTenants[leaseIndex]) {
        tenantLeasePromises.push({
          leaseId: lease.id,
          tenantId: shuffledTenants[leaseIndex].id,
        });
      }
    });
  });

  await db.tenantLease.createManyAndReturn({
    data: tenantLeasePromises,
  });

  console.log('✅ Successfully created leases for tenants!');

  console.log('💰 Creating invoices for active leases...');

  // Get current date for calculations
  const now = new Date();

  // Get leases with their associated tenants
  const leasesWithTenants = await db.lease.findMany({
    where: {
      id: { in: allLeases.map((lease) => lease.id) },
    },
    include: {
      tenantLease: {
        include: {
          tenant: true,
        },
      },
    },
  });

  console.log(
    '🔄 Creating recurring billables for leases with automatic billing...'
  );

  // Create recurring billables for all leases with automaticInvoice: true
  const recurringBillablePromises: Promise<any>[] = [];

  leasesWithTenants.forEach((lease) => {
    if (lease.automaticInvoice && lease.tenantLease.length > 0) {
      const tenant = lease.tenantLease[0].tenant;

      // Create a recurring billable for rent payments
      const recurringBillablePromise = db.recurringBillable.create({
        data: {
          startDate: lease.startDate,
          endDate: lease.endDate,
          description: `Monthly rent for lease ${lease.id}`,
          amount: lease.rent,
          category: InvoiceCategory.RENT,
          cycle: InvoiceCycle.MONTHLY,
          nextInvoiceAt: new Date(
            lease.startDate.getTime() + 30 * 24 * 60 * 60 * 1000
          ), // Next month
          isActive: lease.status === LeaseStatus.ACTIVE,
          leaseId: lease.id,
          tenantId: tenant.id,
        },
      });

      recurringBillablePromises.push(recurringBillablePromise);
    }
  });

  const recurringBillables = await Promise.all(recurringBillablePromises);

  console.log(
    `✅ Successfully created ${recurringBillables.length} recurring billables for automatic billing!`
  );

  // Create invoices for leases that have been active for at least 1 month
  const invoicePromises: Promise<any>[] = [];

  for (const lease of leasesWithTenants) {
    const leaseStartDate = new Date(lease.startDate);
    const monthsSinceStart = Math.floor(
      (now.getTime() - leaseStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Only create invoices for leases that have been active for at least 1 month and have a tenant
    if (
      monthsSinceStart >= 1 &&
      lease.status === 'ACTIVE' &&
      lease.tenantLease.length > 0
    ) {
      const tenant = lease.tenantLease[0].tenant;

      // Validate that we have a valid landlord ID
      if (!tenant.landlordId) {
        console.error(
          `Skipping invoice creation for lease ${lease.id}: tenant ${tenant.id} has no landlordId`
        );
        return;
      }

      // Verify that the landlord exists in the database
      const landlordExists = await db.user.findUnique({
        where: { id: tenant.landlordId },
        select: { id: true },
      });

      if (!landlordExists) {
        console.error(
          `Skipping invoice creation for lease ${lease.id}: landlord ${tenant.landlordId} does not exist`
        );
        return;
      }

      // Find the corresponding recurring billable for this lease (if it has automatic billing)
      const correspondingRecurringBillable = recurringBillables.find(
        (rb) => rb.leaseId === lease.id
      );

      // Generate monthly invoices from start date to current date
      for (let monthOffset = 0; monthOffset < monthsSinceStart; monthOffset++) {
        const invoiceDate = new Date(leaseStartDate);
        invoiceDate.setMonth(invoiceDate.getMonth() + monthOffset);

        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 5); // Due 5 days after invoice date

        // Determine invoice status based on due date
        let status: InvoiceStatus;

        if (dueDate < now) {
          // Past due invoices - distribute across different statuses
          const randomValue = faker.number.float({ min: 0, max: 1 });
          if (randomValue < 0.6) {
            status = InvoiceStatus.PAID; // 60% chance of being paid
          } else if (randomValue < 0.8) {
            status = InvoiceStatus.OVERDUE; // 20% chance of being overdue
          } else {
            status = InvoiceStatus.PENDING; // 20% chance of still being pending
          }
        } else {
          // Future invoices are pending
          status = InvoiceStatus.PENDING;
        }

        const invoiceData: any = {
          dueAmount: lease.rent * 100, // Convert to cents
          dueDate: dueDate,
          status: status,
          createdAt: invoiceDate,
          tenant: {
            connect: { id: tenant.id },
          },
          lease: {
            connect: { id: lease.id },
          },
          landlord: {
            connect: { id: tenant.landlordId },
          },
          updatedAt: invoiceDate,
          description: `Monthly rent for ${invoiceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          paystackId: faker.string.uuid(),
          category: InvoiceCategory.RENT,
        };

        // If this lease has automatic billing, link the invoice to the recurring billable
        if (correspondingRecurringBillable) {
          invoiceData.recurringBillable = {
            connect: { id: correspondingRecurringBillable.id },
          };
        }

        const invoicePromise = db.invoice.create({
          data: {
            ...invoiceData,
            paymentRequestUrl: faker.internet.url(),
            lineItems: [
              {
                description: 'Rent',
                amount: lease.rent * 100, // Convert to cents
                quantity: 1,
                rate: lease.rent,
              },
            ],
          },
        });

        invoicePromises.push(invoicePromise);
      }
    }
  }

  await Promise.all(invoicePromises);

  console.log(
    `✅ Successfully created ${invoicePromises.length} invoices for active leases!`
  );

  console.log('💳 Creating transactions for paid invoices...');

  // Get all paid invoices
  const paidInvoices = await db.invoice.findMany({
    where: {
      status: InvoiceStatus.PAID,
    },
    include: {
      lease: true,
    },
  });

  const transactionPromises: Promise<any>[] = [];

  paidInvoices.forEach((invoice) => {
    // Create a transaction for each paid invoice
    const transactionPromise = db.transactions.create({
      data: {
        leaseId: invoice.leaseId ?? undefined,
        invoiceId: invoice.id,
        description: `Payment for ${invoice.description}`,
        amountPaid: invoice.dueAmount / 100,
        referenceId: `TXN-${faker.string.alphanumeric(10).toUpperCase()}`,
        createdAt: faker.date.between({
          from: invoice.dueDate || invoice.createdAt,
          to: now,
        }),
        updatedAt: faker.date.recent(),
      },
    });

    transactionPromises.push(transactionPromise);
  });

  await Promise.all(transactionPromises);

  console.log(
    `✅ Successfully created ${transactionPromises.length} transactions for paid invoices!`
  );
}

main()
  .then(async () => {
    console.log('🎉 Database seeding completed successfully!');
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await db.$disconnect();
    if (typeof globalThis.process !== 'undefined') {
      globalThis.process.exit(1);
    } else {
      throw e;
    }
  });
