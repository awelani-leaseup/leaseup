import { withForm } from "@leaseup/ui/components/form";
import { createTenantFormOptions } from "../_utils";
import { Button } from "@leaseup/ui/components/button";
import { Plus, Trash } from "lucide-react";
import { Label } from "@leaseup/ui/components/label";

export const AdditionalEmails = withForm({
  ...createTenantFormOptions,
  render: ({ form }) => {
    return (
      <div className="col-span-full">
        <Label className="mb-4">Addition Emails</Label>
        <form.AppField name="additionalEmails" mode="array">
          {(field) => {
            return (
              <>
                {field.state.value.map((_email, index) => {
                  return (
                    <div key={index} className="mt-2 flex gap-2">
                      <form.Field name={`additionalEmails[${index}]`}>
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
                      <Button
                        className="mt-4"
                        variant="outlined"
                        size="icon"
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                })}
                <div>
                  <Button
                    disabled={field.state.value.length >= 3}
                    className="mt-2 w-full"
                    color="secondary"
                    onClick={() => field.pushValue("")}
                  >
                    <Plus />
                    Add Email
                  </Button>
                </div>
              </>
            );
          }}
        </form.AppField>
      </div>
    );
  },
});
