'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowLeft, X } from 'lucide-react';
import { generateRequiredEntities, generateMendixValidationCode } from './utils/mendixValidator';
import { generateDynamicMendixCode, generateDynamicCleanupCode } from './utils/codeGenerator';
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

interface MendixEntitySummary {
  totalEntities: {
    Secteur: number;
    Atelier: number;
    Machine: number;
    SmartAggregation_Conso: number;
    SmartAggregation_Production: number;
    SmartAggregation_IPE: number;
    EtatCapteur: number;
  };
  secteurs: Array<{
    entity: 'Smart.Secteur';
    attributes: {
      Nom: string;
      TotalConso: string;
    };
  }>;
  ateliers: Array<{
    entity: 'Smart.Atelier';
    attributes: {
      Nom: string;
      TotalConso: string;
      Secteur: string;
    };
  }>;
  machines: Array<{
    entity: 'Smart.Machine';
    attributes: {
      Identifiant: string;
      Nom: string;
      IPE: string;
      TotalConso: string;
      Secteur: string;
      Atelier: string;
      TypeEnergie: string;
    };
    parentSector?: string;
    parentWorkshop?: string;
  }>;
  aggregations_conso: Array<{
    entity: 'Smart.Aggregation_Conso';
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
    parentMachine: string;
  }>;
  aggregations_production: Array<{
    entity: 'Smart.Aggregation_Production';
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
    parentMachine: string;
  }>;
  aggregations_ipe: Array<{
    entity: 'Smart.Aggregation_IPE';
    attributes: {
      VariableId: string;
      VariableName: string;
      AssetName: string;
      Identifiant5Min?: string;
      Identifiant1h?: string;
      Identifiant4h?: string;
      Identifiant8h?: string;
      Identifiant1day?: string;
    };
    parentMachine: string;
  }>;
  etatCapteurs: Array<{
    entity: 'Smart.EtatCapteur';
    attributes: {
      NomCapteur: string;
      Etat: string;
      DerniereMaj: string;
      IdEtatCapteur?: string;
    };
    parentMachine: string;
  }>;
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
      totalEntities: {
        Secteur: 0,
        Atelier: 0,
        Machine: 0,
        SmartAggregation_Conso: 0,
        SmartAggregation_Production: 0,
        SmartAggregation_IPE: 0,
        EtatCapteur: 0
      },
      secteurs: [],
      ateliers: [],
      machines: [],
      aggregations_conso: [],
      aggregations_production: [],
      aggregations_ipe: [],
      etatCapteurs: []
    };

    // Traiter les machines à la racine
    if (iihData.rootMachines) {
      Object.entries(iihData.rootMachines).forEach(([name, machine]: [string, any]) => {
        summary.totalEntities.Machine++;
        
        summary.machines.push({
          entity: 'Smart.Machine',
          attributes: {
            Identifiant: machine.assetId,
            Nom: machine.name || name,
            IPE: '0',
            TotalConso: '0',
            Secteur: '',
            Atelier: '',
            TypeEnergie: machine.energyType || ''
          },
          parentSector: ''
        });

        if (machine.variable) {
          summary.totalEntities.SmartAggregation_Conso++;
          const aggregationIds: string[] = [];
          
          summary.aggregations_conso.push({
            entity: 'Smart.Aggregation_Conso',
            attributes: {
              VariableId: machine.variable.id,
              VariableName: machine.variable.name,
              AssetName: machine.name || name,
              ...(machine.variable.aggregations?.['5min'] && { Identifiant5Min: machine.variable.aggregations['5min'].id }),
              ...(machine.variable.aggregations?.['1h'] && { Identifiant1h: machine.variable.aggregations['1h'].id }),
              ...(machine.variable.aggregations?.['4h'] && { Identifiant4h: machine.variable.aggregations['4h'].id }),
              ...(machine.variable.aggregations?.['8h'] && { Identifiant8h: machine.variable.aggregations['8h'].id }),
              ...(machine.variable.aggregations?.['1d'] && { Identifiant1day: machine.variable.aggregations['1d'].id })
            },
            parentMachine: machine.name || name
          });
        }

        if (machine.stateVariable?.variableId) {
          summary.totalEntities.EtatCapteur++;
          summary.etatCapteurs.push({
            entity: 'Smart.EtatCapteur',
            attributes: {
              NomCapteur: machine.name || name,
              Etat: "false",
              DerniereMaj: new Date().toISOString(),
              IdEtatCapteur: machine.stateVariable.variableId
            },
            parentMachine: machine.name || name
          });
        }
      });
    }

    // Traiter les secteurs et leur hiérarchie
    if (iihData.sectors) {
      Object.entries(iihData.sectors).forEach(([sectorName, sector]: [string, any]) => {
        summary.totalEntities.Secteur++;
        const sectorMachines: string[] = [];
        const sectorAteliers: string[] = [];

        const secteur: { entity: 'Smart.Secteur', attributes: { Nom: string, TotalConso: string } } = {
          entity: 'Smart.Secteur',
          attributes: {
            Nom: sector.name || sectorName,
            TotalConso: '0'
          }
        };
        summary.secteurs.push(secteur);

        // Traiter les machines directement rattachées au secteur (sans atelier)
        if (sector.machines) {
          Object.entries(sector.machines).forEach(([machineName, machine]: [string, any]) => {
            summary.totalEntities.Machine++;
            sectorMachines.push(machine.name || machineName);

            summary.machines.push({
              entity: 'Smart.Machine',
              attributes: {
                Identifiant: machine.assetId,
                Nom: machine.name || machineName,
                IPE: '0',
                TotalConso: '0',
                Secteur: sector.name || sectorName,
                Atelier: '',
                TypeEnergie: machine.energyType || ''
              },
              parentSector: sector.name || sectorName
            });

            if (machine.variable) {
              summary.totalEntities.SmartAggregation_Conso++;
              summary.aggregations_conso.push({
                entity: 'Smart.Aggregation_Conso',
                attributes: {
                  VariableId: machine.variable.id,
                  VariableName: machine.variable.name,
                  AssetName: machine.name || machineName,
                  ...(machine.variable.aggregations?.['5min'] && { Identifiant5Min: machine.variable.aggregations['5min'].id }),
                  ...(machine.variable.aggregations?.['1h'] && { Identifiant1h: machine.variable.aggregations['1h'].id }),
                  ...(machine.variable.aggregations?.['4h'] && { Identifiant4h: machine.variable.aggregations['4h'].id }),
                  ...(machine.variable.aggregations?.['8h'] && { Identifiant8h: machine.variable.aggregations['8h'].id }),
                  ...(machine.variable.aggregations?.['1d'] && { Identifiant1day: machine.variable.aggregations['1d'].id })
                },
                parentMachine: machine.name || machineName
              });
            }

            if (machine.stateVariable?.variableId) {
              summary.totalEntities.EtatCapteur++;
              summary.etatCapteurs.push({
                entity: 'Smart.EtatCapteur',
                attributes: {
                  NomCapteur: machine.name || machineName,
                  Etat: "false",
                  DerniereMaj: new Date().toISOString(),
                  IdEtatCapteur: machine.stateVariable.variableId
                },
                parentMachine: machine.name || machineName
              });
            }
          });
        }

        // Traiter les ateliers et leurs machines
        Object.entries(sector.workshops || {}).forEach(([workshopName, workshop]: [string, any]) => {
          summary.totalEntities.Atelier++;
          const workshopMachines: string[] = [];

          const atelier: { entity: 'Smart.Atelier', attributes: { Nom: string, TotalConso: string, Secteur: string } } = {
            entity: 'Smart.Atelier',
            attributes: {
              Nom: workshop.name || workshopName,
              TotalConso: '0',
              Secteur: sector.name || sectorName
            }
          };
          summary.ateliers.push(atelier);

          Object.entries(workshop.machines || {}).forEach(([machineName, machine]: [string, any]) => {
            summary.totalEntities.Machine++;
            workshopMachines.push(machine.name || machineName);
            sectorMachines.push(machine.name || machineName);

            summary.machines.push({
              entity: 'Smart.Machine',
              attributes: {
                Identifiant: machine.assetId,
                Nom: machine.name || machineName,
                IPE: '0',
                TotalConso: '0',
                Secteur: sector.name || sectorName,
                Atelier: workshop.name || workshopName,
                TypeEnergie: machine.energyType || ''
              },
              parentSector: sector.name || sectorName,
              parentWorkshop: workshop.name || workshopName
            });

            if (machine.variable) {
              summary.totalEntities.SmartAggregation_Conso++;
              summary.aggregations_conso.push({
                entity: 'Smart.Aggregation_Conso',
                attributes: {
                  VariableId: machine.variable.id,
                  VariableName: machine.variable.name,
                  AssetName: machine.name || machineName,
                  ...(machine.variable.aggregations?.['5min'] && { Identifiant5Min: machine.variable.aggregations['5min'].id }),
                  ...(machine.variable.aggregations?.['1h'] && { Identifiant1h: machine.variable.aggregations['1h'].id }),
                  ...(machine.variable.aggregations?.['4h'] && { Identifiant4h: machine.variable.aggregations['4h'].id }),
                  ...(machine.variable.aggregations?.['8h'] && { Identifiant8h: machine.variable.aggregations['8h'].id }),
                  ...(machine.variable.aggregations?.['1d'] && { Identifiant1day: machine.variable.aggregations['1d'].id })
                },
                parentMachine: machine.name || machineName
              });
            }

            if (machine.productionVariable) {
              summary.totalEntities.SmartAggregation_Production++;
              summary.aggregations_production.push({
                entity: 'Smart.Aggregation_Production',
                attributes: {
                  VariableId: machine.productionVariable.id,
                  VariableName: machine.productionVariable.name,
                  AssetName: machine.name || machineName,
                  ...(machine.productionVariable.aggregations?.['5min'] && { Identifiant5Min: machine.productionVariable.aggregations['5min'].id }),
                  ...(machine.productionVariable.aggregations?.['1h'] && { Identifiant1h: machine.productionVariable.aggregations['1h'].id }),
                  ...(machine.productionVariable.aggregations?.['4h'] && { Identifiant4h: machine.productionVariable.aggregations['4h'].id }),
                  ...(machine.productionVariable.aggregations?.['8h'] && { Identifiant8h: machine.productionVariable.aggregations['8h'].id }),
                  ...(machine.productionVariable.aggregations?.['1d'] && { Identifiant1day: machine.productionVariable.aggregations['1d'].id })
                },
                parentMachine: machine.name || machineName
              });
            }

            if (machine.ipeVariable) {
              summary.totalEntities.SmartAggregation_IPE++;
              summary.aggregations_ipe.push({
                entity: 'Smart.Aggregation_IPE',
                attributes: {
                  VariableId: machine.ipeVariable.id,
                  VariableName: machine.ipeVariable.name,
                  AssetName: machine.name || machineName,
                  ...(machine.ipeVariable.aggregations?.['5min'] && { Identifiant5Min: machine.ipeVariable.aggregations['5min'].id }),
                  ...(machine.ipeVariable.aggregations?.['1h'] && { Identifiant1h: machine.ipeVariable.aggregations['1h'].id }),
                  ...(machine.ipeVariable.aggregations?.['4h'] && { Identifiant4h: machine.ipeVariable.aggregations['4h'].id }),
                  ...(machine.ipeVariable.aggregations?.['8h'] && { Identifiant8h: machine.ipeVariable.aggregations['8h'].id }),
                  ...(machine.ipeVariable.aggregations?.['1d'] && { Identifiant1day: machine.ipeVariable.aggregations['1d'].id })
                },
                parentMachine: machine.name || machineName
              });
            }

            if (machine.stateVariable?.variableId) {
              summary.totalEntities.EtatCapteur++;
              summary.etatCapteurs.push({
                entity: 'Smart.EtatCapteur',
                attributes: {
                  NomCapteur: machine.name || machineName,
                  Etat: "false",
                  DerniereMaj: new Date().toISOString(),
                  IdEtatCapteur: machine.stateVariable.variableId
                },
                parentMachine: machine.name || machineName
              });
            }
          });
        });
      });
    }

    return summary;
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
      const cleanup = generateDynamicCleanupCode(requiredEntities);
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