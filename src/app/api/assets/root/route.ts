import { NextResponse } from 'next/server';
import { getAuthConfigFromHeaders } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les paramètres de la requête
    const url = new URL(request.url);
    const includeChildren = url.searchParams.get('includeChildren') || 'false';
    const includeBreadcrumb = url.searchParams.get('includeBreadcrumb') || 'false';

    // Utiliser directement l'URL fournie dans la configuration d'authentification
    const apiUrl = `${authConfig.baseUrl}/AssetService/Assets/Root?includeChildren=${includeChildren}&includeBreadcrumb=${includeBreadcrumb}`;

    console.log('Requête à l\'API Siemens pour le root asset:', {
      url: apiUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.authToken
    });

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse de l\'API Siemens:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: `Erreur lors de la récupération de l'asset racine: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'asset racine:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 