import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Helper to extract filename from URL
export const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const fileNameWithExtension = pathSegments[pathSegments.length - 1];
    // Remove query parameters and hash from filename
    return fileNameWithExtension.split('?')[0].split('#')[0];
  } catch (error) {
    return url; // Return original URL if parsing fails
  }
};