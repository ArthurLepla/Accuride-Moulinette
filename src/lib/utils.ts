import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: string, name: string): string {
  return `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

export function getColorByCategory(category: string): string {
  const normalizedCategory = category.toLowerCase();
  switch (normalizedCategory) {
    case 'sector':
      return '#e31a1c';  // Rouge
    case 'workshop':
      return '#33a02c';  // Vert
    case 'machine':
      return '#1f78b4';  // Bleu
    default:
      return '#999999';  // Gris par défaut
  }
}

export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 