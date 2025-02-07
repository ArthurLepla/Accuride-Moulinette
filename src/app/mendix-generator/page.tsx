'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, ArrowLeft, X } from 'lucide-react';

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

export default function MendixGeneratorPage() {
  console.log('MendixGenerator - Page Component Initializing');
  
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [cleanupCode, setCleanupCode] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [mendixSummary, setMendixSummary] = useState<MendixEntitySummary | null>(null);

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
    const iihStructure = localStorage.getItem('iihStructure');

    if (!iihStructure) {
        console.log('Structure IIH non trouvée dans le localStorage');
        router.push('/dashboard');
        return;
    }

    try {
        const iihData = JSON.parse(iihStructure);
        const newSummary = generateMendixSummary(iihData);
        setMendixSummary(newSummary);
        
        // Génération du code de nettoyage et du code Mendix
        generateCleanupCode();
        generateMendixCode(iihData, newSummary);

    } catch (error) {
        if (error instanceof Error) {
            console.log('MendixGenerator - Error Processing Data:', error.message);
        } else {
            console.log('MendixGenerator - Error Processing Data:', error);
        }
        router.push('/dashboard');
    }
  }, [router]);

  const generateMendixCode = (excelData: any, mendixSummary: MendixEntitySummary) => {
    try {
        const code = [
            '// This file was generated by Mendix Studio Pro.',
            'import "mx-global";',
            'import { Big } from "big.js";',
            '',
            '// BEGIN EXTRA CODE',
            'const ENTITIES = {',
            '    SECTEUR: "Smart.Secteur",',
            '    ATELIER: "Smart.Atelier",',
            '    MACHINE: "Smart.Machine",',
            '    AGGREGATION_CONSO: "Smart.Aggregation_Conso",',
            '    AGGREGATION_PRODUCTION: "Smart.Aggregation_Production",',
            '    AGGREGATION_IPE: "Smart.Aggregation_IPE",',
            '    ETAT_CAPTEUR: "Smart.EtatCapteur"',
            '};',
            '',
            '// Données des assets (structure hiérarchique complète)',
            `const ASSETS_DATA = ${JSON.stringify(excelData, null, 4)};`,
            '',
            '// Définition du mapping des entités Mendix',
            `const MENDIX_SUMMARY = ${JSON.stringify(mendixSummary, null, 4)};`,
            '',
            '// END EXTRA CODE',
            '',
            '/**',
            ' * @returns {Promise.<void>}',
            ' */',
            'export async function JavaScript_action() {',
            '    // BEGIN USER CODE',
            '    try {',
            '        const createAndCommitObject = async (entity, attributes) => {',
            '            const obj = await new Promise((resolve, reject) => {',
            '                mx.data.create({',
            '                    entity: entity,',
            '                    callback: (obj) => {',
            '                        try {',
            '                            for (const [key, value] of Object.entries(attributes)) {',
            '                                if (value !== undefined && value !== null) {',
            '                                    obj.set(key, value.toString());',
            '                                }',
            '                            }',
            '                            resolve(obj);',
            '                        } catch (err) {',
            '                            reject(new Error(`Erreur lors de la configuration de ${entity}: ${err.message}`));',
            '                        }',
            '                    },',
            '                    error: (e) => reject(new Error(`Erreur lors de la création de ${entity}: ${e.message}`))',
            '                });',
            '            });',
            '',
            '            await new Promise((resolve, reject) => {',
            '                mx.data.commit({',
            '                    mxobj: obj,',
            '                    callback: () => {',
            '                        console.log(`${entity} créé avec succès`);',
            '                        resolve(obj);',
            '                    },',
            '                    error: (e) => reject(new Error(`Erreur lors du commit de ${entity}: ${e.message}`))',
            '                });',
            '            });',
            '',
            '            return obj;',
            '        };',
            '',
            '        // 1. Création des secteurs et leurs machines directes',
            '        console.log("=== Création des secteurs ===");',
            '        for (const secteur of MENDIX_SUMMARY.secteurs) {',
            '            await createAndCommitObject(',
            '                ENTITIES.SECTEUR,',
            '                {',
            '                    "Nom": secteur.attributes.Nom,',
            '                    "AssetId": ASSETS_DATA.sectors[secteur.attributes.Nom].assetId,',
            '                    "TotalConsoElec": "0",',
            '                    "TotalConsoGaz": "0",',
            '                    "TotalConsoEau": "0",',
            '                    "TotalConsoAir": "0",',
            '                    "TotalConsoElecPeriodPrec": "0",',
            '                    "TotalConsoGazPeriodPrec": "0",',
            '                    "TotalConsoEauPeriodPrec": "0",',
            '                    "TotalConsoAirPeriodPrec": "0"',
            '                }',
            '            );',
            '',
            '            // Création des machines rattachées directement au secteur',
            '            if (ASSETS_DATA.sectors[secteur.attributes.Nom].machines) {',
            '                for (const [machineName, machineData] of Object.entries(ASSETS_DATA.sectors[secteur.attributes.Nom].machines)) {',
            '                    const machineObj = await createAndCommitObject(',
            '                        ENTITIES.MACHINE,',
            '                        {',
            '                            "Nom": machineName,',
            '                            "Identifiant": machineData.assetId,',
            '                            "IPE": "0",',
            '                            "TotalConso": "0",',
            '                            "Secteur": secteur.attributes.Nom,',
            '                            "Atelier": "",',
            '                            "TypeEnergie": machineData.energyType || ""',
            '                        }',
            '                    );',
            '',
            '                    if (machineData.variable) {',
            '                        const aggConsoAttributes = {',
            '                            "VariableId": machineData.variable.id,',
            '                            "VariableName": machineData.variable.name,',
            '                            "AssetName": machineName,',
            '                            "Machine": machineName',
            '                        };',
            '',
            '                        if (machineData.variable.aggregations) {',
            '                            const aggs = machineData.variable.aggregations;',
            '                            if (aggs["5min"]) aggConsoAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                            if (aggs["1h"]) aggConsoAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                            if (aggs["4h"]) aggConsoAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                            if (aggs["8h"]) aggConsoAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                            if (aggs["1d"]) aggConsoAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                        }',
            '',
            '                        await createAndCommitObject(ENTITIES.AGGREGATION_CONSO, aggConsoAttributes);',
            '                    }',
            '',
            '                    if (machineData.productionVariable) {',
            '                        const aggProdAttributes = {',
            '                            "VariableId": machineData.productionVariable.id,',
            '                            "VariableName": machineData.productionVariable.name,',
            '                            "AssetName": machineName,',
            '                            "Machine": machineName',
            '                        };',
            '',
            '                        if (machineData.productionVariable.aggregations) {',
            '                            const aggs = machineData.productionVariable.aggregations;',
            '                            if (aggs["5min"]) aggProdAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                            if (aggs["1h"]) aggProdAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                            if (aggs["4h"]) aggProdAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                            if (aggs["8h"]) aggProdAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                            if (aggs["1d"]) aggProdAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                        }',
            '',
            '                        await createAndCommitObject(ENTITIES.AGGREGATION_PRODUCTION, aggProdAttributes);',
            '                    }',
            '',
            '                    if (machineData.ipeVariable) {',
            '                        const aggIPEAttributes = {',
            '                            "VariableId": machineData.ipeVariable.id,',
            '                            "VariableName": machineData.ipeVariable.name,',
            '                            "AssetName": machineName,',
            '                            "Machine": machineName',
            '                        };',
            '',
            '                        if (machineData.ipeVariable.aggregations) {',
            '                            const aggs = machineData.ipeVariable.aggregations;',
            '                            if (aggs["5min"]) aggIPEAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                            if (aggs["1h"]) aggIPEAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                            if (aggs["4h"]) aggIPEAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                            if (aggs["8h"]) aggIPEAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                            if (aggs["1d"]) aggIPEAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                        }',
            '',
            '                        await createAndCommitObject(ENTITIES.AGGREGATION_IPE, aggIPEAttributes);',
            '                    }',
            '',
            '                    // Création de l\'EtatCapteur pour cette machine',
            '                    if (machineData.stateVariable && machineData.stateVariable.variableId) {',
            '                        await createAndCommitObject(',
            '                            ENTITIES.ETAT_CAPTEUR,',
            '                            {',
            '                                "NomCapteur": machineName,',
            '                                "Etat": "false",',
            '                                "DerniereMaj": new Date().toISOString(),',
            '                                "IdEtatCapteur": machineData.stateVariable.variableId',
            '                            }',
            '                        );',
            '                    }',
            '                }',
            '            }',
            '        }',
            '',
            '        // 2. Création des ateliers',
            '        console.log("=== Création des ateliers ===");',
            '        for (const atelier of MENDIX_SUMMARY.ateliers) {',
            '            await createAndCommitObject(',
            '                ENTITIES.ATELIER,',
            '                {',
            '                    "Nom": atelier.attributes.Nom,',
            '                    "AssetId": ASSETS_DATA.sectors[atelier.attributes.Secteur].workshops[atelier.attributes.Nom].assetId,',
            '                    "TotalConso": "0",',
            '                    "Secteur": atelier.attributes.Secteur',
            '                }',
            '            );',
            '',
            '            // Création des machines rattachées directement à l\'atelier',
            '            if (ASSETS_DATA.sectors[atelier.attributes.Secteur].workshops[atelier.attributes.Nom].machines) {',
            '                for (const [machineName, machineData] of Object.entries(ASSETS_DATA.sectors[atelier.attributes.Secteur].workshops[atelier.attributes.Nom].machines)) {',
            '                    const machineObj = await createAndCommitObject(',
            '                        ENTITIES.MACHINE,',
            '                        {',
            '                            "Nom": machineName,',
            '                            "Identifiant": machineData.assetId,',
            '                            "IPE": "0",',
            '                            "TotalConso": "0",',
            '                            "Secteur": atelier.attributes.Secteur,',
            '                            "Atelier": atelier.attributes.Nom,',
            '                            "TypeEnergie": machineData.energyType || ""',
            '                        }',
            '                    );',
            '',
            '                    if (machineData.variable) {',
            '                        const aggConsoAttributes = {',
            '                            "VariableId": machineData.variable.id,',
            '                            "VariableName": machineData.variable.name,',
            '                            "AssetName": machineName,',
            '                            "Machine": machineName',
            '                        };',
            '',
            '                        if (machineData.variable.aggregations) {',
            '                            const aggs = machineData.variable.aggregations;',
            '                            if (aggs["5min"]) aggConsoAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                            if (aggs["1h"]) aggConsoAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                            if (aggs["4h"]) aggConsoAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                            if (aggs["8h"]) aggConsoAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                            if (aggs["1d"]) aggConsoAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                        }',
            '',
            '                        await createAndCommitObject(ENTITIES.AGGREGATION_CONSO, aggConsoAttributes);',
            '                    }',
            '',
            '                    if (machineData.productionVariable) {',
            '                        const aggProdAttributes = {',
            '                            "VariableId": machineData.productionVariable.id,',
            '                            "VariableName": machineData.productionVariable.name,',
            '                            "AssetName": machineName,',
            '                            "Machine": machineName',
            '                        };',
            '',
            '                        if (machineData.productionVariable.aggregations) {',
            '                            const aggs = machineData.productionVariable.aggregations;',
            '                            if (aggs["5min"]) aggProdAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                            if (aggs["1h"]) aggProdAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                            if (aggs["4h"]) aggProdAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                            if (aggs["8h"]) aggProdAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                            if (aggs["1d"]) aggProdAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                        }',
            '',
            '                        await createAndCommitObject(ENTITIES.AGGREGATION_PRODUCTION, aggProdAttributes);',
            '                    }',
            '',
            '                    if (machineData.ipeVariable) {',
            '                        const aggIPEAttributes = {',
            '                            "VariableId": machineData.ipeVariable.id,',
            '                            "VariableName": machineData.ipeVariable.name,',
            '                            "AssetName": machineName,',
            '                            "Machine": machineName',
            '                        };',
            '',
            '                        if (machineData.ipeVariable.aggregations) {',
            '                            const aggs = machineData.ipeVariable.aggregations;',
            '                            if (aggs["5min"]) aggIPEAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                            if (aggs["1h"]) aggIPEAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                            if (aggs["4h"]) aggIPEAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                            if (aggs["8h"]) aggIPEAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                            if (aggs["1d"]) aggIPEAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                        }',
            '',
            '                        await createAndCommitObject(ENTITIES.AGGREGATION_IPE, aggIPEAttributes);',
            '                    }',
            '',
            '                    // Création de l\'EtatCapteur pour cette machine',
            '                    if (machineData.stateVariable && machineData.stateVariable.variableId) {',
            '                        await createAndCommitObject(',
            '                            ENTITIES.ETAT_CAPTEUR,',
            '                            {',
            '                                "NomCapteur": machineName,',
            '                                "Etat": "false",',
            '                                "DerniereMaj": new Date().toISOString(),',
            '                                "IdEtatCapteur": machineData.stateVariable.variableId',
            '                            }',
            '                        );',
            '                    }',
            '                }',
            '            }',
            '        }',
            '',
            '        // 3. Création des machines racines (sans secteur ni atelier)',
            '        console.log("=== Création des machines racines ===");',
            '        if (ASSETS_DATA.rootMachines) {',
            '            for (const [machineName, machineData] of Object.entries(ASSETS_DATA.rootMachines)) {',
            '                const machineObj = await createAndCommitObject(',
            '                    ENTITIES.MACHINE,',
            '                    {',
            '                        "Nom": machineName,',
            '                        "Identifiant": machineData.assetId,',
            '                        "IPE": "0",',
            '                        "TotalConso": "0",',
            '                        "Secteur": "",',
            '                        "Atelier": "",',
            '                        "TypeEnergie": machineData.energyType || ""',
            '                    }',
            '                );',
            '',
            '                if (machineData.variable) {',
            '                    const aggConsoAttributes = {',
            '                        "VariableId": machineData.variable.id,',
            '                        "VariableName": machineData.variable.name,',
            '                        "AssetName": machineName,',
            '                        "Machine": machineName',
            '                    };',
            '',
            '                    if (machineData.variable.aggregations) {',
            '                        const aggs = machineData.variable.aggregations;',
            '                        if (aggs["5min"]) aggConsoAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                        if (aggs["1h"]) aggConsoAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                        if (aggs["4h"]) aggConsoAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                        if (aggs["8h"]) aggConsoAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                        if (aggs["1d"]) aggConsoAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                    }',
            '',
            '                    await createAndCommitObject(ENTITIES.AGGREGATION_CONSO, aggConsoAttributes);',
            '                }',
            '',
            '                if (machineData.productionVariable) {',
            '                    const aggProdAttributes = {',
            '                        "VariableId": machineData.productionVariable.id,',
            '                        "VariableName": machineData.productionVariable.name,',
            '                        "AssetName": machineName,',
            '                        "Machine": machineName',
            '                    };',
            '',
            '                    if (machineData.productionVariable.aggregations) {',
            '                        const aggs = machineData.productionVariable.aggregations;',
            '                        if (aggs["5min"]) aggProdAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                        if (aggs["1h"]) aggProdAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                        if (aggs["4h"]) aggProdAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                        if (aggs["8h"]) aggProdAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                        if (aggs["1d"]) aggProdAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                    }',
            '',
            '                    await createAndCommitObject(ENTITIES.AGGREGATION_PRODUCTION, aggProdAttributes);',
            '                }',
            '',
            '                if (machineData.ipeVariable) {',
            '                    const aggIPEAttributes = {',
            '                        "VariableId": machineData.ipeVariable.id,',
            '                        "VariableName": machineData.ipeVariable.name,',
            '                        "AssetName": machineName,',
            '                        "Machine": machineName',
            '                    };',
            '',
            '                    if (machineData.ipeVariable.aggregations) {',
            '                        const aggs = machineData.ipeVariable.aggregations;',
            '                        if (aggs["5min"]) aggIPEAttributes["Identifiant5Min"] = aggs["5min"].id;',
            '                        if (aggs["1h"]) aggIPEAttributes["Identifiant1h"] = aggs["1h"].id;',
            '                        if (aggs["4h"]) aggIPEAttributes["Identifiant4h"] = aggs["4h"].id;',
            '                        if (aggs["8h"]) aggIPEAttributes["Identifiant8h"] = aggs["8h"].id;',
            '                        if (aggs["1d"]) aggIPEAttributes["Identifiant1day"] = aggs["1d"].id;',
            '                    }',
            '',
            '                    await createAndCommitObject(ENTITIES.AGGREGATION_IPE, aggIPEAttributes);',
            '                }',
            '',
            '                // Création de l\'EtatCapteur pour cette machine',
            '                if (machineData.stateVariable && machineData.stateVariable.variableId) {',
            '                    await createAndCommitObject(',
            '                        ENTITIES.ETAT_CAPTEUR,',
            '                        {',
            '                            "NomCapteur": machineName,',
            '                            "Etat": "false",',
            '                            "DerniereMaj": new Date().toISOString(),',
            '                            "IdEtatCapteur": machineData.stateVariable.variableId',
            '                        }',
            '                    );',
            '                }',
            '            }',
            '        }',
            '',
            '        mx.ui.info("Configuration terminée avec succès!", {});',
            '    } catch (error) {',
            '        console.error("Erreur lors de la configuration:", error);',
            '        mx.ui.error("Erreur lors de la configuration: " + error.message, {});',
            '        throw error;',
            '    }',
            '    // END USER CODE',
            '}'
        ].join('\n');

        setGeneratedCode(code);
    } catch (error) {
        console.error('Erreur lors de la génération du code:', error);
    }
};

  const handleCopyCode = async (codeToClipboard: string, type: 'creation' | 'cleanup' = 'creation') => {
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

  const generateCleanupCode = () => {
    const cleanup = [
      '// This file was generated by Mendix Studio Pro.',
      '//',
      '// WARNING: Only the following code will be retained when actions are regenerated:',
      '// - the import list',
      '// - the code between BEGIN USER CODE and END USER CODE',
      '// - the code between BEGIN EXTRA CODE and END EXTRA CODE',
      '// Other code you write will be lost the next time you deploy the project.',
      'import "mx-global";',
      'import { Big } from "big.js";',
      '',
      '// BEGIN EXTRA CODE',
      'const ENTITIES = {',
      '    SECTEUR: "Smart.Secteur",',
      '    ATELIER: "Smart.Atelier",',
      '    MACHINE: "Smart.Machine",',
      '    AGGREGATION_CONSO: "Smart.Aggregation_Conso",',
      '    AGGREGATION_PRODUCTION: "Smart.Aggregation_Production",',
      '    AGGREGATION_IPE: "Smart.Aggregation_IPE",',
      '    ETAT_CAPTEUR: "Smart.EtatCapteur"',
      '};',
      '// END EXTRA CODE',
      '',
      '/**',
      ' * @returns {Promise.<void>}',
      ' */',
      'export async function delete_objets() {',
      '    // BEGIN USER CODE',
      '    try {',
      '        // Fonction utilitaire pour supprimer toutes les entités d\'un type donné',
      '        const deleteAllEntities = async (entity) => {',
      '            return new Promise((resolve, reject) => {',
      '                mx.data.get({',
      '                    xpath: `//${entity}`,',
      '                    callback: (objs) => {',
      '                        console.log(`Suppression de ${objs.length} entités ${entity}`);',
      '                        const deletePromises = objs.map(obj => new Promise((innerResolve, innerReject) => {',
      '                            mx.data.remove({',
      '                                guid: obj.getGuid(),',
      '                                callback: () => innerResolve(),',
      '                                error: (e) => innerReject(new Error(`Erreur lors de la suppression de ${entity}: ${e.message}`))',
      '                            });',
      '                        }));',
      '',
      '                        Promise.all(deletePromises)',
      '                            .then(() => resolve())',
      '                            .catch(error => reject(error));',
      '                    },',
      '                    error: (e) => reject(new Error(`Erreur lors de la récupération des ${entity}: ${e.message}`))',
      '                });',
      '            });',
      '        };',
      '',
      '        // Supprimer les entités dans l\'ordre inverse des dépendances',
      '        console.log("=== Début du nettoyage des entités ===");',
      '',
      '        // 1. Supprimer les EtatCapteur',
      '        console.log("1. Suppression des EtatCapteur...");',
      '        await deleteAllEntities(ENTITIES.ETAT_CAPTEUR);',
      '',
      '        // 2. Supprimer les Aggregations',
      '        console.log("2. Suppression des Aggregations...");',
      '        await deleteAllEntities(ENTITIES.AGGREGATION_CONSO);',
      '        await deleteAllEntities(ENTITIES.AGGREGATION_PRODUCTION);',
      '        await deleteAllEntities(ENTITIES.AGGREGATION_IPE);',
      '',
      '        // 3. Supprimer les Machines',
      '        console.log("3. Suppression des Machines...");',
      '        await deleteAllEntities(ENTITIES.MACHINE);',
      '',
      '        // 4. Supprimer les Ateliers',
      '        console.log("4. Suppression des Ateliers...");',
      '        await deleteAllEntities(ENTITIES.ATELIER);',
      '',
      '        // 5. Supprimer les Secteurs',
      '        console.log("5. Suppression des Secteurs...");',
      '        await deleteAllEntities(ENTITIES.SECTEUR);',
      '',
      '        console.log("=== Nettoyage terminé avec succès ===");',
      '        mx.ui.info("Nettoyage terminé avec succès!", {});',
      '    } catch (error) {',
      '        console.error("Erreur lors du nettoyage:", error);',
      '        mx.ui.error(`Erreur lors du nettoyage: ${error.message}`, true);',
      '        throw error;',
      '    }',
      '    // END USER CODE',
      '}'
    ].join('\n');

    setCleanupCode(cleanup);
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      {showConfirmation && mendixSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Confirmation des Entités Mendix</h2>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 text-gray-300">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Entités à Créer</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(mendixSummary.totalEntities).map(([entity, count]) => (
                    <div key={entity} className="bg-gray-600 p-3 rounded">
                      <p className="text-sm">Smart.{entity}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {mendixSummary.secteurs.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.Secteur</h3>
                  <div className="space-y-2">
                    {mendixSummary.secteurs.map((secteur, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">Nom: {secteur.attributes.Nom}</p>
                        <p className="text-sm text-gray-400">TotalConso: {secteur.attributes.TotalConso}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mendixSummary.ateliers.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.Atelier</h3>
                  <div className="space-y-2">
                    {mendixSummary.ateliers.map((atelier, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">Nom: {atelier.attributes.Nom}</p>
                        <p className="text-sm text-gray-400">TotalConso: {atelier.attributes.TotalConso}</p>
                        <p className="text-sm text-gray-400">Secteur: {atelier.attributes.Secteur}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mendixSummary.machines.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.Machine</h3>
                  <div className="space-y-2">
                    {mendixSummary.machines.map((machine, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">Nom: {machine.attributes.Nom}</p>
                        <p className="text-sm text-gray-400">Identifiant: {machine.attributes.Identifiant}</p>
                        <p className="text-sm text-gray-400">Type Énergie: {machine.attributes.TypeEnergie || 'Non spécifié'}</p>
                        {machine.parentSector && (
                          <p className="text-sm text-gray-400">Secteur: {machine.parentSector}</p>
                        )}
                        {machine.parentWorkshop && (
                          <p className="text-sm text-gray-400">Atelier: {machine.parentWorkshop}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mendixSummary.aggregations_conso.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.Aggregation_Conso</h3>
                  <div className="space-y-2">
                    {mendixSummary.aggregations_conso.map((agg, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">Machine: {agg.parentMachine}</p>
                        <p className="text-sm text-gray-400">VariableId: {agg.attributes.VariableId}</p>
                        <p className="text-sm text-gray-400">VariableName: {agg.attributes.VariableName}</p>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p className="font-medium mt-2">Identifiants d'agrégation:</p>
                          {agg.attributes.Identifiant5Min && (
                            <p>5min: {agg.attributes.Identifiant5Min}</p>
                          )}
                          {agg.attributes.Identifiant1h && (
                            <p>1h: {agg.attributes.Identifiant1h}</p>
                          )}
                          {agg.attributes.Identifiant4h && (
                            <p>4h: {agg.attributes.Identifiant4h}</p>
                          )}
                          {agg.attributes.Identifiant8h && (
                            <p>8h: {agg.attributes.Identifiant8h}</p>
                          )}
                          {agg.attributes.Identifiant1day && (
                            <p>1j: {agg.attributes.Identifiant1day}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mendixSummary.aggregations_production.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.Aggregation_Production</h3>
                  <div className="space-y-2">
                    {mendixSummary.aggregations_production.map((agg, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">Machine: {agg.parentMachine}</p>
                        <p className="text-sm text-gray-400">VariableId: {agg.attributes.VariableId}</p>
                        <p className="text-sm text-gray-400">VariableName: {agg.attributes.VariableName}</p>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p className="font-medium mt-2">Identifiants d'agrégation:</p>
                          {agg.attributes.Identifiant5Min && (
                            <p>5min: {agg.attributes.Identifiant5Min}</p>
                          )}
                          {agg.attributes.Identifiant1h && (
                            <p>1h: {agg.attributes.Identifiant1h}</p>
                          )}
                          {agg.attributes.Identifiant4h && (
                            <p>4h: {agg.attributes.Identifiant4h}</p>
                          )}
                          {agg.attributes.Identifiant8h && (
                            <p>8h: {agg.attributes.Identifiant8h}</p>
                          )}
                          {agg.attributes.Identifiant1day && (
                            <p>1j: {agg.attributes.Identifiant1day}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mendixSummary.aggregations_ipe.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.Aggregation_IPE</h3>
                  <div className="space-y-2">
                    {mendixSummary.aggregations_ipe.map((agg, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">Machine: {agg.parentMachine}</p>
                        <p className="text-sm text-gray-400">VariableId: {agg.attributes.VariableId}</p>
                        <p className="text-sm text-gray-400">VariableName: {agg.attributes.VariableName}</p>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p className="font-medium mt-2">Identifiants d'agrégation:</p>
                          {agg.attributes.Identifiant5Min && (
                            <p>5min: {agg.attributes.Identifiant5Min}</p>
                          )}
                          {agg.attributes.Identifiant1h && (
                            <p>1h: {agg.attributes.Identifiant1h}</p>
                          )}
                          {agg.attributes.Identifiant4h && (
                            <p>4h: {agg.attributes.Identifiant4h}</p>
                          )}
                          {agg.attributes.Identifiant8h && (
                            <p>8h: {agg.attributes.Identifiant8h}</p>
                          )}
                          {agg.attributes.Identifiant1day && (
                            <p>1j: {agg.attributes.Identifiant1day}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mendixSummary.etatCapteurs.length > 0 && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">Smart.EtatCapteur</h3>
                  <div className="space-y-2">
                    {mendixSummary.etatCapteurs.map((etatCapteur, idx) => (
                      <div key={idx} className="bg-gray-600 p-3 rounded">
                        <p className="font-semibold">NomCapteur: {etatCapteur.attributes.NomCapteur}</p>
                        <p className="text-sm text-gray-400">Etat: {etatCapteur.attributes.Etat}</p>
                        <p className="text-sm text-gray-400">DerniereMaj: {etatCapteur.attributes.DerniereMaj}</p>
                        {etatCapteur.attributes.IdEtatCapteur && (
                          <p className="text-sm text-gray-400">IdEtatCapteur: {etatCapteur.attributes.IdEtatCapteur}</p>
                        )}
                        <p className="text-sm text-gray-400">Machine: {etatCapteur.parentMachine}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Générer le Code
              </button>
            </div>
          </div>
        </div>
      )}

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
    </main>
  );
} 