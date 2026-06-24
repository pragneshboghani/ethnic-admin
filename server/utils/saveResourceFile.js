/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

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

function saveResourceFile(base64String, originalName = "") {
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

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("File size exceeds the 25 MB limit");
  }

  const folderPath = path.join("private_resources");

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const storedName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}.${extension}`;

  const filePath = path.join(folderPath, storedName);

  fs.writeFileSync(filePath, buffer);

  return {
    filePath,
    mimeType,
    fileSize: buffer.length,
    storedName,
    extension,
    originalName: path.basename(originalName || `resource.${extension}`),
  };
}

module.exports = saveResourceFile;
