import { createTRPCRouter, protectedProcedure } from '../server/trpc';

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const landlordId = ctx.auth?.session?.userId ?? '';

    const [
      propertiesCount,
      tenantsCount,
      totalRevenue,
      pendingIssuesCount,
      recentActivity,
      upcomingPayments,
      upcomingRenewals,
    ] = await Promise.all([
      ctx.db.property.count({
        where: {
          landlordId,
          propertyStatus: 'ACTIVE',
        },
      }),

      ctx.db.tenant.count({
        where: {
          landlordId,
        },
      }),

      ctx.db.transactions.aggregate({
        where: {
          OR: [
            {
              lease: {
                unit: {
                  property: {
                    landlordId,
                  },
                },
              },
            },
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

      ctx.db.transactions.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
              },
            },
            {
              OR: [
                {
                  lease: {
                    unit: {
                      property: {
                        landlordId,
                      },
                    },
                  },
                },
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
      }),

      ctx.db.invoice.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            gte: new Date(
              Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate()
              )
            ),
            lte: new Date(
              Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth() + 1,
                new Date().getUTCDate()
              )
            ),
          },
          OR: [
            {
              lease: {
                unit: {
                  property: {
                    landlordId,
                  },
                },
              },
            },
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

      ctx.db.lease.findMany({
        where: {
          status: 'ACTIVE',
          endDate: {
            gte: new Date(
              Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate()
              )
            ),
            lte: new Date(
              Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate() + 60
              )
            ),
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
