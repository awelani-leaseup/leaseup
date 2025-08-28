import { createTRPCRouter, protectedProcedure } from '../server/trpc';

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const landlordId = ctx.auth?.session?.userId ?? '';

    // Get all stats in parallel for better performance
    const [
      propertiesCount,
      tenantsCount,
      totalRevenue,
      pendingIssuesCount,
      recentActivity,
      upcomingPayments,
      upcomingRenewals,
    ] = await Promise.all([
      // Properties count
      ctx.db.property.count({
        where: {
          landlordId,
          propertyStatus: 'ACTIVE',
        },
      }),

      // Tenants count
      ctx.db.tenant.count({
        where: {
          landlordId,
        },
      }),

      // Total revenue from all transactions
      ctx.db.transactions.aggregate({
        where: {
          OR: [
            // Transactions through leases
            {
              lease: {
                unit: {
                  property: {
                    landlordId,
                  },
                },
              },
            },
            // Transactions through invoices without leases
            {
              invoice: {
                AND: [
                  { leaseId: null },
                  {
                    tenant: {
                      landlordId,
                    },
                  },
                ],
              },
            },
          ],
        },
        _sum: {
          amountPaid: true,
        },
      }),

      // Pending maintenance requests count
      ctx.db.maintenanceRequest.count({
        where: {
          status: 'PENDING',
          lease: {
            unit: {
              property: {
                landlordId,
              },
            },
          },
        },
      }),

      // Recent activity (last 10 transactions)
      ctx.db.transactions.findMany({
        where: {
          OR: [
            // Transactions through leases
            {
              lease: {
                unit: {
                  property: {
                    landlordId,
                  },
                },
              },
            },
            // Transactions through invoices without leases
            {
              invoice: {
                AND: [
                  { leaseId: null },
                  {
                    tenant: {
                      landlordId,
                    },
                  },
                ],
              },
            },
          ],
        },
        include: {
          invoice: {
            include: {
              tenant: true,
            },
          },
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
              tenantLease: {
                include: {
                  tenant: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),

      // Upcoming payments (pending invoices)
      ctx.db.invoice.findMany({
        where: {
          status: 'PENDING',
          OR: [
            // Invoices with leases
            {
              lease: {
                unit: {
                  property: {
                    landlordId,
                  },
                },
              },
            },
            // Invoices without leases but with tenants belonging to landlord
            {
              AND: [
                { leaseId: null },
                {
                  tenant: {
                    landlordId,
                  },
                },
              ],
            },
          ],
        },
        include: {
          tenant: true,
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
              tenantLease: {
                include: {
                  tenant: true,
                },
              },
            },
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: 5,
      }),

      // Upcoming lease renewals (leases ending in next 60 days)
      ctx.db.lease.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          },
          unit: {
            property: {
              landlordId,
            },
          },
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          tenantLease: {
            include: {
              tenant: true,
            },
          },
        },
        orderBy: {
          endDate: 'asc',
        },
        take: 5,
      }),
    ]);

    return {
      stats: {
        properties: propertiesCount,
        tenants: tenantsCount,
        revenue: totalRevenue._sum.amountPaid || 0,
        pendingIssues: pendingIssuesCount,
      },
      recentActivity,
      upcomingPayments,
      upcomingRenewals,
    };
  }),

  getMaintenanceRequests: protectedProcedure.query(async ({ ctx }) => {
    const landlordId = ctx.auth?.session?.userId ?? '';

    return ctx.db.maintenanceRequest.findMany({
      where: {
        lease: {
          unit: {
            property: {
              landlordId,
            },
          },
        },
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenantLease: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }),
});
