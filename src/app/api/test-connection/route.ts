import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuthConfigFromHeaders } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Récupérer la configuration d'authentification des en-têtes HTTP
    const headersList = await headers();
    const authConfigHeader = headersList.get('x-auth-config');
    
    if (!authConfigHeader) {
      return NextResponse.json(
        { success: false, message: 'Configuration d\'authentification manquante' },
        { status: 401 }
      );
    }

    // Analyser la configuration d'authentification
    const authConfig = JSON.parse(authConfigHeader);
    
    if (!authConfig?.baseUrl || !authConfig?.authToken) {
      return NextResponse.json(
        { success: false, message: 'Configuration d\'authentification incomplète' },
        { status: 400 }
      );
    }

    // Construire l'URL complète avec le baseUrl fourni dans la configuration
    const url = `https://${authConfig.iedIp}/iih-essentials/AssetService/Assets/Root`;
    console.log(`Test de connexion à l'URL: ${url}`);

    // Désactiver temporairement la vérification SSL pour les tests
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.authToken}`
      }
    });

    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, message: `Erreur de connexion: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: `Connexion réussie à ${authConfig.baseUrl} !`,
      data
    });
  } catch (error) {
    // Réactiver la vérification SSL en cas d'erreur
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    
    console.error('Erreur lors du test de connexion:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur lors du test de connexion'
      },
      { status: 500 }
    );
  }
} 