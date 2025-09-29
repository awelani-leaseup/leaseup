"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";
import {
  FieldDescription,
  FieldLabel,
  FieldMessage,
  useAppForm,
} from "@leaseup/ui/components/form";
import { H5 } from "@leaseup/ui/components/typography";
import { VLeaseSchema } from "../create/_types";
import * as v from "valibot";
import { api } from "@/trpc/react";
import { useStore } from "@tanstack/react-form";
import { useEffect, useMemo } from "react";
import { Separator } from "@leaseup/ui/components/separator";
import { RadioGroup, RadioGroupItem } from "@leaseup/ui/components/radio-group";
import { Label } from "@leaseup/ui/components/label";
import { Save, Star } from "lucide-react";
import { Switch } from "@leaseup/ui/components/switch";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import toast from "react-hot-toast";
import { addMonths, format, startOfDay } from "date-fns";

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
    };
  }>;
};

interface EditLeaseDialogProps {
  lease: LeaseData;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeaseDialog({
  lease,
  children,
  open,
  onOpenChange,
}: EditLeaseDialogProps) {
  const updateLease = api.lease.updateLease.useMutation();
  const utils = api.useUtils();

  const form = useAppForm({
    validators: {
      onSubmit: VLeaseSchema,
    },
    defaultValues: {
      unitId: lease.unit?.id || "",
      propertyId: lease.unit?.property.id || "",
      tenantId: lease.tenantLease[0]?.tenant.id || "",
      leaseType: lease.leaseType || "MONTHLY",
      automaticInvoice: true, // We'll need to determine this from the lease data
      invoiceFrequency: lease.invoiceCycle || "MONTHLY",
      rent: lease.rent || 0,
      depositRequired: (lease.deposit || 0) > 0,
      deposit: lease.deposit || 0,
      depositDate: new Date(), // We'll need to get this from the lease data
      startDate: lease.startDate ? new Date(lease.startDate) : new Date(),
      endDate: lease.endDate ? new Date(lease.endDate) : new Date(),
      markPastInvoicesAsPaid: false,
    } as v.InferInput<typeof VLeaseSchema>,
    onSubmit: ({ value }) => {
      updateLease.mutate(
        {
          id: lease.id,
          leaseStartDate: startOfDay(value.startDate),
          leaseEndDate:
            value.leaseType === "MONTHLY" ? null : startOfDay(value.endDate),
          leaseType: value.leaseType,
          propertyId: value.propertyId,
          unitId: value.unitId,
          tenantId: value.tenantId,
          invoiceCycle: value.invoiceFrequency,
          leaseTermType: value.leaseType,
          rent: value.rent,
          deposit: value.deposit,
          depositDate: value.depositDate,
          depositRequired: value.depositRequired,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            toast.success("Lease updated successfully");
            utils.lease.getAll.invalidate();
            utils.lease.getById.invalidate(lease.id);
          },
          onError: (error) => {
            switch (error.data?.code) {
              case "PRECONDITION_FAILED":
                toast.error(
                  "Landlord onboarding incomplete, complete onboarding to continue.",
                );
                break;
              case "INTERNAL_SERVER_ERROR":
                toast.error("Failed to update lease, please try again later.");
                break;
              case "BAD_REQUEST":
                toast.error(error.message);
                break;
              case "NOT_FOUND":
                toast.error(error.message);
                break;
              case "CONFLICT":
                toast.error(error.message);
                break;
              default:
                toast.error("Failed to update lease, please try again later.");
            }
          },
        },
      );
    },
  });

  const { data: properties } = api.lease.getAllProperties.useQuery();
  const { data: tenants } = api.lease.getAllTenants.useQuery();

  const propId = useStore(form.store, (state) => state.values.propertyId);
  const automaticInvoice = useStore(
    form.store,
    (state) => state.values.automaticInvoice,
  );
  const leaseType = useStore(form.store, (state) => state.values.leaseType);
  const depositRequired = useStore(
    form.store,
    (state) => state.values.depositRequired,
  );

  const property = useMemo(() => {
    return properties?.find((property) => property.id === propId);
  }, [properties, propId]);

