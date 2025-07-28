import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { VPropertySchema } from "../_types";

export const createPropertyFormOptions = formOptions({
  defaultValues: {
    propertyName: "",
    propertyType: "SINGLE_UNIT",
    fullAddressId: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    countryCode: "",
    propertyUnits: [],
    propertyFeatures: [],
    propertyAmenities: [],
    bedrooms: 0,
    bathrooms: 0,
    sqmt: 0,
    marketRent: 0,
    deposit: 0,
    files: [],
  } as v.InferInput<typeof VPropertySchema>,
  validators: {
    onSubmit: VPropertySchema,
  },
});
