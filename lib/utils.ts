import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/**
 * Convert Vietnamese text to URL-safe slug
 * "Phòng khách" → "phong-khach"
 * "Đèn" → "den"
 */
export function toSlug(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "";
  
  return trimmed
    .replace(/[Đđ]/g, "d") // Handle Vietnamese đ/Đ before normalization
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  }
  return (bytes / 1024).toFixed(0) + " KB";
}
