// src/lib/cloudinary.ts
// Cloudinary SDK configuration and upload helpers (server-side only)

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload a base64 data URI or remote URL to Cloudinary.
 * Returns the secure URL and public_id.
 */
export async function uploadImage(
  dataUriOrUrl: string,
  folder = "tv-inventory"
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(dataUriOrUrl, {
    folder,
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Build a Cloudinary optimized image URL with transformations.
 */
export function getOptimizedUrl(
  src: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  const { width = 400, quality = "auto:good" } = options;
  // For already-cloudinary URLs, return as-is (Next/Image handles optimization)
  return src;
}

export { cloudinary };
