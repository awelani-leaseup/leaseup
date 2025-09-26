"use client";

import { format } from "date-fns";
import {
  Download,
  Printer,
  FileText,
  Calendar,
  User,
  Edit,
} from "lucide-react";
import { Button } from "@leaseup/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Separator } from "@leaseup/ui/components/separator";
import { formatCurrencyToZAR } from "@/utils/currency";
import { EmptyState } from "@leaseup/ui/components/state";
import { UpdateLeaseDocumentsDialog } from "../../_components/update-lease-documents-dialog";
import { ViewAllDocumentsDialog } from "../../_components/view-all-documents-dialog";
import { EditLeaseDialog } from "../../_components/edit-lease-dialog";
import Link from "next/link";

type LeaseData = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  rent: number;
  deposit: number;
  status: string;
  invoiceCycle: string;
  leaseType: string;
  createdAt: Date;
  updatedAt: Date;
  unit: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      zip: string;
      propertyType?: string;
      unit?: Array<{
        id: string;
        name: string;
      }>;
      landlord: {
        id: string;
        name: string;
        businessName: string | null;
        email: string;
        phone: string | null;
      };
    };
  } | null;
  tenantLease: Array<{
    tenant: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      avatarUrl?: string | null;
      files: Array<{
        id: string;
        name: string;
        url: string;
        type: string | null;
        size: number | null;
        createdAt: Date;
        updatedAt: Date;
      }>;
    };
  }>;
  File: Array<{
    id: string;
    name: string;
    url: string;
    type: string | null;
    size: number | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

interface LeaseViewProps {
  lease: LeaseData;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "expired":
      return "bg-red-100 text-red-800 border-red-200";
    case "terminated":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return "fa-regular fa-file-lines text-gray-500";
  if (fileType.includes("pdf")) return "fa-regular fa-file-pdf text-red-500";
  if (fileType.includes("image"))
    return "fa-regular fa-file-image text-blue-500";
  if (fileType.includes("document") || fileType.includes("word"))
    return "fa-regular fa-file-word text-blue-600";
  return "fa-regular fa-file-lines text-green-500";
};

export function LeaseView({ lease }: LeaseViewProps) {
  const primaryTenant = lease.tenantLease[0]?.tenant;
  const property = lease.unit?.property;
  const landlord = property?.landlord;

  const handleDownloadPDF = () => {
    console.log("Download PDF for lease:", lease.id);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatAddress = (
    property: NonNullable<typeof lease.unit>["property"],
  ) => {
    const parts = [
      property.addressLine1,
      property.addressLine2,
      property.city,
      property.state,
      property.zip,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Lease Agreement
                </h1>
                <p className="text-gray-600">
                  Contract #{lease.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                {/* @ts-expect-error - Lease is defined in the parent component */}
                <EditLeaseDialog lease={lease}>
                  <Button>
                    <Edit className="h-4 w-4" />
                    Edit Lease
                  </Button>
                </EditLeaseDialog>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 border-gray-200 pb-6 md:grid-cols-3">
              <div>
                <h3 className="mb-2 text-sm text-gray-500">Tenant</h3>
                {primaryTenant ? (
                  <Link
                    href={`/tenants/${primaryTenant.id}`}
                    className="flex items-center"
                  >
                    <Avatar className="mr-3 h-10 w-10">
                      <AvatarImage
                        src={primaryTenant.avatarUrl || undefined}
                        alt={`${primaryTenant.firstName} ${primaryTenant.lastName}`}
                      />
                      <AvatarFallback>
                        {primaryTenant.firstName[0]}
                        {primaryTenant.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {primaryTenant.firstName} {primaryTenant.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {primaryTenant.email}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <p className="text-gray-500">No tenant assigned</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm text-gray-500">Property</h3>
                {property ? (
                  <>
                    <Link
                      href={`/properties/${property.id}`}
                      className="font-medium tracking-tight text-gray-900"
                    >
                      {property.name}
                    </Link>
                    <p className="text-gray-900">Unit {lease.unit?.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatAddress(property)}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No property assigned</p>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm text-gray-500">Status</h3>
                <Badge className={getStatusColor(lease.status)}>
                  {lease.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Lease Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-1 text-sm text-gray-500">Start Date</h3>
                    <p className="font-medium text-gray-900">
                      {format(new Date(lease.startDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm text-gray-500">End Date</h3>
                    <p className="font-medium text-gray-900">
                      {lease.endDate
                        ? format(new Date(lease.endDate), "MMMM d, yyyy")
                        : "No end date"}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm text-gray-500">Monthly Rent</h3>
                    <p className="font-medium text-gray-900">
                      {formatCurrencyToZAR(lease.rent)}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm text-gray-500">
                      Security Deposit
                    </h3>
                    <p className="font-medium text-gray-900">
                      {formatCurrencyToZAR(lease.deposit)}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm text-gray-500">
                      Invoice Cycle
                    </h3>
                    <p className="font-medium text-gray-900">
                      {lease.invoiceCycle.charAt(0).toUpperCase() +
                        lease.invoiceCycle.slice(1).toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm text-gray-500">Lease Type</h3>
                    <p className="font-medium text-gray-900">
                      {lease.leaseType.charAt(0).toUpperCase() +
                        lease.leaseType.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-medium text-gray-900">
                      1. Rent Payment
                    </h3>
                    <p className="text-gray-600">
                      Monthly rent of {formatCurrencyToZAR(lease.rent)} is due
                      on the 1st of each month. Payment should be made through
                      the designated payment methods provided by the landlord.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium text-gray-900">
                      2. Security Deposit
                    </h3>
                    <p className="text-gray-600">
                      A security deposit of {formatCurrencyToZAR(lease.deposit)}{" "}
                      has been collected and will be held for the duration of
                      the lease term. The deposit will be returned upon
                      successful completion of the lease, subject to deductions
                      for any damages or unpaid amounts.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium text-gray-900">
                      3. Property Maintenance
                    </h3>
                    <p className="text-gray-600">
                      Tenant is responsible for maintaining the property in good
                      condition and reporting any maintenance issues promptly.
                      Landlord will address maintenance requests in a timely
                      manner.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-medium text-gray-900">
                      4. Lease Termination
                    </h3>
                    <p className="text-gray-600">
                      This lease may be terminated by either party with proper
                      notice as required by law. Early termination may result in
                      penalties as outlined in the full lease agreement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Documents</CardTitle>
                <CardAction>
                  <UpdateLeaseDocumentsDialog leaseId={lease.id} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lease.File && lease.File.length > 0 ? (
                    <>
                      {lease.File.slice(0, 4).map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        >
                          <div className="flex items-center">
                            <i
                              className={`${getFileIcon(file.type)} mr-3 text-xl`}
                            />
                            <div>
                              <p className="text-sm font-medium tracking-tight text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Added{" "}
                                {format(
                                  new Date(file.createdAt),
                                  "MMM d, yyyy",
                                )}
                              </p>
                            </div>
                          </div>
                          <Button variant="text" size="sm" asChild>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      ))}
                      {lease.File.length > 4 && (
                        <div className="pt-2 text-center">
                          <ViewAllDocumentsDialog
                            files={lease.File}
                            remainingCount={lease.File.length - 4}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <EmptyState
                        title="No documents uploaded yet"
                        icon={<FileText className="h-12 w-12" />}
                        buttons={
                          <UpdateLeaseDocumentsDialog leaseId={lease.id} />
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Important Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center rounded-lg bg-gray-50 p-3">
                    <Calendar className="mr-3 h-5 w-5 stroke-1 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Lease Start</p>
                      <p className="font-medium text-gray-900">
                        {format(new Date(lease.startDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {lease.endDate && (
                    <div className="flex items-center rounded-lg bg-gray-50 p-3">
                      <Calendar className="mr-3 h-5 w-5 stroke-1 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Lease Expiration
                        </p>
                        <p className="font-medium text-gray-900">
                          {format(new Date(lease.endDate), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center rounded-lg bg-gray-50 p-3">
                    <Calendar className="mr-3 h-5 w-5 stroke-1 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Next Rent Due</p>
                      <p className="font-medium text-gray-900">
                        {format(
                          new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            1,
                          ),
                          "MMMM d, yyyy",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {landlord && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Landlord Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="mr-3 h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">
                          {landlord.name}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{landlord.email}</p>
                    </div>
                    {landlord.phone && (
                      <>
                        <Separator />
                        <div>
                          <p className="mb-1 text-sm text-gray-500">Phone</p>
                          <p className="text-gray-900">{landlord.phone}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
