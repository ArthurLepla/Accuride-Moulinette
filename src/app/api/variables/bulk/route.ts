import { NextResponse } from 'next/server';
import https from 'https';
import http from 'http';
import nodeFetch from 'node-fetch';
import { headers } from 'next/headers';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const httpAgent = new http.Agent();

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
    const variables = await request.json();

    if (!Array.isArray(variables)) {
      return NextResponse.json(
        { error: 'Format invalide. Un tableau de variables est attendu.' },
        { status: 400 }
      );
    }

    console.log(`Création en masse de ${variables.length} variables`);

    // Vérifier les champs requis et préparer les données pour l'API IIH
    const invalidVariables: Array<{
      variable: any;
      missing: string[];
    }> = [];
    const iihVariables = variables.map(variable => {
      // Vérification des champs requis
      if (!variable.variableName || !variable.assetId) {
        const missing = [];
        if (!variable.variableName) missing.push('variableName');
        if (!variable.assetId) missing.push('assetId');
        
        console.warn(`⚠️ Variable invalide: champs manquants [${missing.join(', ')}]:`, variable);
        invalidVariables.push({
          variable,
          missing
        });
        return null;
      }

      // Log pour le mapping de type de données
      const mappedDataType = mapDataType(variable.dataType || 'Float');
      if (mappedDataType !== variable.dataType) {
        console.log(`Conversion du type de données: ${variable.dataType} -> ${mappedDataType} pour ${variable.variableName}`);
      }

      // Préparer l'objet de base
      const iihVar: any = {
        variableName: variable.variableName,
        assetId: variable.assetId,
        description: variable.description || '',
        dataType: mappedDataType,
        store: true
      };
      
      // Ajouter l'unité si spécifiée
      if (variable.unit) {
        iihVar.unit = variable.unit;
      }
      
      // Configuration selon le type de source
      if (variable.sourceType === 'Rule') {
        // Configuration pour les règles
        iihVar.sourceType = 'Rule';
        
        if (variable.formula) {
          iihVar.formula = variable.formula;
          
          // Ajouter la propriété rule requise par l'API IIH
          iihVar.rule = {
            formula: variable.formula,
            tags: [] // Tableau vide requis par l'API
          };
        } else if (variable.rule && variable.rule.formula) {
          // Si formula n'est pas directement définie mais existe dans rule
          iihVar.formula = variable.rule.formula;
          iihVar.rule = {
            ...variable.rule,
            tags: variable.rule.tags || [] // Assurer que tags existe
          };
        } else {
          console.warn(`⚠️ Variable de type Rule sans formule: ${variable.variableName}`);
          invalidVariables.push({
            variable,
            missing: ['formula ou rule.formula']
          });
          return null;
        }
      } else {
        // Configuration par défaut ou pour les tags
        iihVar.sourceType = variable.sourceType || 'Tag';
        
        // Ajouter les propriétés spécifiques aux tags si nécessaire
        if (iihVar.sourceType === 'Tag') {
          iihVar.adapterId = variable.adapterId || "913c0a4389d24496bb5222368d573b1b";
          iihVar.connectionName = variable.connectionName || 
                                variable.assetName || 
                                variable.variableName.split('_').pop();
          
          // Déterminer le tag en fonction du type de variable
          if (variable.topic) {
            // Utiliser le topic spécifié s'il existe
            iihVar.topic = variable.topic;
          } else if (variable.variableName.includes('Etat_capteur')) {
            iihVar.topic = "etat";
          } else if (variable.variableName.includes('Production_kg')) {
            iihVar.topic = "prod_kg";
          } else if (variable.variableName.includes('Production')) {
            iihVar.topic = "prod";
          } else if (variable.variableName.includes('IPE_kg')) {
            iihVar.topic = "ipe_kg";
          } else if (variable.variableName.includes('IPE')) {
            iihVar.topic = "ipe";
          } else {
            // Par défaut pour les variables de consommation
            iihVar.topic = "conso";
          }
          
          // Configuration supplémentaire pour les tags
          iihVar.tag = {
            adapterId: iihVar.adapterId,
            connectionName: iihVar.connectionName,
            tagName: iihVar.topic,
            dataType: mappedDataType
          };
        }
      }
      
      return iihVar;
    }).filter(v => v !== null);

    if (iihVariables.length === 0) {
      console.error('Aucune variable valide à créer sur les', variables.length, 'variables reçues');
      if (invalidVariables.length > 0) {
        console.error(`${invalidVariables.length} variables invalides détectées:`, 
          invalidVariables.slice(0, 3).map(iv => ({ 
            name: iv.variable.variableName || '[nom manquant]',
            missing: iv.missing
          }))
        );
      }
      return NextResponse.json(
        { 
          error: 'Aucune variable valide à créer',
          invalidVariables: invalidVariables.map(iv => ({ 
            name: iv.variable.variableName || '[nom manquant]',
            missing: iv.missing
          }))
        },
        { status: 400 }
      );
    }

    // Log détaillé des 3 premières variables pour debug
    console.log('Échantillon des variables à créer:');
    iihVariables.slice(0, 3).forEach((v, i) => {
      console.log(`Variable ${i+1}:`, JSON.stringify(v, null, 2));
    });

    // Construire l'URL correctement à partir du baseUrl dans la config
    let baseUrl = config.baseUrl;
    // S'assurer que le protocole est explicitement défini
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'http://' + baseUrl;  // Forcer HTTP si non spécifié
    }
    // Supprimer le slash final si présent
    baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    const url = `${baseUrl}/DataService/Variables/Bulk/Create`;
    console.log('URL de création en masse:', url);

    // Déterminer quel agent utiliser selon le protocole
    const agent = baseUrl.startsWith('https') ? httpsAgent : httpAgent;

    // Logs de débogage supplémentaires
    console.log('Configuration complète de la requête:', {
      url,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // Ne pas afficher le token complet pour des raisons de sécurité
        Authorization: 'Bearer ' + (config.authToken?.substring(0, 10) + '...')
      },
      agentType: baseUrl.startsWith('https') ? 'HTTPS Agent (rejectUnauthorized: false)' : 'HTTP Agent',
      bodySize: JSON.stringify(iihVariables).length
    });

    try {
      const response = await nodeFetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.authToken}`
          // Header Host supprimé pour éviter les conflits avec l'URL
        },
        agent: agent,
        body: JSON.stringify(iihVariables),
        redirect: 'follow', // Suivre les redirections si nécessaire
        timeout: 30000 // Timeout après 30 secondes
      });

      console.log('Statut de la réponse:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de réponse IIH:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          body: errorText.substring(0, 500) // Limiter la taille pour les logs
        });
        return NextResponse.json(
          { error: `Erreur API IIH: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const responseData = await response.json();
      console.log('Création en masse terminée:', {
        total: variables.length,
        created: responseData.results?.length || 0,
        errors: responseData.errors?.length || 0
      });

      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      return NextResponse.json(responseData);
    } catch (networkError: any) {
      console.error('Erreur réseau lors de la connexion à l\'API IIH:', {
        message: networkError.message,
        url: url,
        stack: networkError.stack
      });
      
      return NextResponse.json(
        { 
          error: `Erreur de connexion à l'API IIH: ${networkError.message}`,
          url: url,
          details: "Vérifiez que l'URL est correcte et que le service est accessible"
        },
        { status: 502 }
      );
    }
  } catch (error) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    console.error('Erreur lors de la création en masse des variables:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 