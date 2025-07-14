import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { VTenantSchema } from "../_types";

export const createTenantFormOptions = formOptions({
  defaultValues: {
    avataar: null as v.InferInput<typeof VTenantSchema>["avataar"],
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    primaryPhoneNumber: "",
    primaryEmail: "",
    additionalEmails: [] as v.InferInput<
      typeof VTenantSchema
    >["additionalEmails"],
    additionalPhones: [] as v.InferInput<
      typeof VTenantSchema
    >["additionalPhones"],
    emergencyContacts: [] as v.InferInput<
      typeof VTenantSchema
    >["emergencyContacts"],
    vehicles: [] as v.InferInput<typeof VTenantSchema>["vehicles"],
    files: [] as v.InferInput<typeof VTenantSchema>["files"],
  },
  validators: { onSubmit: VTenantSchema },
  onSubmit: ({ value }) => {
    alert("Tenant created!\n" + JSON.stringify(value, null, 2));
  },
});
