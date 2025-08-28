import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@leaseup/ui/components/button";
import { DashboardStats } from "./_components/dashboard-stats";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingPayments } from "./_components/upcoming-payments";
import { MaintenanceRequests } from "./_components/maintenance-requests";
import { LeaseRenewals } from "./_components/lease-renewals";
import { DownloadIcon, PlusIcon } from "lucide-react";

export default async function Dashboard() {
  // Prefetch dashboard data
  await api.dashboard.getStats.prefetch();
  await api.dashboard.getMaintenanceRequests.prefetch();
  return (
    <HydrateClient>
      <main
        id="main-content"
        className="h-full bg-[#ECF0F1] px-4 py-8 pt-[73px] md:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div id="dashboard-header" className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-lg font-bold text-[#2D3436]">Dashboard</h1>
                <p className="text-[#7F8C8D]">
                  Welcome back, John! Let&apos;s start managing your properties.
                </p>
              </div>
              <div className="mt-4 flex space-x-3 md:mt-0">
                <Button variant="outlined">
                  <DownloadIcon className="mr-2" />
                  Export
                </Button>
                <Button>
                  <PlusIcon className="mr-2" />
                  Add Property
                </Button>
              </div>
            </div>
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
