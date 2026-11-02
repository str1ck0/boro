import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function isAllowedImage(type: string) {
  return type in EXT;
}

/**
 * Store an uploaded image and return its public URL.
 * Uses Vercel Blob when configured; falls back to /public/uploads in local dev.
 */
export async function storeImage(file: File, folder: string) {
  const name = `${folder}/${crypto.randomUUID()}.${EXT[file.type]}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
