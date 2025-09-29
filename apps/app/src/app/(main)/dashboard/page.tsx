import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@leaseup/ui/components/button";
import { DashboardStats } from "./_components/dashboard-stats";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingPayments } from "./_components/upcoming-payments";
import { LeaseRenewals } from "./_components/lease-renewals";
import { PlusIcon } from "lucide-react";
import { authClient } from "@/utils/auth/client";
import { headers } from "next/headers";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import Link from "next/link";

export default async function Dashboard() {
  // Prefetch dashboard data
  await api.dashboard.getStats.prefetch();
  await api.dashboard.getMaintenanceRequests.prefetch();
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  return (
    <HydrateClient>
      <main
        id="main-content"
        className="h-full bg-[#ECF0F1] px-4 py-8 pt-[73px] md:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <div id="dashboard-header" className="mb-8">
            <Card>
              <CardContent>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-[#2D3436]">
                    Dashboard
                  </CardTitle>
                  <CardDescription className="text-base text-[#7F8C8D]">
                    Welcome back, {session?.data?.user?.name.split(" ")[0]}!
                    Let&apos;s start managing your properties.
                  </CardDescription>
                  <CardAction>
                    <div className="mt-4 flex space-x-3 md:mt-0">
                      <Link href="/properties/create">
                        <Button>
                          <PlusIcon  />
                          Add Property
                        </Button>
                      </Link>
                    </div>
                  </CardAction>
                </CardHeader>
              </CardContent>
            </Card>
          </div>

          <DashboardStats />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <RecentActivity />
            </div>
            <div className="space-y-8">
              <UpcomingPayments />
              <LeaseRenewals />
              {/* <MaintenanceRequests /> */}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
