import { NextResponse } from 'next/server';
import https from 'https';
import nodeFetch from 'node-fetch';
import { getAuthConfigFromHeaders } from '@/lib/auth';
import { headers } from 'next/headers';

const getBaseUrl = (request: Request) => {
  const authConfig = getAuthConfigFromHeaders(request.headers);
  if (!authConfig) throw new Error('Non authentifié');
  return `https://${authConfig.iedIp}/iih-essentials`;
};

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Fonction pour mapper les types de données
function mapDataType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'BOOL': 'Bool',
    'INT8': 'Int8',
    'INT16': 'Int16',
    'INT32': 'Int32',
    'INT64': 'Int64',
    'UINT8': 'UInt8',
    'UINT16': 'UInt16',
    'UINT32': 'UInt32',
    'UINT64': 'UInt64',
    'FLOAT': 'Float',
    'FLOAT32': 'Float',
    'FLOAT64': 'Double',
    'DOUBLE': 'Double',
    'STRING': 'String',
    'DATE': 'Date',
    'TIMESPAN': 'TimeSpan',
    'BLOB': 'Blob'
  };
  return typeMap[type.toUpperCase()] || type;
}

export async function POST(request: Request) {
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
    const variable = await request.json();

    console.log('Création de variable - Données reçues:', variable);

    // Vérifier les champs requis
    if (!variable.variableName || !variable.assetId) {
      console.error('Champs requis manquants:', { variableName: variable.variableName, assetId: variable.assetId });
      return NextResponse.json(
        { error: 'variableName et assetId sont requis' },
        { status: 400 }
      );
    }

    // Construire l'objet de variable pour l'API IIH
    const iihVariable: Record<string, any> = {
      variableName: variable.variableName,
      assetId: variable.assetId,
      description: variable.description || '',
      unit: variable.unit || '',
      dataType: mapDataType(variable.dataType || 'Float'),
      store: true,
      sourceType: variable.sourceType || 'None'
    };

    // Si le type de source est Tag, ajouter les propriétés du tag
    if (variable.sourceType === 'Tag' && variable.tag) {
      iihVariable.adapterId = variable.tag.adapterId;
      iihVariable.topic = variable.tag.topic;
      iihVariable.connected = false;
      iihVariable.tag = variable.tag;
    }
    
    // Si le type de source est Rule, ajouter les propriétés de règle
    if (variable.sourceType === 'Rule' && variable.rule) {
      iihVariable.rule = variable.rule;
    }

    // Vérifier que le dataType est valide
    const validDataTypes = ['Bool', 'Int8', 'Int16', 'Int32', 'Int64', 'UInt8', 'UInt16', 'UInt32', 'UInt64', 'Float', 'Double', 'String', 'Date', 'TimeSpan', 'Blob'];
    if (!validDataTypes.includes(iihVariable.dataType)) {
      return NextResponse.json(
        { error: `Type de données invalide. Valeurs autorisées : ${validDataTypes.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Données formatées pour IIH:', iihVariable);

    const url = `https://${config.iedIp}/DataService/Variables`;
    console.log('URL de création:', url);

    const response = await nodeFetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`,
        'Host': config.iedIp
      },
      agent: httpsAgent,
      body: JSON.stringify(iihVariable)
    });

    console.log('Statut de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse IIH:', {
        status: response.status,
        body: errorText
      });
      return NextResponse.json(
        { error: `Erreur API IIH: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Variable créée avec succès:', responseData);

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(responseData);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la création de la variable:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
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
    
    let baseUrl = config.baseUrl;
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl.replace('http://', '');
    }
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Variables`;
    console.log('Tentative de connexion à:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      }
    });

    console.log('Statut de la réponse:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur de réponse:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorText: errorText
      });
      throw new Error(`Erreur lors de la récupération des variables (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    return NextResponse.json(data);
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la récupération des variables:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
} 