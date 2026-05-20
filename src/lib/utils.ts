import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { format, parseISO, isValid } from "date-fns";

export const normalizeDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return isValid(value) ? value : null;
  }
  if (typeof value === "string") {
    try {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
};

export const safeFormatDate = (value: unknown, formatStr: string = "MMM dd, yyyy", fallback: string = "") => {
  const date = normalizeDate(value);
  if (!date) return fallback;
  return format(date, formatStr);
};

export const safeSplit = (value: unknown, separator: string = ","): string[] => {
  if (typeof value === "string") {
    return value.split(separator).filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value.map(v => String(v));
  }
  return [];
};
