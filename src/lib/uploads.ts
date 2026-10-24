import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadError extends Error {}

export async function saveUploadedImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new UploadError("Only JPEG, PNG, WEBP, or GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError("Images must be 5MB or smaller.");
  }

  const filename = `listings/${randomUUID()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return blob.url;
}

export async function saveUploadedImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size === 0) continue;
    urls.push(await saveUploadedImage(file));
  }
  return urls;
}
