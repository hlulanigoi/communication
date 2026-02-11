import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | undefined | null, opts?: { locale?: string; currency?: string }) {
  const num = Number(value ?? 0);
  const locale = opts?.locale ?? "en-ZA";
  const currency = opts?.currency ?? "ZAR";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(num);
  } catch (e) {
    return num.toFixed(2);
  }
}
