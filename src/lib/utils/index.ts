import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Security utilities
export {
  escapeAttribute,
  escapeHtml,
  extractDomain,
  isUrlSafe,
  isValidDomain,
  sanitizeHref,
  sanitizeInput,
  sanitizeUrl,
  stripHtml,
} from "./security";
