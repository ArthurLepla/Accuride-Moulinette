import { NextResponse } from 'next/server';
import { IIHAssetBase, IIHAssetResponse } from '@/types/assets';
import { headers } from 'next/headers';
import https from 'https';
import nodeFetch from 'node-fetch';

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

    // Utiliser le bon endpoint pour les assets
    const apiUrl = `https://${authConfig.iedIp}/iih-essentials/AssetService/Assets/0?includeChildren=true`;

    console.log('Requête à l\'API pour les assets:', {
      url: apiUrl,
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
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    
    // Utiliser le bon endpoint pour la création d'assets
    const apiUrl = `https://${authConfig.iedIp}/iih-essentials/AssetService/Assets`;

    console.log('Requête de création d\'asset avec la configuration:', {
      url: apiUrl,
      iedIp: authConfig.iedIp,
      hasToken: !!authConfig.authToken,
      body
    });

    // Créer un agent HTTPS qui ignore la vérification des certificats
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    // Utiliser node-fetch avec notre agent HTTPS personnalisé
    const response = await nodeFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`
      },
      body: JSON.stringify(body),
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
        { error: `Erreur lors de la création de l'asset: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors de la création d\'un asset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
} 