"use client";

import { type PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { useState, useRef } from "react";
import { Button } from "@leaseup/ui/components/button";

// ✅ No tRPC needed - direct upload to API route
export default function SimplifiedFileUpload() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const generateFileName = (originalName: string, folder?: string) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const basePath = folder ? `${folder}/` : "";
    return `${basePath}${timestamp}-${randomSuffix}-${originalName}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Simplified File Upload</h2>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];

          if (!file) {
            throw new Error("No file selected");
          }

          setIsUploading(true);

          try {
            // Generate filename on client (no server needed for this)
            const fileName = generateFileName(file.name, "uploads");

            // Direct upload - no tRPC involved
            const newBlob = await upload(fileName, file, {
              access: "public",
              handleUploadUrl: "/api/file/upload",
            });

            setBlob(newBlob);
          } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + (error as Error).message);
          } finally {
            setIsUploading(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label htmlFor="file" className="mb-2 block text-sm font-medium">
            Select file to upload
          </label>
          <input
            id="file"
            name="file"
            ref={inputFileRef}
            type="file"
            required
            accept="image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
      </form>

      {blob && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="font-semibold text-green-800">Upload Successful!</h3>
          <p className="mt-1 text-sm text-green-700">
            File URL:{" "}
            <a
              href={blob.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {blob.url}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
