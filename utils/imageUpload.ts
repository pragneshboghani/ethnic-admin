import imageCompression from "browser-image-compression";

const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  initialQuality: 0.8,
};

export const shouldCompressImage = (file: File) =>
  COMPRESSIBLE_IMAGE_TYPES.has(file.type.toLowerCase());

export const optimizeUploadFile = async (file: File) => {
  if (!shouldCompressImage(file)) {
    return file;
  }

  try {
    return await imageCompression(file, IMAGE_COMPRESSION_OPTIONS);
  } catch (error) {
    console.error("Image compression failed, using original file:", error);
    return file;
  }
};

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));

    reader.readAsDataURL(file);
  });
