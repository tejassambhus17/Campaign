import type { Campaign } from "../../lib/types";

// Existing upload policy, shared by the picker validation and its UI disclosure.
export const IMAGE_UPLOAD_MAX_BYTES = 8 * 1024 * 1024;
export const IMAGE_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_UPLOAD_HINT = `JPEG, PNG or WebP · up to ${IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024)} MB`;
export type MediaPurpose = "cover" | "story" | "advertising";

export function validatePickedImage(asset: { mimeType?: string | null; fileName?: string | null; fileSize?: number }) {
  const name = asset.fileName?.toLowerCase();
  const mime = asset.mimeType || (name?.endsWith(".png") ? "image/png" : name?.endsWith(".webp") ? "image/webp" : "image/jpeg");
  if (!IMAGE_UPLOAD_MIME_TYPES.some((supported) => supported === mime))
    throw new Error("Choose a JPEG, PNG, or WebP image. Video, GIF, and HEIC uploads are not supported in this prototype.");
  if (asset.fileSize && asset.fileSize > IMAGE_UPLOAD_MAX_BYTES)
    throw new Error(`This image is larger than ${IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024)} MB. Choose a smaller JPEG, PNG, or WebP file.`);
  return mime;
}

/** Each purpose changes only its own asset collection on the current snapshot. */
export function uploadedMediaPatch(draft: Campaign, purpose: MediaPurpose, url: string, sectionId?: string): Partial<Campaign> {
  if (purpose === "cover") return { coverImage: url };
  if (purpose === "advertising") return { adImages: [...draft.adImages, url] };
  return { sections: draft.sections.map((section) => section.id === sectionId ? { ...section, url } : section) };
}
