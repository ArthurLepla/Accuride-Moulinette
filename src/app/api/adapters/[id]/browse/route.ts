import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Configuration de la route Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const adapterId = params.id;

    console.log('Debug - Paramètres reçus:', { 
      adapterId,
      params,
      url: request.url
    });

    console.log('Récupération des connectionNames pour l\'adapter:', adapterId);
    
    const apiUrl = `https://${config.iedIp}/DataService/Adapters/${adapterId}/browse`;
    console.log('Tentative de connexion à:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`
      }
    });

    console.log('Statut de la réponse:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        errorText: errorText
      });
      throw new Error(`Erreur lors de la récupération des connectionNames (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Données reçues de l\'API:', data);
    
    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    return NextResponse.json(data);
  } catch (error) {
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors de la récupération des connectionNames:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 