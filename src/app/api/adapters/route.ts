import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  // Désactiver la vérification SSL pour les certificats auto-signés
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const headersList = await headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      console.error('Configuration d\'authentification manquante');
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const config = JSON.parse(authConfig);
    console.log('Configuration d\'authentification:', {
      baseUrl: config.baseUrl,
      hasToken: !!config.token
    });
    
    // S'assurer que l'URL utilise HTTPS et est correctement formatée
    let baseUrl = config.baseUrl;
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl.replace('http://', '');
    }
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Adapters`;
    console.log('Tentative de connexion à:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      }
    });

    console.log('Statut de la réponse:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorText: errorText
      });
      throw new Error(`Erreur lors de la récupération des adapters (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Données reçues de l\'API:', data);
    
    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    return NextResponse.json(data);
  } catch (error) {
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors de la récupération des adapters:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 