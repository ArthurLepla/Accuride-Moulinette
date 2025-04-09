import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { extractRouteParams } from '@/lib/route-helper';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = extractRouteParams(params);
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
    
    const url = `https://${config.iedIp}/DataService/Variables?assetId=${id}`;
    console.log('Tentative de connexion à:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`,
        'Host': config.iedIp
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = extractRouteParams(params);
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
    const assetId = id;
    const updateData = await request.json();
    
    let baseUrl = config.baseUrl;
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl.replace('http://', '');
    }
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Variables/${assetId}`;
    console.log('Tentative de mise à jour:', url);
    console.log('Données de mise à jour:', updateData);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la mise à jour de la variable (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
  }
} 