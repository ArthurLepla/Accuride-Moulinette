import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import https from 'https';
import http from 'http';

export async function GET() {
  console.log('API Adapters - Début de la requête');
  
  // Désactiver temporairement la vérification SSL pour les tests
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    // Récupérer la configuration d'authentification
    const headersList = await headers();
    const authConfigHeader = headersList.get('x-auth-config');
    if (!authConfigHeader) {
      console.error('API Adapters - Configuration d\'authentification manquante');
      return NextResponse.json({ error: 'Configuration d\'authentification manquante' }, { status: 400 });
    }
    
    // Décoder et afficher la configuration pour faciliter le débogage
    const authConfig = JSON.parse(authConfigHeader);
    console.log('API Adapters - Configuration reçue:', {
      baseUrl: authConfig.baseUrl,
      tokenLength: authConfig.token?.length || 0
    });
    
    // Utiliser directement l'URL locale pour les tests
    // Remplacer l'URL si elle contient 127.0.0.1:4302 ou iih-essentials
    let baseUrl = authConfig.baseUrl;
    if (baseUrl.includes('127.0.0.1:4302') || baseUrl.includes('iih-essentials')) {
      console.log('API Adapters - Remplacement de l\'URL:', baseUrl, '→ http://localhost:4203');
      baseUrl = 'http://localhost:4203';
    }
    
    // Construire l'URL complète
    const url = `${baseUrl}/DataService/Adapters`;
    console.log('API Adapters - URL finale:', url);
    
    // Effectuer la requête sans spécifier d'agent
    console.log('API Adapters - Envoi de la requête avec token:', authConfig.token.substring(0, 5) + '...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Adapters - Erreur ${response.status}:`, errorText);
      return NextResponse.json({ error: `Erreur lors de la requête: ${response.statusText}`, details: errorText }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('API Adapters - Succès - Nombre d\'adapters:', data.length);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Adapters - Exception:', error);
    return NextResponse.json({ error: `Exception: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  } finally {
    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.log('API Adapters - Fin de la requête');
  }
} 