  useEffect(() => {
    if (property?.propertyType === "SINGLE_UNIT") {
      form.setFieldValue("unitId", property?.unit[0]?.id || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propId]);

  useEffect(() => {
    if (lease && open) {
      // Reset form with lease data when dialog opens
      form.reset();
    }
  }, [lease, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Lease</DialogTitle>
          <DialogDescription>
            Update lease information for{" "}
            {lease.tenantLease[0]?.tenant.firstName}{" "}
            {lease.tenantLease[0]?.tenant.lastName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <form.AppForm>
            <div>
              <H5>Property Information</H5>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <form.AppField name="propertyId">
                  {(field) => (
                    <field.ComboboxField
                      label="Property"
                      options={
                        properties
                          ? properties?.map((property) => ({
                              label: property.name,
                              id: property.id,
                            }))
                          : []
                      }
                      placeholder="Select a property"
                    />
                  )}
                </form.AppField>
                {property?.propertyType === "MULTI_UNIT" ? (
                  <form.AppField name="unitId">
                    {(field) => (
                      <field.ComboboxField
                        label="Unit"
                        options={
                          property?.unit?.map((unit) => ({
                            label: unit.name,
                            id: unit.id,
                          })) || []
                        }
                      />
                    )}
                  </form.AppField>
                ) : (
                  <div className="hidden">
                    <form.AppField name="unitId">
                      {(field) => (
                        <field.TextField
                          label="Unit"
                          value={property?.unit[0]?.id}
                          disabled
                        />
                      )}
                    </form.AppField>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <H5>Tenant Information</H5>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <form.AppField name="tenantId">
                  {(field) => (
                    <field.ComboboxField
                      disabled={true}
                      label="Tenant"
                      options={
                        tenants?.map((tenant) => ({
                          label: `${tenant.firstName} ${tenant.lastName}`,
                          id: tenant.id,
                        })) || []
                      }
                    />
                  )}
                </form.AppField>
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <H5>Lease Transactions</H5>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="col-span-full">
                  <form.AppField name="automaticInvoice">
                    {(field) => (
                      <div className="w-full">
                        <FieldLabel>
                          Do you want to setup automatic recurring invoices?
                        </FieldLabel>
                        <div className="mt-2 w-full gap-2">
                          <RadioGroup
                            value={field.state.value ? "true" : "false"}
                            className="flex w-full gap-6"
                            onValueChange={(value) => {
                              field.setValue(value === "true");
                            }}
                          >
                            <div className="flex flex-1 space-x-2 rounded-md border border-gray-200 p-4">
                              <RadioGroupItem value="true" id="true" />
                              <div className="flex flex-col">
                                <Label
                                  htmlFor="true"
                                  className="flex flex-col items-start text-sm"
                                >
                                  <span className="flex w-full justify-between">
                                    Yes
                                    <Badge
                                      size="sm"
                                      color="success"
                                      variant="soft"
                                    >
                                      <Star />
                                      Recommended
                                    </Badge>
                                  </span>
                                  <span className="text-muted-foreground text-sm tracking-tight">
                                    The system will automatically create and
                                    send invoices with payment links for the
                                    tenant every month.
                                  </span>
                                </Label>
                              </div>
                            </div>
                            <div className="flex flex-1 space-x-2 rounded-md border border-gray-200 p-4">
                              <RadioGroupItem value="false" id="false" />
                              <Label
                                htmlFor="false"
                                className="flex flex-col items-start text-sm"
                              >
                                No{" "}
                                <span>
                                  <p className="text-muted-foreground text-sm tracking-tight">
                                    The system will not create a recurring
                                    invoice for the tenant. You have to manually
                                    create and send invoices for the tenant.
                                  </p>
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <FieldMessage />
                      </div>
                    )}
                  </form.AppField>
                </div>

                {automaticInvoice ? (
                  <div className="col-span-full">
                    <H5>Recurring Rent Settings</H5>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <form.AppField name="rent">
                        {(field) => (
                          <field.TextField
                            type="number"
                            label="Rent"
                            icon={
                              <span className="text-muted-foreground mt-1 flex items-center text-sm">
                                R
                              </span>
                            }
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="invoiceFrequency">
                        {(field) => (
                          <field.SelectField
                            label="Invoice Frequency"
                            options={[
                              { label: "Monthly", id: "MONTHLY" },
                              { label: "Quarterly", id: "QUARTERLY" },
                            ]}
                            disabled
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="startDate">
                        {(field) => (
                          <field.DateField
                            label="Start Date"
                            mode="single"
                            endMonth={new Date("2099-12-31")}
                            description={`The next invoice will be due on this day of every month. (i.e ${format(addMonths(field.state.value, 1), "dd MMM yyyy")}).`}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="endDate">
                        {(field) => (
                          <field.DateField
                            label="End Date"
                            mode="single"
                            endMonth={new Date("2099-12-31")}
                            disabled={leaseType === "MONTHLY"}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="leaseType">
                        {(field) => (
                          <field.SelectField
                            label="Lease Type"
                            options={[
                              { label: "Month-to-month", id: "MONTHLY" },
                              { label: "Fixed-term", id: "FIXED_TERM" },
                            ]}
                          />
                        )}
                      </form.AppField>
                    </div>
                  </div>
                ) : null}

                <div className="col-span-full">
                  <H5>Deposit</H5>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <form.AppField name="depositRequired">
                      {(field) => (
                        <div className="col-span-full flex w-full flex-col gap-2">
                          <label className="flex flex-row items-center justify-between gap-2 rounded-md border border-gray-200 p-4">
                            <div className="flex flex-col gap-2">
                              <FieldLabel>Do you require a deposit?</FieldLabel>
                              <FieldDescription>
                                Invoice for any type of deposit and input the
                                date it was paid or is due.
                              </FieldDescription>
                            </div>
                            <Switch
                              checked={field.state.value}
                              onCheckedChange={(checked) => {
                                field.setValue(checked === true);
                              }}
                            />
                          </label>
                          <FieldMessage />
                        </div>
                      )}
                    </form.AppField>
                    {depositRequired ? (
                      <div className="animate-in fade-in-0 col-span-full gap-4 duration-300 sm:grid sm:grid-cols-2">
                        <form.AppField name="deposit">
                          {(field) => (
                            <field.TextField
                              type="number"
                              label="Deposit Amount"
                              icon={<span className="mt-1 text-sm">R</span>}
                            />
                          )}
                        </form.AppField>
                        <form.AppField name="depositDate">
                          {(field) => (
                            <field.DateField
                              label="Invoice Date"
                              mode="single"
                              endMonth={new Date("2099-12-31")}
                              disabled={!field.state.value}
                            />
                          )}
                        </form.AppField>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-span-full">
                  <form.FormMessage />
                </div>
              </div>
            </div>
          </form.AppForm>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => onOpenChange(false)}
            disabled={updateLease.isPending}
          >
            Cancel
          </Button>
          <Button
            isLoading={updateLease.isPending}
            onClick={() => {
              form.handleSubmit();
            }}
          >
            <Save />
            Update Lease
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
