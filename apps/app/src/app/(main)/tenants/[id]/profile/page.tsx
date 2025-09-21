"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { format } from "date-fns";
import { TenantProfileSkeleton } from "../../_components/tenant-skeletons";
import { DocumentManagementContent } from "../../create/_components/document-management-sub-form";

export default function TenantProfilePage() {
  const params = useParams();
  const tenantId = params.id as string;

  const {
    data: tenant,
    isLoading,
    error,
    refetch,
  } = api.tenant.getTenantById.useQuery({
    id: tenantId,
  });

  if (isLoading) {
    return <TenantProfileSkeleton />;
  }

  if (error || !tenant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading tenant profile</p>
          <p className="text-gray-600">
            {error?.message || "Tenant not found"}
          </p>
        </div>
      </div>
    );
  }

  const currentLease = tenant.tenantLease?.[0]?.lease;
  const currentProperty = currentLease?.unit?.property;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Column */}
      <div className="space-y-8 lg:col-span-2">
        {/* Current Lease Information */}
        {currentLease && currentProperty && (
          <Card>
            <CardHeader>
              <CardTitle>Current Lease</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Property</h3>
                  <p className="font-medium text-[#2D3436]">
                    {currentProperty.name}, Unit #{currentLease.unit?.name}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Monthly Rent</h3>
                  <p className="font-medium text-[#2D3436]">
                    {new Intl.NumberFormat("en-ZA", {
                      style: "currency",
                      currency: currentLease.rentDueCurrency,
                    }).format(currentLease.rent)}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Lease Start</h3>
                  <p className="font-medium text-[#2D3436]">
                    {format(new Date(currentLease.startDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Lease End</h3>
                  <p className="font-medium text-[#2D3436]">
                    {currentLease.endDate
                      ? format(new Date(currentLease.endDate), "MMMM d, yyyy")
                      : "Month-to-Month"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">
                    Security Deposit
                  </h3>
                  <p className="font-medium text-[#2D3436]">
                    {new Intl.NumberFormat("en-ZA", {
                      style: "currency",
                      currency: currentLease.rentDueCurrency,
                    }).format(currentLease.deposit)}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm text-[#7F8C8D]">Status</h3>
                  <Badge className="bg-[#2ECC71] text-white">
                    {currentLease.status === "ACTIVE" ? "Active" : null}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentManagementContent
              tenantId={tenantId}
              existingFiles={
                tenant.files?.map((file) => ({
                  id: file.id,
                  name: file.name,
                  url: file.url,
                  type: file.type || "application/octet-stream",
                  size: file.size || 0,
                  createdAt: file.createdAt,
                })) || []
              }
              onFilesChange={() => {
                refetch();
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Email</h3>
                <p className="text-[#2D3436]">{tenant.email}</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Phone</h3>
                <p className="text-[#2D3436]">{tenant.phone}</p>
              </div>
              {tenant.emergencyContacts &&
                Array.isArray(tenant.emergencyContacts) &&
                tenant.emergencyContacts.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-sm text-[#7F8C8D]">
                      Emergency Contact
                    </h3>
                    <p className="text-[#2D3436]">
                      {/* @ts-expect-error - TODO: fix this */}
                      {tenant.emergencyContacts[0]?.fullName}
                    </p>
                    <p className="text-[#2D3436]">
                      {/* @ts-expect-error - TODO: fix this */}
                      {tenant.emergencyContacts[0]?.phoneNumber}
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-sm text-[#7F8C8D]">Date of Birth</h3>
                <p className="text-[#2D3436]">
                  {tenant.dateOfBirth
                    ? format(new Date(tenant.dateOfBirth), "MMMM d, yyyy")
                    : "N/A"}
                </p>
              </div>
              {tenant.additionalEmails &&
                tenant.additionalEmails.length > 0 && (
                  <div>
                    <h3 className="mb-1 text-sm text-[#7F8C8D]">
                      Additional Emails
                    </h3>
                    {tenant.additionalEmails.map((email, index) => (
                      <p key={index} className="text-[#2D3436]">
                        {email}
                      </p>
                    ))}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
