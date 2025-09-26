import { CardTitle } from "@leaseup/ui/components/card";
import { Badge } from "@leaseup/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@leaseup/ui/components/avatar";
import { Button } from "@leaseup/ui/components/button";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  FileText,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Eye,
  Edit,
  Plus,
  AlertTriangle,
  Clock,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";

interface PropertyLeasesProps {
  property: any;
}

export function PropertyLeases({ property }: PropertyLeasesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const leases =
    property.unit?.reduce((acc: any[], unit: any) => {
      if (unit.lease && unit.lease.length > 0) {
        unit.lease.forEach((lease: any) => {
          acc.push({
            ...lease,
            unit: unit,
          });
        });
      }
      return acc;
    }, []) || [];

  const getLeaseStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "EXPIRED":
        return "danger";
      case "PENDING":
        return "warning";
      case "TERMINATED":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getLeaseStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Circle className="fill-success h-4 w-4 animate-pulse" />;
      case "EXPIRED":
        return <AlertTriangle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (leases.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <CardTitle>Leases</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Lease
          </Button>
        </div>
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No leases found"
          description="This property doesn't have any leases yet."
          buttons={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create First Lease
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <CardTitle>All Leases</CardTitle>
        <Button>
          <Plus />
          Create Lease
        </Button>
      </div>

      <div>
        <div className="space-y-4">
          {leases.map((lease: any) => {
            const tenant = lease.tenantLease?.[0]?.tenant;
            const isExpiringSoon =
              lease.endDate &&
              differenceInDays(new Date(lease.endDate), new Date()) <= 60 &&
              differenceInDays(new Date(lease.endDate), new Date()) > 0;

            return (
              <div
                key={lease.id}
                className={`rounded-lg border p-6 transition-shadow hover:shadow-md ${
                  isExpiringSoon
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {tenant && (
                      <Avatar className="size-8">
                        <AvatarImage src={tenant.avatarUrl || undefined} />
                        <AvatarFallback className="size-8">
                          {tenant.firstName?.[0]}
                          {tenant.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Unit {lease.unit?.name}
                        </h3>
                        <Badge
                          size="sm"
                          variant="soft"
                          color={getLeaseStatusColor(lease.status)}
                          className="flex items-center gap-1"
                        >
                          {getLeaseStatusIcon(lease.status)}
                          {lease.status === "ACTIVE" ? "Active" : "Inactive"}
                        </Badge>
                        {isExpiringSoon && (
                          <Badge
                            variant="soft"
                            color="warning"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Clock className="h-4 w-4" />
                            Expiring Soon
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                        {tenant && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {tenant.firstName} {tenant.lastName}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(lease.rent || 0)}/mo</span>
                        </div>

                        {lease.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Started{" "}
                              {format(
                                new Date(lease.startDate),
                                "MMM dd, yyyy",
                              )}
                            </span>
                          </div>
                        )}

                        {lease.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Ends{" "}
                              {format(new Date(lease.endDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                        )}

                        {lease.deposit && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              Deposit: {formatCurrency(lease.deposit)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {lease.unit?.bedrooms}BR/{lease.unit?.bathrooms}BA -{" "}
                            {lease.unit?.sqmt}m²
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/leases/${lease.id}`}>
                      <Button variant="outlined" size="sm">
                        <Eye />
                        View
                      </Button>
                    </Link>
                    <Button variant="outlined" size="sm">
                      <Edit />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Lease Duration and Status */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      {lease.startDate && lease.endDate && (
                        <span>
                          Duration:{" "}
                          {differenceInDays(
                            new Date(lease.endDate),
                            new Date(lease.startDate),
                          )}{" "}
                          days
                        </span>
                      )}
                      {lease.endDate && (
                        <span>
                          {differenceInDays(
                            new Date(lease.endDate),
                            new Date(),
                          ) > 0
                            ? `${differenceInDays(new Date(lease.endDate), new Date())} days remaining`
                            : `Expired ${Math.abs(differenceInDays(new Date(lease.endDate), new Date()))} days ago`}
                        </span>
                      )}
                    </div>
                    <span>
                      Created{" "}
                      {format(new Date(lease.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
