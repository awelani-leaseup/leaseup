import { withForm } from "@leaseup/ui/components/form";
import { createPropertyFormOptions } from "../_utils";
import { Button } from "@leaseup/ui/components/button";
import { EmptyState } from "@leaseup/ui/components/state";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@leaseup/ui/components/table";
import { H5 } from "@leaseup/ui/components/typography";
import { Upload, FileImage, FileText, Trash, File } from "lucide-react";
import { useRef } from "react";

export const PropertyFilesSubForm = withForm({
  ...createPropertyFormOptions,
  render: ({ form }) => {
    // eslint-disable-next-line
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <H5>Property Documents</H5>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => inputRef.current?.click()}
          >
            <Upload />
            Upload
          </Button>
        </div>
        <div className="mt-2">
          <form.AppField name="files" mode="array">
            {(field) => (
              <>
                <input
                  ref={inputRef}
                  className="hidden"
                  accept="image/*, application/pdf"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      field.setValue([...(field.state.value ?? []), file]);
                    }
                  }}
                />
                {field.state.value?.length === 0 ? (
                  <EmptyState
                    title="Upload documents"
                    icon={<File />}
                    buttons={
                      <Button
                        variant="outlined"
                        onClick={() => inputRef.current?.click()}
                      >
                        <Upload />
                        Upload
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {field.state.value?.map((file, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <form.AppField name={`files[${idx}]`}>
                                {(subField) => (
                                  <div>
                                    <div className="flex items-center gap-2">
                                      {file.type.includes("image") ? (
                                        <FileImage className="h-4 w-4 stroke-1" />
                                      ) : (
                                        <FileText className="h-4 w-4 stroke-1" />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium tracking-tight">
                                          {file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {file.size < 1024
                                            ? file.size + " B"
                                            : file.size < 1024 * 1024
                                              ? (file.size / 1024).toFixed(1) +
                                                " KB"
                                              : (
                                                  file.size /
                                                  1024 /
                                                  1024
                                                ).toFixed(1) + " MB"}
                                        </p>
                                      </div>
                                    </div>
                                    <p>
                                      {subField.state.meta.errors &&
                                        subField.state.meta.errors.length >
                                          0 && (
                                          <p className="mt-1 text-sm tracking-tight text-rose-600">
                                            {
                                              subField.state.meta.errors[0]
                                                ?.message
                                            }
                                          </p>
                                        )}
                                    </p>
                                  </div>
                                )}
                              </form.AppField>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                className="cursor-pointer"
                                variant="icon"
                                onClick={() => {
                                  field.removeValue(idx);
                                }}
                              >
                                <Trash className="h-4 w-4 text-rose-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </>
            )}
          </form.AppField>
        </div>
      </div>
    );
  },
});
