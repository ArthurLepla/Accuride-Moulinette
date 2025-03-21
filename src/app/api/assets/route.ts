import { NextResponse } from 'next/server';
import { IIHAssetBase, IIHAssetResponse } from '@/types/assets';
import { getAuthConfigFromHeaders } from '@/lib/auth';

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

export async function GET(request: Request) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Utiliser directement l'URL fournie dans la configuration d'authentification
    const apiUrl = `${authConfig.baseUrl}/AssetService/Assets/0?includeChildren=true`;

    console.log('Requête à l\'API Siemens pour les assets:', {
      url: apiUrl,
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

    const body = await request.json();
    
    // Utiliser directement l'URL fournie dans la configuration d'authentification
    const apiUrl = `${authConfig.baseUrl}/AssetService/Assets`;

    console.log('Requête de création d\'asset avec la configuration:', {
      url: apiUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.authToken,
      body
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse de l\'API Siemens:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: `Erreur lors de la création de l'asset: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la création d\'un asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 