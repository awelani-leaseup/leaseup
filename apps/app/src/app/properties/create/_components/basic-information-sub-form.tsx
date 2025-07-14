import {
  FieldLabel,
  FieldMessage,
  withForm,
} from "@leaseup/ui/components/form";
import { createPropertyFormOptions } from "../_utils";
import { Label } from "@leaseup/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@leaseup/ui/components/radio-group";

export const BasicInformationSubForm = withForm({
  ...createPropertyFormOptions,
  render: ({ form }) => {
    return (
      <>
        <form.AppField name="propertyName">
          {(field) => <field.TextField label="Property Name" />}
        </form.AppField>
        <div className="col-span-full flex">
          <form.AppField name="propertyType">
            {(field) => (
              <div className="w-full">
                <FieldLabel>Property Type</FieldLabel>
                <div className="mt-2 w-full gap-2">
                  <RadioGroup
                    value={field.state.value}
                    className="flex w-full gap-6"
                    onValueChange={(value) => {
                      field.setValue(value);
                    }}
                  >
                    <div className="flex h-40 flex-1 space-x-2 rounded-md border border-gray-200 p-4">
                      <RadioGroupItem value="SINGLE_UNIT" id="SINGLE_UNIT" />
                      <div className="flex flex-col">
                        <Label
                          htmlFor="SINGLE_UNIT"
                          className="flex flex-col items-start text-sm"
                        >
                          Single Unit
                          <span className="text-muted-foreground text-sm">
                            Single family rentals are rentals in which there is
                            only one rental associated to a specific address.
                            This type of rental is usually used for a house This
                            type of property does not allow to add any
                            units/rooms
                          </span>
                        </Label>
                      </div>
                    </div>
                    <div className="flex h-40 flex-1 space-x-2 rounded-md border border-gray-200 p-4">
                      <RadioGroupItem value="MULTI_UNIT" id="MULTI_UNIT" />
                      <Label
                        htmlFor="MULTI_UNIT"
                        className="flex flex-col items-start text-sm"
                      >
                        Multi Unit
                        <span>
                          <p className="text-muted-foreground text-sm">
                            Multi family rentals are rentals in which there is
                            more than one rental associated to a specific
                            address. This type of property allows to add any
                            units/rooms.
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
        <form.AppField name="fullAddressId">
          {(field) => <field.AddressField label="Search Address" />}
        </form.AppField>
        <form.AppField name="addressLine1">
          {(field) => <field.TextField label="Address Line 1" />}
        </form.AppField>
        <form.AppField name="addressLine2">
          {(field) => <field.TextField label="Address Line 2" />}
        </form.AppField>
        <form.AppField name="city">
          {(field) => <field.TextField label="City" />}
        </form.AppField>
        <div className="flex gap-4">
          <form.AppField name="state">
            {(field) => <field.TextField label="Province" />}
          </form.AppField>
          <form.AppField name="zip">
            {(field) => <field.TextField label="Zip Code" />}
          </form.AppField>
        </div>
        <form.AppField name="countryCode">
          {(field) => <field.TextField label="Country" />}
        </form.AppField>
      </>
    );
  },
});
