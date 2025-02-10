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
    const response = await nodeFetch(
      `https://${authConfig.iedIp}/iih-essentials/DataService/Variables?assetId=${assetId}`,
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
      console.error(`Erreur récupération variables pour asset ${assetId}:`, {
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