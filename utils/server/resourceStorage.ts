import "server-only";

import fs from "fs";
import path from "path";

export const RESOURCE_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Map([
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "docx",
  ],
  ["application/vnd.ms-excel", "xls"],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xlsx",
  ],
  ["application/vnd.ms-powerpoint", "ppt"],
  [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "pptx",
  ],
  ["text/plain", "txt"],
  ["text/csv", "csv"],
  ["application/csv", "csv"],
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const resourceFolderPath = path.join(process.cwd(), "server", "private_resources");

export const saveResourceFile = (base64String: string, originalName = "") => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid file format");
  }

  const mimeType = matches[1].toLowerCase();
  const base64Data = matches[2];
  const extension = ALLOWED_MIME_TYPES.get(mimeType);

  if (!extension) {
    throw new Error("Unsupported file format");
  }

  const buffer = Buffer.from(base64Data, "base64");

  if (!buffer.length) {
    throw new Error("Uploaded file is empty");
  }

  if (buffer.length > RESOURCE_MAX_FILE_SIZE_BYTES) {
    throw new Error("File size exceeds the 25 MB limit");
  }

  if (!fs.existsSync(resourceFolderPath)) {
    fs.mkdirSync(resourceFolderPath, { recursive: true });
  }

  const storedName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}.${extension}`;

  const absolutePath = path.join(resourceFolderPath, storedName);

  fs.writeFileSync(absolutePath, buffer);

  return {
    filePath: path.join("server", "private_resources", storedName),
    absolutePath,
    mimeType,
    fileSize: buffer.length,
    storedName,
    extension,
    originalName: path.basename(originalName || `resource.${extension}`),
  };
};

export const deleteStoredResourceFile = (relativePath: string) => {
  const absolutePath = path.join(process.cwd(), relativePath);

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

export const getStoredResourceFilePath = (relativePath: string) =>
  path.join(process.cwd(), relativePath);
