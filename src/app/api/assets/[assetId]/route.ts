import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';
import { getAuthConfigFromHeaders } from '@/lib/auth';

const getBaseUrl = (request: Request) => {
  const authConfig = getAuthConfigFromHeaders(request.headers);
  if (!authConfig) throw new Error('Non authentifié');
  return `https://${authConfig.iedIp}/iih-essentials`;
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function GET(
  request: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const assetId = await Promise.resolve(params.assetId);
    const url = new URL(request.url);
    const includeChildren = url.searchParams.get('includeChildren') === 'true';

    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const response = await nodeFetch(
      `${getBaseUrl(request)}/AssetService/Assets/${assetId === '0' ? 'Root' : assetId}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''}`,
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
      
      // Si l'asset n'est pas trouvé, retourner un tableau vide de children
      if (response.status === 404) {
        return NextResponse.json({ children: [] });
      }
      
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

export async function POST(request: Request, { params }: { params: { assetId: string } }) {
    try {
        const data = await request.json();
        
        // Votre logique d'importation existante
        const authConfig = getAuthConfigFromHeaders(request.headers);
        if (!authConfig) {
            return new Response(JSON.stringify({ error: 'Non authentifié' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in POST:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
} 