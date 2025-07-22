import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { VOnboardingSchema } from "../_types";

export const onboardingFormOptions = formOptions({
  defaultValues: {
    businessName: "",
    numberOfProperties: 0,
    numberOfUnits: 0,
    fullName: "",
    email: "",
    phone: "",

    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    countryCode: "",

    documentType: "",
    idNumber: "",
    bankCode: "",
    accountNumber: "",
  } as v.InferInput<typeof VOnboardingSchema>,
  validators: {
    onSubmit: VOnboardingSchema,
  },
});
