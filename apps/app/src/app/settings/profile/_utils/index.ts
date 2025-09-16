import { formOptions } from "@tanstack/react-form";
import {
  VPersonalInfoSchema,
  VBusinessInfoSchema,
  VAddressInfoSchema,
  VProfilePictureSchema,
  type PersonalInfoData,
  type BusinessInfoData,
  type AddressInfoData,
  type ProfilePictureData,
} from "../_types";

// Personal Information Form Options
export const personalInfoFormOptions = formOptions({
  defaultValues: {
    fullName: "",
    email: "",
    phone: "",
  } as PersonalInfoData,
  validators: {
    onSubmit: VPersonalInfoSchema,
  },
});

// Business Information Form Options
export const businessInfoFormOptions = formOptions({
  defaultValues: {
    businessName: "",
    numberOfProperties: 0,
    numberOfUnits: 0,
  } as BusinessInfoData,
  validators: {
    onSubmit: VBusinessInfoSchema,
  },
});

// Address Information Form Options
export const addressInfoFormOptions = formOptions({
  defaultValues: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    countryCode: "",
  } as AddressInfoData,
  validators: {
    onSubmit: VAddressInfoSchema,
  },
});

// Profile Picture Form Options
export const profilePictureFormOptions = formOptions({
  defaultValues: {
    image: "",
  } as ProfilePictureData,
  validators: {
    onSubmit: VProfilePictureSchema,
  },
});
