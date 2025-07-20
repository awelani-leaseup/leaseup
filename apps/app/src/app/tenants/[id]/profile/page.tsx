"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "@leaseup/ui/components/state";

export default function TenantProfilePage() {
  const params = useParams();
  const tenantId = params.id as string;

  const {
    data: tenant,
    isLoading,
    error,
  } = api.tenant.getTenantById.useQuery({
    id: tenantId,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading tenant profile...</p>
        </div>
      </div>
    );
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
              <CardTitle className="text-xl">Current Lease</CardTitle>
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
            <CardTitle className="text-xl">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.files && tenant.files.length > 0 ? (
              <div className="space-y-4">
                {tenant.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center">
                      <FileText className="mr-3 text-2xl text-[#E74C3C]" />
                      <div>
                        <p className="font-medium text-[#2D3436]">
                          {file.name}
                        </p>
                        <p className="text-sm text-[#7F8C8D]">
                          Uploaded{" "}
                          {format(new Date(file.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button variant="text" className="text-[#3498DB]">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No documents uploaded yet."
                icon={<FileText className="h-4 w-4" />}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-8">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
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

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Additional Information</CardTitle>
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
