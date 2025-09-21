import { withForm } from "@leaseup/ui/components/form";
import { Label } from "@leaseup/ui/components/label";
import { Badge } from "@leaseup/ui/components/badge";
import { Button } from "@leaseup/ui/components/button";
import { Trash, Plus } from "lucide-react";
import { createTenantFormOptions } from "../_utils";
import { api } from "@/trpc/react";

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
                  <form.AppField name={`emergencyContacts[${index}].fullName`}>
                    {(subField) => (
                      <subField.TextField
                        label="Full Name"
                        value={subField.state.value}
                        asterisk
                        type="text"
                      />
                    )}
                  </form.AppField>
                  <div>
                    <form.AppField
                      name={`emergencyContacts[${index}].phoneNumber`}
                    >
                      {(subField) => (
                        <subField.TextField
                          label="Phone Number"
                          value={subField.state.value}
                          type="tel"
                        />
                      )}
                    </form.AppField>
                  </div>
                  <div>
                    <form.AppField name={`emergencyContacts[${index}].email`}>
                      {(subField) => (
                        <subField.TextField
                          label="Email"
                          value={subField.state.value}
                          type="email"
                        />
                      )}
                    </form.AppField>
                  </div>
                  <div>
                    <form.AppField
                      name={`emergencyContacts[${index}].relationship`}
                    >
                      {(subField) => (
                        <subField.SelectField
                          label="Relationship"
                          options={
                            tenantRelationships?.map((relationship) => ({
                              id: relationship,
                              label: relationship,
                            })) || []
                          }
                        />
                      )}
                    </form.AppField>
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
