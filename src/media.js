export const ALLOWED_IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_DECODED_PIXELS = 40_000_000;
export const MAX_EMBEDDED_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 1920;
export const MAX_IMAGE_PIXELS = 2_500_000;

export function fittedImageSize(width, height, {
  maxEdge = MAX_IMAGE_EDGE,
  maxPixels = MAX_IMAGE_PIXELS,
} = {}) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("The image dimensions are invalid.");
  }
  const scale = Math.min(1, maxEdge / Math.max(width, height), Math.sqrt(maxPixels / (width * height)));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The prepared image could not be read."));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file?.type)) {
    throw new Error("Choose a PNG, JPEG, or WebP image.");
  }
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    throw new Error("Choose an image smaller than 20 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > MAX_DECODED_PIXELS) {
      throw new Error("This image has too many pixels. Resize it before uploading.");
    }
    const target = fittedImageSize(bitmap.width, bitmap.height);
    const output = document.createElement("canvas");
    output.width = target.width;
    output.height = target.height;
    const context = output.getContext("2d", { alpha: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, target.width, target.height);

    let blob = await canvasToBlob(output, "image/webp", 0.82);
    if (!blob) blob = await canvasToBlob(output, "image/jpeg", 0.78);
    if (!blob) throw new Error("This browser could not prepare the image.");
    if (blob.size > MAX_EMBEDDED_BYTES) {
      throw new Error("This image is still too detailed to save safely. Resize or crop it first.");
    }
    return blobToDataUrl(blob);
  } finally {
    bitmap.close?.();
  }
}
