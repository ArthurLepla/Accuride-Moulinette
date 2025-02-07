import { NextResponse } from 'next/server';
import https from 'https';
import { IIHAssetBase, IIHAssetResponse } from '@/types/assets';
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

export async function GET(request: Request) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const response = await nodeFetch(
      `${getBaseUrl(request)}/AssetService/Assets/0?includeChildren=true`,
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
      const errorData = await response.text();
      console.error('Réponse API complète:', errorData);
      throw new Error(`Erreur API: ${response.status} - ${errorData}`);
    }

    const rawData = await response.json();
    
    // Transformation des données au format attendu
    const transformedData: IIHAssetResponse = {
      assets: [{
        assetId: '0',
        name: rawData.name || 'edge',
        parentId: '',
        hasChildren: true,
        sortOrder: -1
      }, ...(rawData.children || []).map((asset: any) => ({
        assetId: asset.id || asset.assetId,
        name: asset.name,
        parentId: asset.parentId || '0',
        hasChildren: asset.hasChildren || false,
        sortOrder: asset.sortOrder || -1
      }))]
    };

    return NextResponse.json(transformedData);
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
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Donn��es reçues pour création asset:', data);

    // Adapter les données au format attendu par l'API IIH
    const iihAssetData = {
      name: data.name,
      parentId: data.parentId,
      type: data.type,
      description: data.description || '',
      locked: false,
      aspects: []
    };

    console.log('Données formatées pour IIH:', iihAssetData);

    const response = await nodeFetch(
      `${getBaseUrl(request)}/AssetService/Assets`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.authToken}`,
          'Host': authConfig.iedIp
        },
        agent: httpsAgent,
        body: JSON.stringify(iihAssetData)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur création asset:', {
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: errorData
      });
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorData}` },
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