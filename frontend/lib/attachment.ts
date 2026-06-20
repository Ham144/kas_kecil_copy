import { BASE_URL } from "@/lib/constant";

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

export function getAttachmentUrl(attachmentPath: string): string {
  if (!attachmentPath) return "";
  if (
    attachmentPath.startsWith("http://") ||
    attachmentPath.startsWith("https://")
  ) {
    return attachmentPath;
  }
  const baseUrl = (BASE_URL || "").replace(/\/+$/, "");
  const path = attachmentPath.startsWith("/")
    ? attachmentPath
    : `/${attachmentPath}`;
  return `${baseUrl}${path}`;
}

export function isImageAttachment(path: string): boolean {
  return IMAGE_EXT.test(path);
}

export function getAttachmentFileName(path: string): string {
  return path.split("/").pop() || "attachment";
}
