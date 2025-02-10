import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';
import { getAuthConfigFromHeaders } from '@/lib/auth';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function GET(
  request: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const assetId = await Promise.resolve(params.assetId);
    const url = new URL(request.url);
    const includeChildren = url.searchParams.get('includeChildren') === 'true';

    const response = await nodeFetch(
      `https://${authConfig.iedIp}/iih-essentials/AssetService/Assets/${assetId}${includeChildren ? '?includeChildren=true' : ''}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.authToken}`,
          'Host': authConfig.iedIp
        },
        agent: httpsAgent
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur récupération asset ${assetId}:`, {
        status: response.status,
        body: errorText
      });
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
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

    console.log('Données reçues pour création asset:', data);

    const formattedData = {
      name: data.name,
      parentId: data.parentId,
      type: data.type,
      description: data.description || '',
      locked: false,
      aspects: []
    };

    console.log('Données formatées pour IIH:', formattedData);

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
      console.error('Erreur lors de la création de l\'asset:', errorText);
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Asset créé avec succès:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 