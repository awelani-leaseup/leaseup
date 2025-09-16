import { formOptions } from "@tanstack/react-form";
import {
  VPasswordChangeSchema,
  VEmailDisplaySchema,
  VDeleteAccountSchema,
  type PasswordChangeData,
  type EmailDisplayData,
  type DeleteAccountData,
} from "../_types";

// Password Change Form Options
export const passwordChangeFormOptions = formOptions({
  defaultValues: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  } as PasswordChangeData,
  validators: {
    onSubmit: VPasswordChangeSchema,
  },
});

// Email Display Form Options
export const emailDisplayFormOptions = formOptions({
  defaultValues: {
    email: "",
  } as EmailDisplayData,
  validators: {
    onSubmit: VEmailDisplaySchema,
  },
});

// Delete Account Form Options
export const deleteAccountFormOptions = formOptions({
  defaultValues: {
    password: "",
  } as DeleteAccountData,
  validators: {
    onSubmit: VDeleteAccountSchema,
  },
});
