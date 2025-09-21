import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { VTenantSchema } from "../_types";
import {
  FileTextIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  VideoIcon,
  HeadphonesIcon,
  ImageIcon,
  FileIcon,
} from "lucide-react";

export const createTenantFormOptions = formOptions({
  defaultValues: {
    avatarUrl: null as string | null,
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
    files: null as v.InferInput<typeof VTenantSchema>["files"],
  },
  validators: { onSubmit: VTenantSchema },
  onSubmit: ({ value }) => {
    alert("Tenant created!\n" + JSON.stringify(value, null, 2));
  },
});

export const getFileIcon = (file: {
  file: File | { type: string; name: string };
}) => {
  const fileType = file.file.type;
  const fileName = file.file.name;

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <FileTextIcon className="size-4 stroke-1 opacity-60" />;
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 stroke-1 opacity-60" />;
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 stroke-1 opacity-60" />;
  } else if (fileType.includes("video/")) {
    return <VideoIcon className="size-4 stroke-1 opacity-60" />;
  } else if (fileType.includes("audio/")) {
    return <HeadphonesIcon className="size-4 stroke-1 opacity-60" />;
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 stroke-1 opacity-60" />;
  }
  return <FileIcon className="size-4 stroke-1 opacity-60" />;
};
