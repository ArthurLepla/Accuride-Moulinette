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

export async function POST(request: Request) {
  try {
    const authConfig = getAuthConfigFromHeaders(request.headers);
    if (!authConfig) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Données reçues pour création agrégation:', data);

    // Valider les paramètres
    if (!data.sourceId || !data.aggregation || !data.cycle) {
      return NextResponse.json(
        { error: 'Paramètres manquants: sourceId, aggregation et cycle sont requis' },
        { status: 400 }
      );
    }

    // Valider les valeurs autorisées
    const validBases = ['second', 'minute', 'hour', 'day', 'month'];
    if (!validBases.includes(data.cycle.base)) {
      return NextResponse.json(
        { error: `Base invalide. Valeurs autorisées: ${validBases.join(', ')}` },
        { status: 400 }
      );
    }

    // Adapter les données au format attendu par l'API IIH
    const iihAggregationData = {
      sourceId: data.sourceId,
      aggregation: data.aggregation,
      cycle: {
        base: data.cycle.base,
        factor: data.cycle.factor
      },
      provideAsVariable: data.provideAsVariable || false
    };

    console.log('Données formatées pour IIH:', iihAggregationData);

    const response = await nodeFetch(
      `${getBaseUrl(request)}/DataService/Aggregations`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.authToken}`,
          'Host': authConfig.iedIp
        },
        agent: httpsAgent,
        body: JSON.stringify(iihAggregationData)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur création agrégation:', {
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