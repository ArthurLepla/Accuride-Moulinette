import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';
import { getAuthConfigFromHeaders } from '@/lib/auth';
import { headers } from 'next/headers';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function POST(request: Request) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Données reçues pour création de rétention:', data);

    // Vérifier que les données de rétention sont complètes
    if (!data.sourceTypeId || !data.sourceId || !data.settings) {
      return NextResponse.json(
        { error: 'Données de rétention incomplètes (sourceTypeId, sourceId et settings sont requis)' },
        { status: 400 }
      );
    }

    const url = `https://${authConfig.iedIp}/iih-essentials/DataService/DataRetentions`;
    console.log('URL de création de rétention:', url);

    const response = await nodeFetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`,
        'Host': authConfig.iedIp
      },
      agent: httpsAgent,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur création rétention:', {
        status: response.status,
        body: errorText
      });
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // Pour les réponses vides (certaines API IIH renvoient un corps vide pour les opérations réussies)
    let responseData;
    const responseText = await response.text();
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: true, message: "Rétention créée avec succès" };
    } catch (e) {
      console.warn('Réponse non JSON reçue:', responseText);
      responseData = { success: true, message: "Rétention créée avec succès" };
    }

    console.log('Rétention créée avec succès:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Données reçues pour configuration de rétention:', data);

    // Vérifier que les données de rétention sont complètes
    if (!data.sourceTypeId || !data.sourceId || !data.settings) {
      return NextResponse.json(
        { error: 'Données de rétention incomplètes (sourceTypeId, sourceId et settings sont requis)' },
        { status: 400 }
      );
    }

    const url = `https://${authConfig.iedIp}/iih-essentials/DataService/DataRetentions`;
    console.log('URL de configuration de rétention:', url);

    const response = await nodeFetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`,
        'Host': authConfig.iedIp
      },
      agent: httpsAgent,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur configuration rétention:', {
        status: response.status,
        body: errorText
      });
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // Pour les réponses vides (certaines API IIH renvoient un corps vide pour les opérations réussies)
    let responseData;
    const responseText = await response.text();
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: true, message: "Rétention configurée avec succès" };
    } catch (e) {
      console.warn('Réponse non JSON reçue:', responseText);
      responseData = { success: true, message: "Rétention configurée avec succès" };
    }

    console.log('Rétention configurée avec succès:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sourceId = url.searchParams.get('sourceId');
  const sourceTypeId = url.searchParams.get('sourceTypeId') || 'Variable';

  if (!sourceId) {
    return NextResponse.json(
      { error: 'Paramètre sourceId requis' },
      { status: 400 }
    );
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const headersList = await headers();
    const authConfigHeader = headersList.get('x-auth-config');
    
    if (!authConfigHeader) {
      return NextResponse.json(
        { error: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    const authConfig = JSON.parse(authConfigHeader);
    
    if (!authConfig.iedIp) {
      return NextResponse.json(
        { error: 'adresse IP du serveur manquante dans la configuration' },
        { status: 400 }
      );
    }
    
    const apiUrl = `https://${authConfig.iedIp}/iih-essentials/DataService/DataRetentions?sourceTypeId=${sourceTypeId}&sourceId=${sourceId}`;
    console.log('Tentative de récupération de la rétention:', apiUrl);

    const response = await nodeFetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`,
        'Host': authConfig.iedIp
      },
      agent: httpsAgent
    });

    console.log('Statut de la réponse de rétention:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse rétention:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        errorText: errorText
      });
      return NextResponse.json(
        { error: `Erreur lors de la récupération de la rétention (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    // Pour les réponses vides ou différentes structures possibles
    let data;
    const responseText = await response.text();
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      console.error('Erreur de parsing de la réponse:', e, 'Texte brut:', responseText);
      data = null;
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération de la rétention:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 