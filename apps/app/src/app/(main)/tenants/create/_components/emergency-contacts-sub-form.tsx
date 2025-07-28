import { withForm } from "@leaseup/ui/components/form";
import { Label } from "@leaseup/ui/components/label";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import { Trash, Plus } from "lucide-react";
import { createTenantFormOptions } from "../_utils";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@leaseup/ui/components/select";

export const EmergencyContacts = withForm({
  ...createTenantFormOptions,

  render: ({ form }) => {
    const { data: tenantRelationships } =
      api.tenant.getTenantRelationShips.useQuery();
    return (
      <form.AppField name="emergencyContacts" mode="array">
        {(field) => (
          <>
            <Label className="text-muted-foreground mb-6">
              Emergency Contacts
            </Label>
            {field.state.value.map((_contact, index) => {
              return (
                <div key={index} className="mt-2 grid gap-4 md:grid-cols-2">
                  <div className="col-span-full flex items-center justify-between">
                    <Badge size="sm">Contact {index + 1}</Badge>

                    <Button
                      variant="outlined"
                      size="icon"
                      onClick={() => field.removeValue(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <form.Field name={`emergencyContacts[${index}].fullName`}>
                    {(subField) => (
                      <form.ArraySubField
                        label="Full Name"
                        value={subField.state.value}
                        onChange={(value) =>
                          subField.handleChange(value as string)
                        }
                        asterisk
                        errors={
                          subField.state.meta.errors as {
                            message: string;
                          }[]
                        }
                      />
                    )}
                  </form.Field>
                  <div>
                    <form.Field
                      name={`emergencyContacts[${index}].phoneNumber`}
                    >
                      {(subField) => (
                        <form.ArraySubField
                          label="Phone Number"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                  </div>
                  <div>
                    <form.Field name={`emergencyContacts[${index}].email`}>
                      {(subField) => (
                        <form.ArraySubField
                          label="Email"
                          value={subField.state.value}
                          onChange={(value) =>
                            subField.handleChange(value as string)
                          }
                          errors={
                            subField.state.meta.errors as {
                              message: string;
                            }[]
                          }
                        />
                      )}
                    </form.Field>
                  </div>
                  <div>
                    <form.Field
                      name={`emergencyContacts[${index}].relationship`}
                    >
                      {(subField) => (
                        <label>
                          <Label>Relationship</Label>
                          <Select
                            onValueChange={(value) =>
                              subField.handleChange(value as string)
                            }
                          >
                            <SelectTrigger className="mt-1 w-full">
                              <SelectValue placeholder="Select a relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {tenantRelationships?.map((relationship) => (
                                <SelectItem
                                  key={relationship}
                                  value={relationship}
                                >
                                  {relationship
                                    .toLowerCase()
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase(),
                                    )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                            {subField.state.meta.errors[0]?.message}
                          </p>
                        </label>
                      )}
                    </form.Field>
                  </div>
                </div>
              );
            })}
            <Button
              color="secondary"
              className="mt-2 w-full"
              onClick={() =>
                field.pushValue({
                  email: "",
                  fullName: "",
                  phoneNumber: "",
                  relationship: "",
                })
              }
            >
              <Plus />
              Add Emergency Contact
            </Button>
          </>
        )}
      </form.AppField>
    );
  },
});
