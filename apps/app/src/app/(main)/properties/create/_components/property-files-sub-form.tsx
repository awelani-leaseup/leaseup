"use client";

import { withForm } from "@leaseup/ui/components/form";
import { createPropertyFormOptions, getFileIcon } from "../_utils";
import { Button } from "@leaseup/ui/components/button";
import { H5 } from "@leaseup/ui/components/typography";
import {
  AlertCircleIcon,
  UploadIcon,
  FileIcon,
  FileText,
  Download,
  Trash2Icon,
} from "lucide-react";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { Badge } from "@leaseup/ui/components/badge";
import { Progress } from "@leaseup/ui/components/progress";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { authClient } from "@/utils/auth/client";
import { upload } from "@vercel/blob/client";
import { nanoid } from "nanoid";
import { useState } from "react";
import { getUploadFileExtension } from "@/utils/file-utils";
import { cn } from "@leaseup/ui/utils/cn";

interface PropertyDocumentManagementContentProps {
  form?: any;
  propertyId?: string;
  existingFiles?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: Date;
  }>;
  onFilesChange?: () => void;
}

const PropertyDocumentManagementContent = ({
  form,
  propertyId,
  existingFiles = [],
  onFilesChange,
}: PropertyDocumentManagementContentProps) => {
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const maxSize = 10 * 1024 * 1024; // 10MB default
  const maxFiles = 10;
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
      updateFileProgress,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles: maxFiles - existingFiles.length,
    maxSize,
    initialFiles: [],
    onFilesAdded: async (addedFiles) => {
      if (propertyId) {
        const newFiles = addedFiles
          .map((f) => f.file)
          .filter((file): file is File => file instanceof File);

        if (newFiles.length > 0) {
          setUploadingFiles(true);
          try {
            toast.promise(
              async () => {
                await Promise.all(
                  newFiles.map(async (file, index) => {
                    const fileWithId = addedFiles[index];
                    const fileExtension = getUploadFileExtension(file);

                    return upload(
                      `${user?.id}/${nanoid(21)}.${fileExtension}`,
                      file,
                      {
                        access: "public",
                        handleUploadUrl: "/api/file/upload",
                        contentType: file.type,
                        onUploadProgress: (progress) => {
                          if (fileWithId) {
                            updateFileProgress(
                              fileWithId.id,
                              progress.percentage,
                            );
                          }
                        },
                      },
                    );
                  }),
                );

                clearFiles();
              },
              {
                loading: "Uploading files...",
                success: "Files uploaded successfully",
                error: "Failed to upload files",
              },
            );

            onFilesChange?.();
            clearFiles();
          } catch (error) {
            console.error("File upload failed:", error);
            toast.error("Failed to upload files");
          } finally {
            setUploadingFiles(false);
          }
        }
      } else if (form) {
        const currentFiles = form.getFieldValue("files") || [];
        const newFiles = addedFiles
          .map((f) => f.file)
          .filter((file): file is File => file instanceof File);
        form.setFieldValue("files", [...currentFiles, ...newFiles]);
      }
    },
    onFilesChange: (allFiles) => {
      if (!propertyId && form) {
        const fileObjects = allFiles
          .map((f) => f.file)
          .filter((file): file is File => file instanceof File);
        form.setFieldValue(
          "files",
          fileObjects.length > 0 ? fileObjects : null,
        );
      }
    },
  });

  const totalFiles = existingFiles.length + files.length;
  const canAddMore = totalFiles < maxFiles;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <H5>Property Documents</H5>
        {existingFiles.length > 0 && (
          <Badge variant="outlined">{existingFiles.length} existing</Badge>
        )}
      </div>

      <div className="mt-2 space-y-4">
        {existingFiles.length > 0 && (
          <div className="space-y-4">
            <h6 className="text-sm font-medium text-gray-700">
              Existing Documents
            </h6>
            <div className="space-y-2">
              {existingFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2"
                >
                  <div className="flex items-center">
                    <FileText className="mr-3 size-4 stroke-1" />
                    <div>
                      <p className="text-sm font-medium tracking-tight text-[#2D3436]">
                        {file.name}
                      </p>
                      <p className="text-muted-foreground text-sm tracking-tight">
                        Uploaded{" "}
                        {format(new Date(file.createdAt), "MMM d, yyyy")} •{" "}
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="icon"
                      color="info"
                      onClick={() => {
                        window.open(file.url, "_blank");
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!propertyId && form && (
          <form.AppField name="files" mode="array">
            {() => (
              <div className="flex flex-col gap-2">
                <FileUploadArea
                  files={files}
                  isDragging={isDragging}
                  errors={errors}
                  maxSize={maxSize}
                  maxFiles={maxFiles}
                  canAddMore={canAddMore}
                  uploadingFiles={uploadingFiles}
                  handlers={{
                    handleDragEnter,
                    handleDragLeave,
                    handleDragOver,
                    handleDrop,
                    openFileDialog,
                    removeFile,
                    clearFiles,
                    getInputProps,
                    updateFileProgress,
                  }}
                  form={form}
                />
              </div>
            )}
          </form.AppField>
        )}

        {/* Upload Area for Update Mode */}
        {propertyId && canAddMore && (
          <div className="space-y-2">
            <FileUploadArea
              files={files}
              isDragging={isDragging}
              errors={errors}
              maxSize={maxSize}
              maxFiles={maxFiles - existingFiles.length}
              canAddMore={canAddMore}
              uploadingFiles={uploadingFiles}
              handlers={{
                handleDragEnter,
                handleDragLeave,
                handleDragOver,
                handleDrop,
                openFileDialog,
                removeFile,
                clearFiles,
                getInputProps,
                updateFileProgress,
              }}
              form={form}
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface FileUploadAreaProps {
  files: any[];
  isDragging: boolean;
  errors: string[];
  maxSize: number;
  maxFiles: number;
  canAddMore: boolean;
  uploadingFiles: boolean;
  handlers: {
    handleDragEnter: (e: any) => void;
    handleDragLeave: (e: any) => void;
    handleDragOver: (e: any) => void;
    handleDrop: (e: any) => void;
    openFileDialog: () => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    getInputProps: () => any;
    updateFileProgress: (id: string, progress: number) => void;
  };
  form?: any;
}

const FileUploadArea = ({
  files,
  isDragging,
  errors,
  maxSize,
  maxFiles,
  canAddMore,
  uploadingFiles,
  handlers,
  form,
}: FileUploadAreaProps) => {
  return (
    <>
      <button
        type="button"
        tabIndex={0}
        onDragEnter={handlers.handleDragEnter}
        onDragLeave={handlers.handleDragLeave}
        onDragOver={handlers.handleDragOver}
        onDrop={handlers.handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlers.openFileDialog();
          }
        }}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className={cn(
          "data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 focus:ring-ring flex min-h-56 w-full cursor-pointer flex-col items-center transition-colors not-data-[files]:justify-center focus:ring-2 focus:ring-offset-2 focus:outline-none has-[input:focus]:ring-[3px]",
          files.length === 0 && "rounded border border-dashed",
        )}
      >
        <input
          {...handlers.getInputProps()}
          className="sr-only"
          aria-label="Upload files"
          disabled={!canAddMore || uploadingFiles}
        />

        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                {uploadingFiles
                  ? "Uploading Files..."
                  : `New Files (${files.length})`}
              </h3>
            </div>
            <div className="w-full space-y-2 rounded-lg border-gray-200">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
                >
                  <div className="flex w-full items-center overflow-hidden">
                    <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex w-full min-w-0 flex-col gap-0.5">
                      <p className="truncate text-left text-[13px] font-medium tracking-tight">
                        {file.file.name}
                      </p>
                      <p className="text-muted-foreground text-left text-xs tracking-tight">
                        {formatBytes(file.file.size)}
                        {typeof file.progress === "number" &&
                          file.progress < 100 && (
                            <span className="ml-2">• {file.progress}%</span>
                          )}
                      </p>
                      {file.progress < 100 && (
                        <Progress
                          value={file.progress}
                          className="mt-1 h-1 w-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="icon"
                      color="danger"
                      onClick={() => {
                        handlers.removeFile(file.id);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {canAddMore && (
                <Button
                  variant="outlined"
                  className="mt-2 w-full"
                  onClick={handlers.openFileDialog}
                  disabled={uploadingFiles}
                >
                  <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
                  Add more
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-border flex flex-col items-center justify-center text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <FileIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">
              {uploadingFiles ? "Uploading..." : "Upload files"}
            </p>
            <p className="text-muted-foreground text-xs">
              Max {maxFiles} files ∙ Up to {formatBytes(maxSize)}
            </p>
            <Button
              variant="outlined"
              className="mt-4"
              onClick={handlers.openFileDialog}
              disabled={!canAddMore || uploadingFiles}
            >
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Select files
            </Button>
          </div>
        )}
      </button>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </>
  );
};

export const PropertyFilesSubForm = withForm({
  ...createPropertyFormOptions,
  render: ({ form }) => <PropertyDocumentManagementContent form={form} />,
});

export { PropertyDocumentManagementContent };
