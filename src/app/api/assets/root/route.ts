import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import https from 'https';
import nodeFetch from 'node-fetch';

export async function GET(request: Request) {
  // Désactiver temporairement la vérification SSL pour les tests
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    // Récupérer la configuration d'authentification des en-têtes HTTP
    const headersList = await headers();
    const authConfigHeader = headersList.get('x-auth-config');
    
    if (!authConfigHeader) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; // Réactiver la vérification SSL
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    // Analyser la configuration d'authentification
    const authConfig = JSON.parse(authConfigHeader);
    
    if (!authConfig?.baseUrl || !authConfig?.authToken) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'; // Réactiver la vérification SSL
      return NextResponse.json(
        { error: 'Configuration d\'authentification incomplète' },
        { status: 400 }
      );
    }

    // Récupérer les paramètres de la requête
    const url = new URL(request.url);
    const includeChildren = url.searchParams.get('includeChildren') || 'false';
    const includeBreadcrumb = url.searchParams.get('includeBreadcrumb') || 'false';

    // Utiliser le bon endpoint pour l'asset racine avec la structure de l'URL correcte
    // Note: l'URL doit inclure /iih-essentials/ pour les installations sur IED
    const apiUrl = `https://${authConfig.iedIp}/iih-essentials/AssetService/Assets/Root?includeChildren=${includeChildren}&includeBreadcrumb=${includeBreadcrumb}`;

    console.log('Requête à l\'API pour le root asset:', {
      url: apiUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.authToken
    });

    // Créer un agent HTTPS qui ignore la vérification des certificats
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    // Utiliser node-fetch avec notre agent HTTPS personnalisé
    const response = await nodeFetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`
      },
      agent: httpsAgent
    });

    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse de l\'API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: apiUrl
      });
      return NextResponse.json(
        { error: `Erreur lors de la récupération de l'asset racine: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors de la récupération de l\'asset racine:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 