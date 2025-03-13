import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import https from 'https';
import nodeFetch from 'node-fetch';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function GET() {
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
    
    const url = `https://${config.iedIp}/iih-essentials/AssetService/Assets/Root`;
    console.log('Tentative de connexion à:', url);

    const response = await nodeFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`,
        'Host': config.iedIp
      },
      agent: httpsAgent
    });

    console.log('Statut de la réponse:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        headers: Object.fromEntries(response.headers),
        errorText: errorText
      });
      throw new Error(`Erreur lors de la récupération de l'asset racine (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération de l\'asset racine:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 