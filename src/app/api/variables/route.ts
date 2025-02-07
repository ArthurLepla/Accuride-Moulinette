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
    console.log('Données reçues pour création variable:', data);

    // Déterminer le type de données en fonction du nom de la variable
    let dataType = 'FLOAT';  // Par défaut en FLOAT (float32)
    if (data.variableName.toLowerCase().includes('etatcapteur')) {
      dataType = 'STRING';  // Pour les variables EtatCapteur, on utilise STRING
    }

    const iihVariableData = {
      variableName: data.variableName,
      assetId: data.assetId,
      description: data.description || '',
      unit: data.unit || '',
      dataType: dataType
    };

    console.log('Données formatées pour IIH:', iihVariableData);

    const response = await nodeFetch(
      `${getBaseUrl(request)}/DataService/Variables`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.authToken}`,
          'Host': authConfig.iedIp
        },
        agent: httpsAgent,
        body: JSON.stringify(iihVariableData)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Erreur création variable:', {
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
    console.log('Variable créée avec succès:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 