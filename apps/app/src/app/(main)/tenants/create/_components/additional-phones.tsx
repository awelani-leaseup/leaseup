import { withForm } from "@leaseup/ui/components/form";
import { createTenantFormOptions } from "../_utils";
import { Button } from "@leaseup/ui/components/button";
import { Plus, Trash } from "lucide-react";
import { Label } from "@leaseup/ui/components/label";

export const AdditionalPhones = withForm({
  ...createTenantFormOptions,
  render: ({ form }) => {
    return (
      <form.AppField name="additionalPhones" mode="array">
        {(field) => (
          <div className="col-span-full">
            <Label className="mb-4">Additional Phones</Label>
            {field.state.value.map((_phone, index) => {
              return (
                <div key={index} className="mt-2 flex gap-2">
                  <form.Field name={`additionalPhones[${index}]`}>
                    {(subField) => (
                      <form.ArraySubField
                        label="Phone"
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
                color="secondary"
                disabled={field.state.value.length >= 3}
                className="mt-2 w-full"
                onClick={() => field.pushValue("")}
              >
                <Plus />
                Add Phone
              </Button>
            </div>
          </div>
        )}
      </form.AppField>
    );
  },
});
