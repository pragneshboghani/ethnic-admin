const fs = require("fs");
const path = require("path");

function saveBase64File(base64String, folder = "uploads") {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);

  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 format");
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  const allowedTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (!allowedTypes.includes(mimeType)) {
    throw new Error("Unsupported file format");
  }

  const ext = mimeType.split("/")[1];

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`;

  const folderPath = path.join("media", folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filepath = path.join(folderPath, filename);

  const buffer = Buffer.from(base64Data, "base64");

  fs.writeFileSync(filepath, buffer);

  return {
    filepath,
    mimeType,
    fileSize: buffer.length,
    filename
  };
}

module.exports = saveBase64File;