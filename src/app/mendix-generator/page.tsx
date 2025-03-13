'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowLeft, X } from 'lucide-react';
import { generateRequiredEntities, generateMendixValidationCode } from './utils/mendixValidator';
import { generateDynamicMendixCode, generateDynamicCleanupCode, MendixEntitySummary } from './utils/codeGenerator';
import AppLayout from '@/components/layout/AppLayout';

interface IIHAsset {
  assetId: string;
  name: string;
  variables?: Array<{
    variableId: string;
    name: string;
    aggregations?: {
      [key: string]: {
        id: string;
        cycle: {
          base: string;
          factor: number;
        };
      };
    };
  }>;
}

interface EntityEntry {
  entity: string;
  attributes: {
    [key: string]: string;
  };
  [key: string]: any;
}

interface RequiredEntityDisplay {
  name: string;
  attributes: Array<{
    name: string;
    type: string;
  }>;
}

export default function MendixGeneratorPage() {
  console.log('MendixGenerator - Page Component Initializing');
  
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [cleanupCode, setCleanupCode] = useState<string>('');
  const [validationCode, setValidationCode] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mendixSummary, setMendixSummary] = useState<MendixEntitySummary | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [requiredEntities, setRequiredEntities] = useState<RequiredEntityDisplay[]>([]);
  const [showEntitiesModal, setShowEntitiesModal] = useState(true);

  const generateMendixSummary = (iihData: any) => {
    console.log('Structure IIH reçue:', JSON.stringify(iihData, null, 2));
    
    const summary: MendixEntitySummary = {
      totalEntities: {},
    };

    // Initialiser les compteurs et tableaux pour chaque niveau
    iihData.hierarchyData.levels.forEach((level: any) => {
      summary.totalEntities[level.name] = 0;
      summary[level.name.toLowerCase() + 's'] = [];
    });

    // Initialiser les compteurs et tableaux pour les entités spéciales
    const specialEntities = ['SmartAggregation_Conso', 'SmartAggregation_Production', 'SmartAggregation_IPE', 'EtatCapteur'];
    specialEntities.forEach(entity => {
      summary.totalEntities[entity] = 0;
      // Convertir les noms des entités spéciales en noms de propriétés
      let propertyName = entity.toLowerCase();
      if (propertyName.startsWith('smartaggregation_')) {
        propertyName = 'aggregations_' + propertyName.replace('smartaggregation_', '');
      } else if (propertyName === 'etatcapteur') {
        propertyName = 'etatCapteurs';
      }
      summary[propertyName] = [];
    });

    // Fonction helper pour créer une entrée d'entité
    const createEntityEntry = (entityName: string, name: string, attributes: any): EntityEntry => ({
      entity: `Smart.${entityName}`,
      attributes: {
        Nom: name,
        TotalConso: '0',
        ...attributes
      }
    });

    // Traiter la hiérarchie
    const processNode = (node: any, parentNodes: any[] = []) => {
      const level = node.metadata.level;
      summary.totalEntities[level]++;

      // Créer les attributs de base
      const attributes: any = {
        Nom: node.name,
        TotalConso: '0'
      };

      // Ajouter les références aux parents
      parentNodes.forEach(parent => {
        attributes[parent.metadata.level] = parent.name;
      });

      // Ajouter des attributs spécifiques si c'est une machine
      if (level === 'Machine') {
        attributes.Identifiant = node.metadata.assetId || node.id;
        attributes.IPE = '0';
        attributes.TypeEnergie = node.metadata.energyType || node.metadata.rawEnergyType || '';
      }

      // Ajouter l'entrée au niveau correspondant
      const entityEntry = createEntityEntry(level, node.name, attributes);
      summary[level.toLowerCase() + 's'].push(entityEntry);

      // Traiter les variables si c'est une machine
      if (level === 'Machine') {
        processVariables(node, summary);
      }
    };

    // Parcourir la hiérarchie et traiter chaque nœud
    const processHierarchy = (nodes: any[], links: any[]) => {
      nodes.forEach(node => {
        const parents = findAllParents(node.id, nodes, links);
        processNode(node, parents);
      });
    };

    // Traiter la hiérarchie complète
    if (iihData.hierarchyData?.nodes && iihData.hierarchyData?.links) {
      processHierarchy(iihData.hierarchyData.nodes, iihData.hierarchyData.links);
    }

    return summary;
  };

  const findAllParents = (nodeId: string, nodes: any[], links: any[]) => {
    const parents = [];
    let currentId = nodeId;

    while (true) {
      const parentLink = links.find(link => link.target === currentId);
      if (!parentLink) break;

      const parentNode = nodes.find(node => node.id === parentLink.source);
      if (!parentNode) break;

      parents.push(parentNode);
      currentId = parentNode.id;
    }

    return parents;
  };

  const processVariables = (node: any, summary: MendixEntitySummary) => {
    // Traiter la variable de consommation
    if (node.metadata.variable) {
      summary.totalEntities.SmartAggregation_Conso++;
      summary.aggregations_conso.push({
        entity: 'Smart.Aggregation_Conso',
        attributes: {
          VariableId: node.metadata.variable.id,
          VariableName: node.metadata.variable.name,
          AssetName: node.name,
          Machine: node.name,
          ...(node.metadata.variable.aggregations?.['5min'] && { Identifiant5Min: node.metadata.variable.aggregations['5min'].id }),
          ...(node.metadata.variable.aggregations?.['1h'] && { Identifiant1h: node.metadata.variable.aggregations['1h'].id }),
          ...(node.metadata.variable.aggregations?.['4h'] && { Identifiant4h: node.metadata.variable.aggregations['4h'].id }),
          ...(node.metadata.variable.aggregations?.['8h'] && { Identifiant8h: node.metadata.variable.aggregations['8h'].id }),
          ...(node.metadata.variable.aggregations?.['1d'] && { Identifiant1day: node.metadata.variable.aggregations['1d'].id })
        }
      });
    }

    // Traiter la variable de production
    if (node.metadata.productionVariable) {
      summary.totalEntities.SmartAggregation_Production++;
      summary.aggregations_production.push({
        entity: 'Smart.Aggregation_Production',
        attributes: {
          VariableId: node.metadata.productionVariable.id,
          VariableName: node.metadata.productionVariable.name,
          AssetName: node.name,
          Machine: node.name,
          ...(node.metadata.productionVariable.aggregations?.['5min'] && { Identifiant5Min: node.metadata.productionVariable.aggregations['5min'].id }),
          ...(node.metadata.productionVariable.aggregations?.['1h'] && { Identifiant1h: node.metadata.productionVariable.aggregations['1h'].id }),
          ...(node.metadata.productionVariable.aggregations?.['4h'] && { Identifiant4h: node.metadata.productionVariable.aggregations['4h'].id }),
          ...(node.metadata.productionVariable.aggregations?.['8h'] && { Identifiant8h: node.metadata.productionVariable.aggregations['8h'].id }),
          ...(node.metadata.productionVariable.aggregations?.['1d'] && { Identifiant1day: node.metadata.productionVariable.aggregations['1d'].id })
        }
      });
    }

    // Traiter la variable IPE
    if (node.metadata.ipeVariable) {
      summary.totalEntities.SmartAggregation_IPE++;
      summary.aggregations_ipe.push({
        entity: 'Smart.Aggregation_IPE',
        attributes: {
          VariableId: node.metadata.ipeVariable.id,
          VariableName: node.metadata.ipeVariable.name,
          AssetName: node.name,
          Machine: node.name,
          ...(node.metadata.ipeVariable.aggregations?.['5min'] && { Identifiant5Min: node.metadata.ipeVariable.aggregations['5min'].id }),
          ...(node.metadata.ipeVariable.aggregations?.['1h'] && { Identifiant1h: node.metadata.ipeVariable.aggregations['1h'].id }),
          ...(node.metadata.ipeVariable.aggregations?.['4h'] && { Identifiant4h: node.metadata.ipeVariable.aggregations['4h'].id }),
          ...(node.metadata.ipeVariable.aggregations?.['8h'] && { Identifiant8h: node.metadata.ipeVariable.aggregations['8h'].id }),
          ...(node.metadata.ipeVariable.aggregations?.['1d'] && { Identifiant1day: node.metadata.ipeVariable.aggregations['1d'].id })
        }
      });
    }

    // Traiter l'état du capteur
    if (node.metadata.stateVariable?.variableId) {
      summary.totalEntities.EtatCapteur++;
      summary.etatCapteurs.push({
        entity: 'Smart.EtatCapteur',
        attributes: {
          NomCapteur: node.name,
          Etat: "false",
          DerniereMaj: new Date().toISOString(),
          IdEtatCapteur: node.metadata.stateVariable.variableId
        }
      });
    }
  };

  useEffect(() => {
    const loadEntities = async () => {
    const iihStructure = localStorage.getItem('iihStructure');
    if (!iihStructure) {
        router.push('/');
        return;
    }

    try {
        setIsValidating(true);
        const data = JSON.parse(iihStructure);
        const hierarchyLevels = data.hierarchyData.levels;
        
        // Générer les entités requises basées sur les niveaux
        const requiredEntities = generateRequiredEntities(hierarchyLevels);
        setRequiredEntities(requiredEntities);
        setIsValidating(false);
    } catch (error) {
        console.error('Erreur lors du chargement des entités:', error);
        setValidationError(error instanceof Error ? error.message : 'Une erreur est survenue');
        router.push('/dashboard');
    }
    };

    loadEntities();
  }, [router]);

  const handleValidateAndGenerate = async () => {
    if (!requiredEntities.length) return;

    try {
      setIsValidating(true);
      const iihStructure = localStorage.getItem('iihStructure');
      if (!iihStructure) return;

      const data = JSON.parse(iihStructure);
      const hierarchyLevels = data.hierarchyData.levels;
      
      console.log("[DEBUG] Data from localStorage:", JSON.stringify(data, null, 2));
      console.log("[DEBUG] Hierarchy levels:", JSON.stringify(hierarchyLevels, null, 2));

      await validateMendixEntities(requiredEntities);
      const mendixSummary = generateMendixSummary(data);
      console.log("[DEBUG] Generated Mendix Summary:", JSON.stringify(mendixSummary, null, 2));
      setMendixSummary(mendixSummary);
      const generatedCode = generateDynamicMendixCode(hierarchyLevels, requiredEntities, data, mendixSummary);
      setGeneratedCode(generatedCode);
      const cleanup = generateDynamicCleanupCode(requiredEntities, hierarchyLevels);
      setCleanupCode(cleanup);
      setShowEntitiesModal(false);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Erreur de validation Mendix');
    } finally {
      setIsValidating(false);
    }
  };

  // Fonction de simulation de validation Mendix
  const validateMendixEntities = async (entities: any[]) => {
    // Simuler un appel API à Mendix
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Ici, vous devriez implémenter la vraie logique de validation avec l'API Mendix
        const missingEntities = entities.filter(entity => {
          // Simulation: considérer que certaines entités n'existent pas
          return !entity.name.includes('Smart');
        });

        if (missingEntities.length > 0) {
          reject(new Error(`Entités manquantes dans Mendix: ${missingEntities.map(e => e.name).join(', ')}`));
        } else {
          resolve(true);
        }
      }, 1000);
    });
  };

  const handleCopyCode = async (codeToClipboard: string, type: 'creation' | 'cleanup' | 'validation' = 'creation') => {
    console.log(`MendixGenerator - Copying ${type} Code to Clipboard`);
    try {
        await navigator.clipboard.writeText(codeToClipboard);
        setCopySuccess(type);
        setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
        console.error('MendixGenerator - Copy Error:', err);
        setCopySuccess(null);
    }
};

  const handleBack = () => {
    console.log('MendixGenerator - Navigating Back to Dashboard');
    router.push('/dashboard');
  };

  console.log('MendixGenerator - Rendering Component:', {
    hasGeneratedCode: !!generatedCode,
    copySuccess
  });

  const EntityRequirementsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Entités Mendix Requises</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {requiredEntities.map((entity, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-6 relative">
              {/* Ligne de connexion avec le niveau précédent */}
              {index > 0 && (
                <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-blue-400"></div>
              )}
              
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                {entity.name}
              </h2>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Attributs requis :</h3>
                <div className="grid grid-cols-2 gap-4">
                  {entity.attributes.map((attr, attrIndex) => (
                    <div key={attrIndex} className="bg-gray-700 p-3 rounded">
                      <p className="text-white font-medium flex items-center">
                        {attr.name}
                        {/* Indicateur de relation si l'attribut fait référence à un niveau précédent */}
                        {requiredEntities.slice(0, index).some(e => e.name.includes(attr.name)) && (
                          <span className="ml-2 text-blue-400 text-sm">
                            ↑ Référence au niveau {requiredEntities.findIndex(e => e.name.includes(attr.name)) + 1}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-300 text-sm">Type: {attr.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-500 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleValidateAndGenerate}
            disabled={isValidating}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validation...
              </>
            ) : (
              <>
                <span>Valider et Générer</span>
                <ArrowLeft className="h-5 w-5 transform rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isValidating && !requiredEntities.length) {
  return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement des entités requises...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto bg-red-900/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Erreur de Validation</h2>
          <p className="text-red-200 mb-6">{validationError}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-white text-red-900 rounded hover:bg-red-100 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {showEntitiesModal && <EntityRequirementsModal />}

      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Générateur de Code Mendix</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Code de Création Mendix</h2>
              <button
                onClick={() => handleCopyCode(generatedCode, 'creation')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {copySuccess === 'creation' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier le code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto text-gray-300 text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Code de Nettoyage Mendix</h2>
              <button
                onClick={() => handleCopyCode(cleanupCode, 'cleanup')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {copySuccess === 'cleanup' ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier le code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-6 rounded-lg overflow-x-auto text-gray-300 text-sm">
              <code>{cleanupCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 