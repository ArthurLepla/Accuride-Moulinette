import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';
import { getAuthConfigFromHeaders, getBaseUrl } from '@/lib/auth';
import { headers } from 'next/headers';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Log conditionnel qui ne s'affiche que si le mode debug est activé
function logDebug(message: string, data?: any) {
  // On peut activer/désactiver les logs de debug en modifiant cette condition
  const DEBUG = false;
  if (DEBUG) {
    if (data) {
      console.log(`[DEBUG API] ${message}`, data);
    } else {
      console.log(`[DEBUG API] ${message}`);
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await Promise.resolve(params.id);
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
    const includeChildren = request.url.includes('includeChildren=true');
    
    const url = `https://${config.iedIp}/iih-essentials/AssetService/Assets/${id}${includeChildren ? '?includeChildren=true' : ''}`;
    logDebug('Tentative de connexion à', url);

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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la récupération de l'asset (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error(`❌ Erreur récupération asset ${id}:`, error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    logDebug('Données reçues pour création asset', data);

    const formattedData = {
      name: data.name,
      parentId: data.parentId,
      type: data.type,
      description: data.description || '',
      locked: false,
      aspects: []
    };

    logDebug('Données formatées pour IIH', formattedData);

    const response = await nodeFetch(
      `https://${authConfig.iedIp}/iih-essentials/AssetService/Assets`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.authToken}`,
          'Host': authConfig.iedIp
        },
        agent: httpsAgent,
        body: JSON.stringify(formattedData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`⚠️ Erreur création asset ${data.name}:`, response.status, errorText);
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log(`✅ Asset créé: ${responseData.name} (${responseData.assetId})`);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('❌ Erreur proxy API:', error.message);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 