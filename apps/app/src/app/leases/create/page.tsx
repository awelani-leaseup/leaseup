"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@leaseup/ui/components/card";
import {
  FieldDescription,
  FieldLabel,
  FieldMessage,
  useAppForm,
} from "@leaseup/ui/components/form";
import { H5 } from "@leaseup/ui/components/typography";
import { VLeaseSchema } from "./_types";
import * as v from "valibot";
import { api } from "@/trpc/react";
import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";
import { Separator } from "@leaseup/ui/components/separator";
import { RadioGroup, RadioGroupItem } from "@leaseup/ui/components/radio-group";
import { Label } from "@leaseup/ui/components/label";
import { DollarSignIcon, Save, Star } from "lucide-react";
import { Switch } from "@leaseup/ui/components/switch";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { startOfDay } from "date-fns";

export default function CreateLease() {
  const createLease = api.lease.createLease.useMutation();
  const router = useRouter();
  const form = useAppForm({
    validators: {
      onSubmit: VLeaseSchema,
    },
    defaultValues: {
      propertyId: "",
      unitId: "",
      tenantId: "",
      leaseType: "MONTHLY",
      automaticInvoice: true,
      invoiceFrequency: "MONTHLY",
      rent: 0,
      depositRequired: true,
      deposit: 0,
      depositDate: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      markPastInvoicesAsPaid: false,
    } as v.InferInput<typeof VLeaseSchema>,
    onSubmit: ({ value }) => {
      createLease.mutate(
        {
          automaticInvoice: value.automaticInvoice,
          deposit: value.deposit,
          depositDate: value.depositDate,
          depositRequired: value.depositRequired,
          leaseStartDate: startOfDay(value.startDate),
          leaseEndDate:
            value.leaseType === "MONTHLY" ? null : startOfDay(value.endDate),
          leaseType: value.leaseType,
          markPastInvoicesAsPaid: value.markPastInvoicesAsPaid,
          propertyId: value.propertyId,
          unitId: value.unitId,
          tenantId: value.tenantId,
          invoiceCycle: value.invoiceFrequency,
          leaseTermType: value.leaseType,
          rent: value.rent,
        },
        {
          onSuccess: () => {
            router.push("/leases");
          },
          onError: () => {
            toast.error("Failed to create lease, please try again later.");
          },
        },
      );
    },
  });

  const { data: properties } = api.lease.getAllProperties.useQuery();
  const { data: tenants } = api.lease.getAllTenants.useQuery();

  const propertyId = useStore(form.store, (state) => state.values.propertyId);
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
    return properties?.find((property) => property.id === propertyId);
  }, [properties, propertyId]);

  return (
    <div className="mx-auto my-10 flex max-w-3xl flex-col">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Lease</CardTitle>
        </CardHeader>
      </Card>

      <Card className="mt-8">
        <CardContent>
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
                                    The system will automatically create a
                                    recurring invoice for the tenant every
                                    month.
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
                                No
                                <span>
                                  <p className="text-muted-foreground text-sm tracking-tight">
                                    The system will not create a recurring
                                    invoice for the tenant.
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
                            icon={<DollarSignIcon />}
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
                          <field.DateField label="Start Date" mode="single" />
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
                      <div className="col-span-full">
                        <form.AppField name="markPastInvoicesAsPaid">
                          {(field) => (
                            <div className="flex w-full flex-col gap-2">
                              <label className="flex flex-row items-center gap-2 rounded-md border border-gray-200 p-4">
                                <div className="flex flex-col gap-2">
                                  <FieldLabel>
                                    Mark past invoices as paid
                                  </FieldLabel>
                                  <FieldDescription>
                                    If you are adding a lease that have started
                                    in the past and you want to make all the
                                    previous transactions marked as paid, check
                                    the box to make all past invoices marked as
                                    a paid on their due date
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
                      </div>
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
                              icon={<DollarSignIcon />}
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

                <div className="mt-2 flex gap-4 border-gray-100 pt-6">
                  <Button
                    onClick={() => form.handleSubmit()}
                    isLoading={createLease.isPending}
                  >
                    <Save />
                    Create Lease
                  </Button>
                  <Button variant="outlined" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form.AppForm>
        </CardContent>
      </Card>
    </div>
  );
}
