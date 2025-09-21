import * as v from "valibot";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const FileSchema = v.pipe(
  v.file(),
  v.mimeType(
    ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"],
    "Please select a PDF file.",
  ),
  v.maxSize(MAX_SIZE, "Please select a file smaller than 5 MB."),
);

export const VTenantSchema = v.object({
  avatarUrl: v.nullable(v.string()),
  firstName: v.pipe(v.string(), v.minLength(1, "First name is required")),
  lastName: v.pipe(v.string(), v.minLength(1, "Last name is required")),
  dateOfBirth: v.pipe(
    v.date("Date of birth is required"),
    v.maxValue(new Date(), "Date of birth cannot be in the future"),
  ),
  primaryEmail: v.pipe(v.string(), v.email("Invalid Email")),
  primaryPhoneNumber: v.pipe(
    v.string(),
    v.minLength(1, "Phone number is required"),
  ),
  additionalEmails: v.array(v.pipe(v.string(), v.email("Invalid Email"))),
  additionalPhones: v.array(
    v.pipe(v.string(), v.minLength(1, "Phone Number is required")),
  ),
  emergencyContacts: v.array(
    v.object({
      fullName: v.pipe(v.string(), v.minLength(1, "Full Name is required")),
      email: v.pipe(v.string(), v.email("Invalid Email")),
      phoneNumber: v.pipe(
        v.string(),
        v.minLength(1, "Phone number is required"),
      ),
      relationship: v.string(),
    }),
  ),
  vehicles: v.array(
    v.object({
      make: v.pipe(v.string(), v.minLength(1, "Make is required"), v.trim()),
      model: v.string(),
      year: v.string(),
      color: v.string(),
      licensePlate: v.string(),
    }),
  ),
  files: v.nullable(v.array(FileSchema)),
});
