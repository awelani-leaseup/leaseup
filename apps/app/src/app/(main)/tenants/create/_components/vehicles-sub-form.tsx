import { withForm } from "@leaseup/ui/components/form";
import { createTenantFormOptions } from "../_utils";
import { Label } from "@leaseup/ui/components/label";
import { Button } from "@leaseup/ui/components/button";
import { Plus, Trash } from "lucide-react";
import { Badge } from "@leaseup/ui/components/badge";

export const Vehicles = withForm({
  ...createTenantFormOptions,
  render: ({ form }) => {
    return (
      <form.AppField name="vehicles" mode="array">
        {(field) => (
          <>
            <Label className="text-muted-foreground mb-6">Vehicles</Label>
            {field.state.value.map((_vehicle, index) => {
              return (
                <div key={index} className="mt-2 grid gap-4 md:grid-cols-2">
                  <div className="col-span-full flex items-center justify-between">
                    <Badge size="sm">Vehicle {index + 1}</Badge>
                    <Button
                      variant="outlined"
                      size="icon"
                      onClick={() => field.removeValue(index)}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <form.AppField name={`vehicles[${index}].make`}>
                    {(subField) => (
                      <subField.TextField
                        label="Make"
                        value={subField.state.value}
                        type="text"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`vehicles[${index}].model`}>
                    {(subField) => (
                      <subField.TextField
                        label="Model"
                        value={subField.state.value}
                        type="text"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`vehicles[${index}].year`}>
                    {(subField) => (
                      <subField.TextField
                        label="Year"
                        value={subField.state.value}
                        type="text"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`vehicles[${index}].color`}>
                    {(subField) => (
                      <subField.TextField
                        label="Color"
                        value={subField.state.value}
                        type="text"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`vehicles[${index}].licensePlate`}>
                    {(subField) => (
                      <subField.TextField
                        label="License Plate"
                        value={subField.state.value}
                        type="text"
                      />
                    )}
                  </form.AppField>
                </div>
              );
            })}
            <Button
              color="secondary"
              className="mt-2 w-full"
              onClick={() =>
                field.pushValue({
                  make: "",
                  model: "",
                  year: "",
                  color: "",
                  licensePlate: "",
                })
              }
            >
              <Plus />
              Add Vehicle
            </Button>
          </>
        )}
      </form.AppField>
    );
  },
});
