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

// Palette de couleurs pour les différents niveaux
const levelColors = [
  '#1f77b4', // bleu
  '#ff7f0e', // orange
  '#2ca02c', // vert
  '#d62728', // rouge
  '#9467bd', // violet
  '#8c564b', // marron
  '#e377c2', // rose
  '#7f7f7f', // gris
  '#bcbd22', // olive
  '#17becf'  // cyan
];

export function getColorByLevel(level: number): string {
  // Utilise le modulo pour cycler à travers les couleurs si on a plus de niveaux que de couleurs
  return levelColors[level % levelColors.length];
} 