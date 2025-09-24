"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@leaseup/ui/components/dialog";
import { Button } from "@leaseup/ui/components/button";
import { useAppForm, withForm } from "@leaseup/ui/components/form";
import { Separator } from "@leaseup/ui/components/separator";
import { H5, H6 } from "@leaseup/ui/components/typography";
import {
  Bed,
  Bath,
  DollarSign,
  RulerDimensionLine,
  Plus,
  Trash,
  Home,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-hot-toast";
import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { useRouter } from "next/navigation";

const VAddUnitsFormSchema = v.object({
  propertyId: v.pipe(v.string(), v.minLength(1, "Property is required")),
  units: v.pipe(
    v.array(
      v.object({
        unitNumber: v.pipe(
          v.string(),
          v.minLength(1, "Unit number is required"),
          v.trim(),
        ),
        bedrooms: v.pipe(
          v.number("Bedrooms required"),
          v.minValue(0, "Please enter a valid number"),
        ),
        bathrooms: v.pipe(
          v.number("Bathrooms required"),
          v.minValue(0, "Please enter a valid number"),
        ),
        sqmt: v.pipe(
          v.number("Square meters required"),
          v.minValue(0, "Please enter a valid number"),
        ),
        marketRent: v.pipe(
          v.number("Market rent required"),
          v.minValue(0, "Please enter a valid number"),
        ),
        deposit: v.pipe(
          v.number("Deposit required"),
          v.minValue(0, "Please enter a valid number"),
        ),
      }),
    ),
    v.minLength(1, "At least one unit is required"),
  ),
});

const addUnitsFormOptions = formOptions({
  defaultValues: {
    propertyId: "",
    units: [
      {
        unitNumber: "",
        bedrooms: 1,
        bathrooms: 1,
        sqmt: 0,
        marketRent: 0,
        deposit: 0,
      },
    ],
  } as v.InferInput<typeof VAddUnitsFormSchema>,
  validators: {
    onSubmit: VAddUnitsFormSchema,
  },
});

interface AddUnitDialogProps {
  children: React.ReactNode;
}

const PropertySelector = withForm({
  ...addUnitsFormOptions,
  render: ({ form }) => {
    const { data: properties } = api.lease.getAllProperties.useQuery();

    return (
      <div className="mb-6">
        <form.AppField name="propertyId">
          {(field) => (
            <field.ComboboxField
              options={
                properties?.map((property) => ({
                  label: property.name,
                  id: property.id,
                })) || []
              }
              label="Property"
              placeholder="Select a property"
            />
          )}
        </form.AppField>
      </div>
    );
  },
});

const UnitsForm = withForm({
  ...addUnitsFormOptions,
  render: ({ form }) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <H5>Units to Add</H5>
          <Button
            type="button"
            variant="outlined"
            size="sm"
            onClick={() => {
              const currentUnits = form.getFieldValue("units") || [];
              form.setFieldValue("units", [
                ...currentUnits,
                {
                  unitNumber: "",
                  bedrooms: 1,
                  bathrooms: 1,
                  sqmt: 0,
                  marketRent: 0,
                  deposit: 0,
                },
              ]);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Unit
          </Button>
        </div>

        <form.AppField name="units" mode="array">
          {(field) => (
            <div className="space-y-4">
              {field.state.value.map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <H6 className="text-gray-900">Unit {index + 1}</H6>
                    {field.state.value.length > 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        size="sm"
                        color="danger"
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <form.AppField name={`units[${index}].unitNumber`}>
                      {(unitField) => (
                        <unitField.TextField
                          label="Unit Number"
                          placeholder="e.g., 101, A1, etc."
                          icon={<Home className="h-4 w-4" />}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`units[${index}].bedrooms`}>
                      {(unitField) => (
                        <unitField.TextField
                          label="Bedrooms"
                          type="number"
                          min="0"
                          icon={<Bed className="h-4 w-4" />}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`units[${index}].bathrooms`}>
                      {(unitField) => (
                        <unitField.TextField
                          label="Bathrooms"
                          type="number"
                          min="0"
                          step="0.5"
                          icon={<Bath className="h-4 w-4" />}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`units[${index}].sqmt`}>
                      {(unitField) => (
                        <unitField.TextField
                          label="Square Meters"
                          type="number"
                          min="0"
                          icon={<RulerDimensionLine className="h-4 w-4" />}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`units[${index}].marketRent`}>
                      {(unitField) => (
                        <unitField.TextField
                          label="Market Rent (ZAR)"
                          type="number"
                          min="0"
                          icon={<DollarSign className="h-4 w-4" />}
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`units[${index}].deposit`}>
                      {(unitField) => (
                        <unitField.TextField
                          label="Deposit (ZAR)"
                          type="number"
                          min="0"
                          icon={<DollarSign className="h-4 w-4" />}
                        />
                      )}
                    </form.AppField>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form.AppField>
      </div>
    );
  },
});

export function AddUnitDialog({ children }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const router = useRouter();

  const form = useAppForm({
    ...addUnitsFormOptions,
    onSubmit: async ({ value }) => {
      toast.promise(
        addUnits.mutateAsync(value, {
          onSuccess: () => {
            utils.portfolio.getAllUnits.invalidate();
            setOpen(false);
            form.reset();
            router.refresh();
          },
          onError: (error) => {
            toast.error("Failed to add units");
            console.error("Failed to add units:", error);
          },
        }),
        {
          success: "Units added successfully",
          loading: "Adding units...",
          error: "Failed to add units",
        },
      );
    },
  });

  const addUnits = api.portfolio.addUnits.useMutation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Units</DialogTitle>
          <DialogDescription>
            Add new units to an existing property. You can add multiple units at
            once.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <form.AppForm>
            <PropertySelector form={form} />
            <Separator className="my-6" />
            <UnitsForm form={form} />
            <div className="mt-4">
              <form.FormMessage />
            </div>
          </form.AppForm>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outlined"
            onClick={() => setOpen(false)}
            disabled={addUnits.isPending}
          >
            Cancel
          </Button>
          <Button
            isLoading={addUnits.isPending}
            onClick={() => {
              form.handleSubmit();
            }}
          >
            <Plus className="h-4 w-4" />
            Add Units
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
