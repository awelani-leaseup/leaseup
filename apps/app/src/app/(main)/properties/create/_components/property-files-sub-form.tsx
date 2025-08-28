import { withForm } from "@leaseup/ui/components/form";
import { createPropertyFormOptions, getFileIcon } from "../_utils";
import { Button } from "@leaseup/ui/components/button";
import { H5 } from "@leaseup/ui/components/typography";
import {
  AlertCircleIcon,
  Trash2Icon,
  UploadIcon,
  FileIcon,
  XIcon,
} from "lucide-react";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";

interface PropertyFilesContentProps {
  form: any;
}

const PropertyFilesContent = ({ form }: PropertyFilesContentProps) => {
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
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    initialFiles: [],
    onFilesAdded: (addedFiles) => {
      const currentFiles = form.getFieldValue("files") || [];
      const newFiles = addedFiles
        .map((f) => f.file)
        .filter((file): file is File => file instanceof File);
      form.setFieldValue("files", [...currentFiles, ...newFiles]);
    },
    onFilesChange: (allFiles) => {
      const fileObjects = allFiles
        .map((f) => f.file)
        .filter((file): file is File => file instanceof File);
      form.setFieldValue("files", fileObjects.length > 0 ? fileObjects : null);
    },
  });

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <H5>Property Documents</H5>
      </div>
      <div className="mt-2">
        <form.AppField name="files" mode="array">
          {() => (
            <div className="flex flex-col gap-2">
              {/* Drop area */}
              <div
                role="button"
                tabIndex={0}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFileDialog();
                  }
                }}
                data-dragging={isDragging || undefined}
                data-files={files.length > 0 || undefined}
                className="data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 focus:ring-ring flex min-h-56 cursor-pointer flex-col items-center transition-colors not-data-[files]:justify-center focus:ring-2 focus:ring-offset-2 focus:outline-none has-[input:focus]:ring-[3px]"
              >
                <input
                  {...getInputProps()}
                  className="sr-only"
                  aria-label="Upload files"
                />

                {files.length > 0 ? (
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-medium">
                        Uploaded Files ({files.length})
                      </h3>
                      <Button variant="outlined" size="sm" onClick={clearFiles}>
                        <Trash2Icon
                          className="-ms-0.5 size-3.5 opacity-60"
                          aria-hidden="true"
                        />
                        Remove all
                      </Button>
                    </div>
                    <div className="w-full space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                              {getFileIcon(file)}
                            </div>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <p className="truncate text-[13px] font-medium">
                                {file.file.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {formatBytes(file.file.size)}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="icon"
                            className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                            onClick={() => {
                              removeFile(file.id);
                              // Update form state after removing file
                              const currentFiles =
                                form.getFieldValue("files") || [];
                              const fileIndex = files.findIndex(
                                (f) => f.id === file.id,
                              );
                              if (fileIndex >= 0) {
                                const updatedFiles = currentFiles.filter(
                                  (_: File, index: number) =>
                                    index !== fileIndex,
                                );
                                form.setFieldValue(
                                  "files",
                                  updatedFiles.length > 0 ? updatedFiles : null,
                                );
                              }
                            }}
                            aria-label="Remove file"
                          >
                            <XIcon className="size-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ))}

                      {files.length < maxFiles && (
                        <Button
                          variant="outlined"
                          className="mt-2 w-full"
                          onClick={openFileDialog}
                        >
                          <UploadIcon
                            className="-ms-1 opacity-60"
                            aria-hidden="true"
                          />
                          Add more
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div
                      className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                      aria-hidden="true"
                    >
                      <FileIcon className="size-4 opacity-60" />
                    </div>
                    <p className="mb-1.5 text-sm font-medium">Upload files</p>
                    <p className="text-muted-foreground text-xs">
                      Max {maxFiles} files ∙ Up to {formatBytes(maxSize)}
                    </p>
                    <Button
                      variant="outlined"
                      className="mt-4"
                      onClick={openFileDialog}
                    >
                      <UploadIcon
                        className="-ms-1 opacity-60"
                        aria-hidden="true"
                      />
                      Select files
                    </Button>
                  </div>
                )}
              </div>

              {errors.length > 0 && (
                <div
                  className="text-destructive flex items-center gap-1 text-xs"
                  role="alert"
                >
                  <AlertCircleIcon className="size-3 shrink-0" />
                  <span>{errors[0]}</span>
                </div>
              )}
            </div>
          )}
        </form.AppField>
      </div>
    </div>
  );
};

export const PropertyFilesSubForm = withForm({
  ...createPropertyFormOptions,
  render: ({ form }) => <PropertyFilesContent form={form} />,
});
