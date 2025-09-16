import * as v from "valibot";

export const VPasswordChangeSchema = v.pipe(
  v.object({
    currentPassword: v.pipe(
      v.string(),
      v.nonEmpty("Current password is required"),
    ),
    newPassword: v.pipe(
      v.string(),
      v.nonEmpty("New password is required"),
      v.minLength(8, "Password must be at least 8 characters long"),
      v.maxLength(100, "Password must be less than 100 characters long"),
    ),
    confirmPassword: v.pipe(
      v.string(),
      v.nonEmpty("Please confirm your new password"),
    ),
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmPassword"]],
      (input) => input.newPassword === input.confirmPassword,
      "The two passwords do not match.",
    ),
    ["confirmPassword"],
  ),
);

export const VEmailDisplaySchema = v.object({
  email: v.pipe(v.string(), v.email("Invalid email format")),
});

export const VDeleteAccountSchema = v.object({
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password is required to delete your account"),
  ),
});

export type PasswordChangeData = v.InferInput<typeof VPasswordChangeSchema>;
export type EmailDisplayData = v.InferInput<typeof VEmailDisplaySchema>;
export type DeleteAccountData = v.InferInput<typeof VDeleteAccountSchema>;
