import { api, HydrateClient } from "@/trpc/server";
import { Button } from "@leaseup/ui/components/button";

export default async function Dashboard() {
  return (
    <HydrateClient>
      <main
        id="main-content"
        className="bg-[#ECF0F1] px-4 py-8 pt-[73px] md:px-8"
      >
        {/* Dashboard Header */}
        <div className="mx-auto max-w-7xl">
          <div id="dashboard-header" className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#2D3436]">Dashboard</h1>
                <p className="mt-2 text-[#7F8C8D]">
                  Welcome back, John! Let's start managing your properties.
                </p>
              </div>
              <div className="mt-4 flex space-x-3 md:mt-0">
                <Button variant="outlined">
                  <i className="fa-solid fa-download"></i>
                  Export
                </Button>
                <Button>
                  <i className="fa-solid fa-plus"></i>
                  Add Property
                </Button>
              </div>
            </div>
          </div>

          {/* Empty Stats Cards */}
          <div
            id="stats-overview"
            className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Empty Properties Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <i className="fa-solid fa-building text-xl text-[#3498DB]"></i>
                </div>
                <span className="text-[#7F8C8D]">Properties</span>
              </div>
              <h3 className="text-3xl font-bold text-[#2D3436]">0</h3>
              <p className="mt-2 text-sm text-[#7F8C8D]">
                Add your first property
              </p>
            </div>

            {/* Empty Tenants Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <i className="fa-solid fa-users text-xl text-[#2ECC71]"></i>
                </div>
                <span className="text-[#7F8C8D]">Tenants</span>
              </div>
              <h3 className="text-3xl font-bold text-[#2D3436]">0</h3>
              <p className="mt-2 text-sm text-[#7F8C8D]">No tenants yet</p>
            </div>

            {/* Empty Revenue Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <i className="fa-solid fa-money-bill-wave text-xl text-[#F39C12]"></i>
                </div>
                <span className="text-[#7F8C8D]">Revenue</span>
              </div>
              <h3 className="text-3xl font-bold text-[#2D3436]">$0</h3>
              <p className="mt-2 text-sm text-[#7F8C8D]">
                Start collecting rent
              </p>
            </div>

            {/* Empty Issues Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <i className="fa-solid fa-triangle-exclamation text-xl text-[#E74C3C]"></i>
                </div>
                <span className="text-[#7F8C8D]">Pending Issues</span>
              </div>
              <h3 className="text-3xl font-bold text-[#2D3436]">0</h3>
              <p className="mt-2 text-sm text-[#7F8C8D]">No pending issues</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-8 lg:col-span-2">
              {/* Empty Recent Activity */}
              <div
                id="recent-activity"
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2D3436]">
                    Recent Activity
                  </h2>
                  <button className="cursor-not-allowed text-sm text-[#3498DB] opacity-50">
                    View All
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <i className="fa-solid fa-clock text-2xl text-[#3498DB]"></i>
                  </div>
                  <h3 className="mb-2 font-medium text-[#2D3436]">
                    No Recent Activity
                  </h3>
                  <p className="max-w-sm text-sm text-[#7F8C8D]">
                    Your recent activities will appear here once you start
                    managing properties and tenants.
                  </p>
                </div>
              </div>

              {/* Empty Properties Overview */}
              <div
                id="properties-overview"
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2D3436]">
                    Properties Overview
                  </h2>
                  <button className="cursor-not-allowed text-sm text-[#3498DB] opacity-50">
                    Manage Properties
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <i className="fa-solid fa-building text-2xl text-[#3498DB]"></i>
                  </div>
                  <h3 className="mb-2 font-medium text-[#2D3436]">
                    No Properties Added
                  </h3>
                  <p className="mb-4 max-w-sm text-sm text-[#7F8C8D]">
                    Start by adding your first property to manage units,
                    tenants, and collect rent.
                  </p>
                  <Button>
                    <i className="fa-solid fa-plus"></i>
                    Add Property
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Empty Upcoming Payments */}
              <div
                id="upcoming-payments"
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
                  Upcoming Payments
                </h2>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                    <i className="fa-solid fa-dollar-sign text-xl text-[#2ECC71]"></i>
                  </div>
                  <p className="text-sm text-[#7F8C8D]">No upcoming payments</p>
                </div>
              </div>

              {/* Empty Maintenance Requests */}
              <div
                id="maintenance-requests"
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
                  Maintenance Requests
                </h2>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                    <i className="fa-solid fa-wrench text-xl text-[#E74C3C]"></i>
                  </div>
                  <p className="text-sm text-[#7F8C8D]">
                    No maintenance requests
                  </p>
                </div>
              </div>

              {/* Empty Lease Renewals */}
              <div
                id="lease-renewals"
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
                  Upcoming Lease Renewals
                </h2>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
                    <i className="fa-solid fa-file-contract text-xl text-[#F39C12]"></i>
                  </div>
                  <p className="text-sm text-[#7F8C8D]">No upcoming renewals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
