import { CustomImportConfig } from './configSchema';

// Enregistrement et chargement de la configuration utilisateur (localStorage, fichier, etc.)

export function saveCustomImportConfig(config: CustomImportConfig, key: string = 'customImportConfig') {
  localStorage.setItem(key, JSON.stringify(config));
}

export function loadCustomImportConfig(key: string = 'customImportConfig'): CustomImportConfig | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomImportConfig;
  } catch {
    return null;
  }
} 