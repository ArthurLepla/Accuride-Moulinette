import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import https from 'https';
import nodeFetch from 'node-fetch';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const adapterId = params.id;

    console.log('Récupération des connections pour l\'adapter:', adapterId);

    const url = `https://${config.iedIp}/DataService/Adapters/${adapterId}/browse`;
    console.log('URL de requête:', url);

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

    console.log('Statut de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', {
        status: response.status,
        body: errorText
      });
      throw new Error(`Erreur lors de la récupération des connections (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Données brutes récupérées:', data);

    // Extraire les connectionNames et tags uniques
    const connections = new Map();
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((tag: any) => {
        if (tag.connectionName && !connections.has(tag.connectionName)) {
          connections.set(tag.connectionName, {
            connectionName: tag.connectionName,
            tags: []
          });
        }
        
        if (tag.connectionName) {
          const connection = connections.get(tag.connectionName);
          connection.tags.push({
            name: tag.tagName,
            type: tag.tagType,
            dataType: tag.dataType || tag.tagType,
            topic: tag.topic
          });
        }
      });
    }

    const formattedResponse = {
      connections: Array.from(connections.values())
    };

    console.log('Réponse formatée:', formattedResponse);

    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    return NextResponse.json(formattedResponse);
  } catch (error) {
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors de la récupération des connections:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 