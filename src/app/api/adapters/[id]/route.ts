import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { extractRouteParams } from '@/lib/route-helper';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Extraire l'ID de manière sûre
  const { id } = extractRouteParams(params);
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const headersList = await headers();
    const authConfig = headersList.get('x-auth-config');
    
    if (!authConfig) {
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const config = JSON.parse(authConfig);
    // Utiliser l'ID extrait
    const adapterId = id;
    
    let baseUrl = config.baseUrl;
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl.replace('http://', '');
    }
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Adapters/${adapterId}`;
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
      throw new Error(`Erreur lors de la récupération de l'adapter (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération de l\'adapter:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 