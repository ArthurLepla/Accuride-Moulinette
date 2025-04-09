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
    console.log('Données reçues pour création agrégation:', data);

    const response = await nodeFetch(
      `https://${authConfig.iedIp}/iih-essentials/DataService/Aggregations`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.authToken}`,
          'Host': authConfig.iedIp
        },
        agent: httpsAgent,
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur création agrégation:', {
        status: response.status,
        body: errorText
      });
      return NextResponse.json(
        { error: `Erreur API: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Agrégation créée avec succès:', responseData);
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
    
    // Récupérer les paramètres de requête
    const url = new URL(request.url);
    const sourceIds = url.searchParams.get('sourceIds');
    
    console.log('Paramètres de requête pour agrégations:', {
      sourceIds,
      url: request.url
    });
    
    if (!authConfig.iedIp) {
      return NextResponse.json(
        { error: 'adresse IP du serveur manquante dans la configuration' },
        { status: 400 }
      );
    }
    
    // Construire l'URL avec les paramètres
    let apiUrl = `https://${authConfig.iedIp}/iih-essentials/DataService/Aggregations`;
    
    // Gérer correctement le paramètre sourceIds
    let sourceIdsArray: string[] = [];
    if (sourceIds) {
      try {
        // Tenter de parser le paramètre sourceIds
        sourceIdsArray = JSON.parse(sourceIds);
        if (Array.isArray(sourceIdsArray) && sourceIdsArray.length > 0) {
          // Construire l'URL avec le paramètre sourceIds correctement formaté
          // Chaque ID doit être ajouté comme paramètre séparé
          sourceIdsArray.forEach((id, index) => {
            const separator = index === 0 ? '?' : '&';
            apiUrl += `${separator}sourceIds=${encodeURIComponent(id)}`;
          });
          console.log('URL après ajout des sourceIds:', apiUrl);
        }
      } catch (error) {
        console.error('Erreur lors du parsing des sourceIds:', error);
      }
    }
    
    console.log('Tentative de connexion à:', apiUrl);

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

    console.log('Statut de la réponse des agrégations:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse agrégations:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        errorText: errorText
      });
      return NextResponse.json(
        { error: `Erreur lors de la récupération des agrégations (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    // Traiter la réponse
    let data;
    const responseText = await response.text();
    try {
      data = responseText ? JSON.parse(responseText) : [];
      
      // Si la réponse n'est pas un tableau, vérifier d'autres structures possibles
      if (!Array.isArray(data)) {
        console.warn('Réponse non attendue de l\'API d\'agrégations:', data);
        if (data && Array.isArray(data.aggregations)) {
          data = data.aggregations;
        } else if (data && typeof data === 'object') {
          // Tenter d'extraire un tableau
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            data = possibleArrays[0];
          } else {
            data = [];
          }
        } else {
          data = [];
        }
      }
      
      // S'assurer que les données sont bien un tableau
      if (!Array.isArray(data)) {
        data = [];
      }
      
      // Filtrer les résultats par sourceId si nécessaire
      if (sourceIdsArray.length > 0) {
        console.log(`Filtrage des agrégations par sourceIds: ${sourceIdsArray.join(', ')}`);
        data = data.filter((aggregation: any) => 
          sourceIdsArray.includes(aggregation.sourceId)
        );
      }
      
      console.log(`${data.length} agrégations retournées après filtrage`);
    } catch (e) {
      console.error('Erreur lors du parsing de la réponse:', e, 'Texte brut:', responseText);
      data = [];
    }
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération des agrégations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 