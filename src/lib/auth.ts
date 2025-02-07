import { AuthConfig } from './types';

export function getAuthConfig(): AuthConfig | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const config = localStorage.getItem('authConfig');
    if (!config) return null;
    return JSON.parse(config);
  } catch {
    return null;
  }
}

export function setAuthConfig(config: AuthConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authConfig', JSON.stringify(config));
}

export function clearAuthConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authConfig');
}

export function isAuthenticated(): boolean {
  return getAuthConfig() !== null;
}

// Fonction utilitaire pour obtenir la configuration depuis les headers de la requête
export function getAuthConfigFromHeaders(headers: Headers): AuthConfig | null {
  try {
    const authHeader = headers.get('X-Auth-Config');
    if (!authHeader) return null;
    return JSON.parse(authHeader);
  } catch {
    return null;
  }
} 