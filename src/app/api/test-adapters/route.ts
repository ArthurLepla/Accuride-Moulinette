import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { IIHApi } from '@/modules/simple-importer/api';

export async function GET() {
  console.log('Test Adapters API - Début de la requête');
  
  // Désactiver temporairement la vérification SSL pour les tests
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    // Récupérer la configuration d'authentification des en-têtes HTTP
    const headersList = await headers();
    const authConfigHeader = headersList.get('x-auth-config');
    
    if (!authConfigHeader) {
      console.error('Test Adapters API - Aucune configuration d\'authentification trouvée dans les en-têtes');
      // Retourner des données mock pour permettre le développement
      return NextResponse.json(generateMockAdapters('no-auth'));
    }
    
    // Analyser la configuration d'authentification
    const authConfig = JSON.parse(authConfigHeader);
    console.log('Test Adapters API - Configuration d\'authentification:', {
      baseUrl: authConfig?.baseUrl,
      hasToken: !!authConfig?.token,
      tokenLength: authConfig?.token?.length || 0
    });
    
    if (!authConfig?.baseUrl || !authConfig?.token) {
      console.warn('Test Adapters API - Configuration d\'authentification incomplète');
      return NextResponse.json(generateMockAdapters('invalid-auth'));
    }
    
    try {
      // Utiliser la classe IIHApi existante pour récupérer les adapters
      const api = new IIHApi(authConfig);
      console.log('Test Adapters API - Utilisation de IIHApi avec baseUrl:', authConfig.baseUrl);
      
      const adapters = await api.getAdapters();
      console.log('Test Adapters API - Adapters récupérés via IIHApi:', Array.isArray(adapters) ? adapters.length : 'non-array');
      
      // Si nous avons des données, les renvoyer
      if (adapters && Array.isArray(adapters) && adapters.length > 0) {
        return NextResponse.json(adapters);
      }
      
      // Si nous n'avons pas réussi à récupérer des adapters, faire une tentative directe
      console.log('Test Adapters API - Tentative directe via fetch');
      const url = `${authConfig.baseUrl}/DataService/Adapters`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authConfig.token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Test Adapters API - Erreur HTTP ${response.status}:`, response.statusText);
        return NextResponse.json(generateMockAdapters('http-error'));
      }
      
      const data = await response.json();
      console.log('Test Adapters API - Structure de la réponse directe:', 
        Object.keys(data), 
        data.adapters ? `adapters array: ${data.adapters.length}` : 'no adapters property'
      );
      
      // Vérifier si la réponse contient une propriété 'adapters' (structure documentée IIH)
      // ou si c'est déjà un tableau d'adapters
      const adaptersResult = data.adapters || (Array.isArray(data) ? data : []);
      
      if (adaptersResult.length === 0) {
        console.warn('Test Adapters API - Aucun adapter trouvé dans la réponse, utilisation des données mock');
        return NextResponse.json(generateMockAdapters('empty-response'));
      }
      
      // Formater les données pour l'interface utilisateur
      const formattedAdapters = adaptersResult.map((adapter: any) => ({
        id: adapter.id,
        name: adapter.name || adapter.id,
        type: adapter.type || 'Unknown',
        status: adapter.connected ? 'Connected' : 'Disconnected',
        isDefault: adapter.isDefault || false,
        canBrowse: adapter.canBrowse || false
      }));
      
      return NextResponse.json(formattedAdapters);
    } catch (apiError) {
      console.error('Test Adapters API - Erreur lors de l\'utilisation d\'IIHApi:', apiError);
      return NextResponse.json(generateMockAdapters('api-error'));
    }
  } catch (error) {
    console.error('Test Adapters API - Exception:', error);
    return NextResponse.json(generateMockAdapters('exception'));
  } finally {
    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.log('Test Adapters API - Fin de la requête');
  }
}

function generateMockAdapters(reason: string) {
  console.log(`Test Adapters API - Génération d'adapters mock (raison: ${reason})`);
  return [
    { 
      id: 'mock-adapter-1', 
      name: 'OPC UA Mock Adapter', 
      type: 'OPC UA',
      status: 'Mock', 
      isDefault: true,
      canBrowse: true
    },
    { 
      id: 'mock-adapter-2', 
      name: 'MQTT Mock Adapter', 
      type: 'MQTT',
      status: 'Mock',
      isDefault: false,
      canBrowse: true
    },
    { 
      id: 'mock-adapter-3', 
      name: 'REST Mock Adapter', 
      type: 'REST',
      status: 'Mock',
      isDefault: false,
      canBrowse: true
    }
  ];
} 