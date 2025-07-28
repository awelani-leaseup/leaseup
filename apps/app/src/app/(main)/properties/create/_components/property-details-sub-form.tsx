import { withForm } from "@leaseup/ui/components/form";
import { createPropertyFormOptions } from "../_utils";
import { Button } from "@leaseup/ui/components/button";
import { Input } from "@leaseup/ui/components/input";
import { Label } from "@leaseup/ui/components/label";
import { H5, H6 } from "@leaseup/ui/components/typography";
import {
  Bed,
  Bath,
  DollarSign,
  RulerDimensionLine,
  Plus,
  Trash,
} from "lucide-react";
import * as v from "valibot";
import { Badge } from "@leaseup/ui/components/badge";

export const PropertyDetailsSubForm = withForm({
  ...createPropertyFormOptions,
  render: ({ form }) => {
    return (
      <>
        {
          <form.Subscribe selector={(state) => state.values.propertyType}>
            {(type) => {
              if (type === "SINGLE_UNIT") {
                return (
                  <div className="mb-8">
                    <H5>Property Details</H5>
                    <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
                      <form.AppField name="bedrooms">
                        {(field) => (
                          <field.TextField
                            label="Bedrooms"
                            type="number"
                            icon={<Bed className="h-4 w-4" />}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="bathrooms">
                        {(field) => (
                          <field.TextField
                            label="Bathrooms"
                            type="number"
                            icon={<Bath className="h-4 w-4" />}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="marketRent">
                        {(field) => (
                          <field.TextField
                            label="Market Rent"
                            type="number"
                            icon={<DollarSign className="h-4 w-4" />}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="deposit">
                        {(field) => (
                          <field.TextField
                            label="Deposit"
                            type="number"
                            icon={<DollarSign className="h-4 w-4" />}
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="sqmt">
                        {(field) => (
                          <field.TextField
                            label="Square Meters"
                            type="number"
                            icon={<RulerDimensionLine className="h-4 w-4" />}
                          />
                        )}
                      </form.AppField>
                    </div>
                  </div>
                );
              }

              return (
                <div className="mb-8">
                  <form.Field
                    name="propertyUnits"
                    mode="array"
                    validators={{
                      onSubmit: v.pipe(
                        v.array(
                          v.object({
                            unitNumber: v.string(),
                            bedrooms: v.number(),
                            bathrooms: v.number(),
                            sqmt: v.number(),
                            rent: v.number(),
                            deposit: v.number(),
                          }),
                        ),
                        v.minLength(1, "Please add at least one unit"),
                      ),
                    }}
                  >
                    {(field) => (
                      <>
                        <div className="mb-6 flex items-center justify-between">
                          <H6 className="text-lg font-semibold text-[#2D3436]">
                            Units Information
                          </H6>
                          <Button
                            type="button"
                            variant="icon"
                            className="h-auto p-0 text-[#3498DB] hover:text-[#2C3E50]"
                            onClick={() => {
                              field.pushValue({
                                unitNumber: "",
                                bedrooms: 0,
                                bathrooms: 0,
                                sqmt: 0,
                                rent: 0,
                                deposit: 0,
                              });
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                          </Button>
                        </div>
                        {field.state.value.map((unit, idx) => (
                          <div
                            key={idx}
                            className="mb-4 rounded-lg border border-gray-200 p-6"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="flex items-center gap-2 font-semibold tracking-tight text-[#2D3436] underline">
                                Unit {idx + 1}
                              </h3>
                              <Button
                                type="button"
                                variant="icon"
                                className="cursor-pointers h-auto p-0 text-[#E74C3C] hover:text-[#C0392B]"
                                onClick={() => field.removeValue(idx)}
                                disabled={field.state.value.length === 1}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                              <div>
                                <Label className="mb-2">Unit Number/Name</Label>
                                <form.Field
                                  name={`propertyUnits[${idx}].unitNumber`}
                                >
                                  {(subField) => (
                                    <>
                                      <Input
                                        placeholder="e.g. 101"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.setValue(e.target.value)
                                        }
                                      />
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </>
                                  )}
                                </form.Field>
                              </div>
                              <div>
                                <Label className="mb-2">Bedrooms</Label>

                                <form.Field
                                  name={`propertyUnits[${idx}].bedrooms`}
                                >
                                  {(subField) => (
                                    <>
                                      <Input
                                        icon={<Bed className="h-4 w-4" />}
                                        type="number"
                                        placeholder="e.g. 1, 2"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.setValue(
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </>
                                  )}
                                </form.Field>
                              </div>
                              <div>
                                <Label className="mb-2">Bathrooms</Label>
                                <form.Field
                                  name={`propertyUnits[${idx}].bathrooms`}
                                >
                                  {(subField) => (
                                    <>
                                      <Input
                                        icon={<Bath className="h-4 w-4" />}
                                        type="number"
                                        placeholder="e.g. 1, 2.5"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.setValue(
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </>
                                  )}
                                </form.Field>
                              </div>
                              <div>
                                <Label className="mb-2">Square Meters</Label>
                                <form.Field name={`propertyUnits[${idx}].sqmt`}>
                                  {(subField) => (
                                    <>
                                      <Input
                                        icon={
                                          <RulerDimensionLine className="h-4 w-4" />
                                        }
                                        type="number"
                                        placeholder="e.g. 100, 150"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.setValue(
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </>
                                  )}
                                </form.Field>
                              </div>
                              <div>
                                <Label className="mb-2">Market Rent ($)</Label>
                                <form.Field name={`propertyUnits[${idx}].rent`}>
                                  {(subField) => (
                                    <>
                                      <Input
                                        icon={
                                          <DollarSign className="h-4 w-4" />
                                        }
                                        type="number"
                                        placeholder="e.g. 1000, 1500"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.setValue(
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </>
                                  )}
                                </form.Field>
                              </div>
                              <div>
                                <Label className="mb-2">
                                  Security Deposit ($)
                                </Label>
                                <form.Field
                                  name={`propertyUnits[${idx}].deposit`}
                                >
                                  {(subField) => (
                                    <>
                                      <Input
                                        icon={
                                          <DollarSign className="h-4 w-4" />
                                        }
                                        type="number"
                                        placeholder="e.g. 1000, 1500"
                                        value={subField.state.value}
                                        onChange={(e) =>
                                          subField.setValue(
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </>
                                  )}
                                </form.Field>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </form.Field>
                </div>
              );
            }}
          </form.Subscribe>
        }
      </>
    );
  },
});
