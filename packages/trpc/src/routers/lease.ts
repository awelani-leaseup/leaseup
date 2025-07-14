import { VCreateLeaseSchema } from './lease.types';
import { createTRPCRouter, protectedProcedure } from '../server/trpc';
import { nanoid } from 'nanoid';
import { startOfDay } from 'date-fns';

const leaseSelect = {
  id: true,
  name: true,
  unit: true,
  propertyType: true,
};
export const leaseRouter = createTRPCRouter({
  getAllProperties: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.property.findMany({
      where: {
        ownerId: ctx.auth.userId ?? '',
      },
      select: {
        id: true,
        name: true,
        unit: true,
        propertyType: true,
      },
    });
  }),
  getAllTenants: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tenant.findMany({
      where: {
        landlordId: ctx.auth.userId ?? '',
      },
    });
  }),
  createLease: protectedProcedure
    .input(VCreateLeaseSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.lease.create({
        data: {
          id: nanoid(),
          unitId: input.unitId,
          // Ensure startDate and endDate are set in Africa/Johannesburg timezone
          startDate: startOfDay(
            new Date(input.leaseStartDate).toLocaleString('en-US', {
              timeZone: 'Africa/Johannesburg',
            })
          ),
          endDate: input.leaseEndDate
            ? startOfDay(
                new Date(input.leaseEndDate).toLocaleString('en-US', {
                  timeZone: 'Africa/Johannesburg',
                })
              )
            : null,
          deposit: input.deposit,
          rent: input.rent,
          status: 'ACTIVE',
          rentDueCurrency: 'ZAR',
          leaseType: 'MONTHLY',
          invoiceCycle: 'MONTHLY',
          automaticInvoice: input.automaticInvoice,
          tenantLease: {
            create: {
              tenantId: input.tenantId,
            },
          },
        },
      });
    }),
});
