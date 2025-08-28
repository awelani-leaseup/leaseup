import { formOptions } from "@tanstack/react-form";
import * as v from "valibot";
import { VPropertySchema } from "../_types";
import {
  FileTextIcon,
  FileArchiveIcon,
  FileSpreadsheetIcon,
  VideoIcon,
  HeadphonesIcon,
  ImageIcon,
  FileIcon,
} from "lucide-react";

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
    files: null,
  } as v.InferInput<typeof VPropertySchema>,
  validators: {
    onSubmit: VPropertySchema,
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
    return <FileTextIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  } else if (fileType.includes("video/")) {
    return <VideoIcon className="size-4 opacity-60" />;
  } else if (fileType.includes("audio/")) {
    return <HeadphonesIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 opacity-60" />;
  }
  return <FileIcon className="size-4 opacity-60" />;
};
