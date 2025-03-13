export interface AuthConfig {
  baseUrl: string;
  token: string;
  iedIp: string;
  authToken: string;
}

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
  const authConfigHeader = headers.get('X-Auth-Config');
  if (!authConfigHeader) {
    return null;
  }

  try {
    return JSON.parse(authConfigHeader);
  } catch {
    return null;
  }
}

// Fonction pour obtenir l'URL de base de l'API IIH
export const getBaseUrl = (request: Request) => {
  const authConfig = getAuthConfigFromHeaders(request.headers);
  if (!authConfig) throw new Error('Non authentifié');
  return `https://${authConfig.iedIp}/iih-essentials`;
}; 