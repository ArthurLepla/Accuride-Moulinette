import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import http from 'http';

// Fonction utilitaire pour extraire récursivement tous les nœuds de type 'Variable' ou 'tag'
function extractTags(node: any): any[] {
  let tags: any[] = [];
  if (Array.isArray(node)) {
    node.forEach(child => {
      tags = tags.concat(extractTags(child));
    });
  } else if (node && typeof node === 'object') {
    if (node.type === 'Variable' || node.type === 'tag') {
      tags.push({
        id: node.id || node.nodeId || node.name,
        name: node.name,
        ...node
      });
    }
    if (node.children && Array.isArray(node.children)) {
      tags = tags.concat(extractTags(node.children));
    }
    if (node.nodes && Array.isArray(node.nodes)) {
      tags = tags.concat(extractTags(node.nodes));
    }
  }
  return tags;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('API Browse - Début de la requête pour l\'adapter:', params.id);
  
  // Désactiver temporairement la vérification SSL pour les tests
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  try {
    const adapterId = params.id;
    if (!adapterId) {
      console.error('API Browse - ID d\'adapter manquant');
      return NextResponse.json({ error: 'ID d\'adapter manquant' }, { status: 400 });
    }
    
    // Récupérer la configuration d'authentification
    const headersList = await headers();
    const authConfigHeader = headersList.get('x-auth-config');
    if (!authConfigHeader) {
      console.error('API Browse - Configuration d\'authentification manquante');
      return NextResponse.json({ error: 'Configuration d\'authentification manquante' }, { status: 400 });
    }
    
    // Décoder et afficher la configuration pour faciliter le débogage
    const authConfig = JSON.parse(authConfigHeader);
    console.log('API Browse - Configuration reçue:', {
      baseUrl: authConfig.baseUrl,
      tokenLength: authConfig.token?.length || 0
    });
    
    // Utiliser directement l'URL locale pour les tests
    // Remplacer l'URL si elle contient 127.0.0.1:4302 ou iih-essentials
    let baseUrl = authConfig.baseUrl;
    if (baseUrl.includes('127.0.0.1:4302') || baseUrl.includes('iih-essentials')) {
      console.log('API Browse - Remplacement de l\'URL:', baseUrl, '→ http://localhost:4203');
      baseUrl = 'http://localhost:4203';
    }
    
    // Construire l'URL complète
    const url = `${baseUrl}/DataService/Adapters/${adapterId}/browse`;
    console.log('API Browse - URL finale:', url);
    
    // Effectuer la requête pour explorer les nœuds de l'adapter
    if (typeof authConfig.token === 'string') {
      console.log('API Browse - Envoi de la requête avec token:', authConfig.token.substring(0, 5) + '...');
    } else {
      console.warn('API Browse - Le token est manquant ou non valide:', authConfig.token);
    }
    
    // Augmenter le délai d'attente pour la navigation qui peut prendre du temps
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 seconds
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authConfig.token}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Browse - Erreur ${response.status}:`, errorText);
      return NextResponse.json({ error: `Erreur lors de la requête: ${response.statusText}`, details: errorText }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('API Browse - Structure brute:', JSON.stringify(data).substring(0, 500));

    // Cas 1 : tags à plat
    if (Array.isArray(data.tags)) {
      return NextResponse.json({ tags: data.tags });
    }

    // Cas 2 : topics -> tags
    if (Array.isArray(data.topics)) {
      const allTags = data.topics.flatMap((topic: any) =>
        Array.isArray(topic.tags)
          ? topic.tags.map((tag: any) => ({
              ...tag,
              connectionName: topic.connectionName || tag.connectionName
            }))
          : []
      );
      return NextResponse.json({ tags: allTags });
    }

    // Sinon, rien trouvé
    console.warn('API Browse - Pas de champ tags ni topics dans la réponse:', data);
    return NextResponse.json({ tags: [] });
  } catch (error) {
    console.error('API Browse - Exception:', error);
    const message = error instanceof Error 
      ? error.message 
      : (error instanceof DOMException && error.name === 'AbortError')
        ? 'La requête a été interrompue après le délai d\'attente'
        : String(error);
        
    return NextResponse.json({ error: `Exception: ${message}` }, { status: 500 });
  } finally {
    // Réactiver la vérification SSL
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.log('API Browse - Fin de la requête');
  }
} 