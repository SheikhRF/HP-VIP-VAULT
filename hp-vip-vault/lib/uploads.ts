export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type || "unknown"}. Allowed: JPEG, PNG, WEBP.`;
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_PHOTO_BYTES / 1024 / 1024}MB.`;
  }
  return null;
}
