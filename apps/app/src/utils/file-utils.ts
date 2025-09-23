/**
 * Extracts the file extension from a filename
 * @param filename - The name of the file
 * @returns The file extension without the dot (e.g., "docx", "pdf", "jpg")
 */
export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return ""; // No extension found or dot is at the end
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Gets a proper file extension for upload, preferring the filename extension
 * over the MIME type when available
 * @param file - The File object
 * @returns The file extension to use for the uploaded file
 */
export function getUploadFileExtension(file: File): string {
  // First try to get extension from filename
  const extensionFromName = getFileExtension(file.name);
  if (extensionFromName) {
    return extensionFromName;
  }

  // Fallback to extracting from MIME type for common cases
  const mimeToExtension: Record<string, string> = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "text/csv": "csv",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };

  return mimeToExtension[file.type] || "bin";
}
