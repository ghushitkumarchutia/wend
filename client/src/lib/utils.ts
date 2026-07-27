import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function getCurrencySymbol(currency: string = 'USD') {
  try {
    return (0).toLocaleString('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim();
  } catch {
    return currency;
  }
}

export function formatImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = (import.meta.env?.VITE_API_URL as string | undefined) || 'http://localhost:3000/api';
  const serverOrigin = apiBase.replace(/\/api$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${serverOrigin}${cleanUrl}`;
}
