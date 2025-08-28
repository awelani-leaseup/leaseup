"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";

export function MaintenanceRequests() {
  const { data, isLoading, error } =
    api.dashboard.getMaintenanceRequests.useQuery();

  if (isLoading) {
    return (
      <div
        id="maintenance-requests"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
          Maintenance Requests
        </h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={`skeleton-${i}`} className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        id="maintenance-requests"
        className="rounded-xl border border-gray-200 bg-white p-6"
      >
        <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
          Maintenance Requests
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-red-600">Failed to load maintenance requests</p>
        </div>
      </div>
    );
  }

  const maintenanceRequests = data || [];

  if (maintenanceRequests.length === 0) {
    return (
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
          <p className="text-sm text-[#7F8C8D]">No maintenance requests</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "fa-solid fa-circle-exclamation";
      case "MEDIUM":
        return "fa-solid fa-circle-minus";
      case "LOW":
        return "fa-solid fa-circle-info";
      default:
        return "fa-solid fa-circle";
    }
  };

  return (
    <div
      id="maintenance-requests"
      className="rounded-xl border border-gray-200 bg-white p-6"
    >
      <h2 className="mb-6 text-xl font-semibold text-[#2D3436]">
        Maintenance Requests
      </h2>
      <div className="space-y-4">
        {maintenanceRequests.slice(0, 5).map((request) => {
          const tenant = request.lease?.tenantLease?.[0]?.tenant;
          const property = request.lease?.unit?.property;

          return (
            <div key={request.id} className="flex items-start space-x-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${getPriorityColor(request.priority)}`}
              >
                <i
                  className={`${getPriorityIcon(request.priority)} text-xs`}
                ></i>
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#2D3436]">
                  {request.description || "Maintenance Request"}
                </p>
                <p className="text-sm text-[#7F8C8D]">
                  {property?.name} • {tenant?.firstName} {tenant?.lastName}
                </p>
                <p className="text-xs text-[#7F8C8D]">
                  {format(new Date(request.createdAt), "MMM d, yyyy")} •{" "}
                  {request.priority} Priority
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
