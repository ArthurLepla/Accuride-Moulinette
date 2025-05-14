'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, AlertCircle, X, RefreshCw, Settings, Info, Database, CheckCircle } from 'lucide-react';
import { FlexibleProcessedData } from '@/types/sankey';
import { 
  importFlexibleData, 
  createVariablesHierarchiques, 
  ImportConfiguration,
  DEFAULT_IMPORT_CONFIG,
  SimpleImporter,
  updateIIHStructureWithAggregations
} from '@/modules/simple-importer';
import { createAggregationsForAll } from '@/modules/simple-importer/simpleAssetImporter';
import { IIHApi } from '@/modules/simple-importer/api';
import { IIHVariableResponse } from '@/modules/simple-importer/types';

interface FlexibleImportValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FlexibleProcessedData;
  rawData: Record<string, string>[];
  onImportSuccess?: () => void;
}

interface AggregationInfo {
  id: string;
  sourceId: string;
  variableName: string;
  cycle: string;
}

type Step = {
  title: string;
  description: string;
  validate: (data: FlexibleProcessedData, rawData: Record<string, string>[]) => { 
    isValid: boolean; 
    errors: string[]; 
    details?: any[] 
  };
  renderDetails?: (details: any[]) => React.ReactNode;
};

interface ValidationDetail {
  niveau: string;
  total: number;
  orphelins: number;
  status: string;
}

interface NameValidationDetail {
  niveau: string;
  nom: string;
  raison: string;
}

const TableView = ({ data, columns }: { data: any[]; columns: { key: string; label: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-700">
      <thead className="bg-gray-800 sticky top-0">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-gray-900 divide-y divide-gray-800">
        {data.map((item, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {column.key === 'status' ? (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item[column.key] === 'Valide'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item[column.key]}
                  </span>
                ) : (
                  item[column.key]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const steps: Step[] = [
  {
    title: "Configuration de l'import",
    description: "Configuration des paramètres d'import vers IIH",
    validate: () => {
      // Cette étape est toujours valide car elle permet simplement de configurer
      return {
        isValid: true,
        errors: [],
        details: []
      };
    }
  },
  {
    title: "Validation de la structure",
    description: "Vérification de la structure hiérarchique",
    validate: (data) => {
      const hierarchyData = data.hierarchyData;
      const details = hierarchyData.levels.map(level => {
        const nodesAtLevel = hierarchyData.nodes.filter(n => n.level === level.level);
        const linksToLevel = hierarchyData.links.filter(l => {
          const targetNode = hierarchyData.nodes.find(n => n.id === l.target);
          return targetNode?.level === level.level;
        });

        return {
          niveau: level.name,
          elements: nodesAtLevel.length,
          connexions: linksToLevel.length,
          status: nodesAtLevel.length > 0 ? "Valide" : "Vide"
        };
      });

      return {
        isValid: details.every(d => d.status === "Valide"),
        errors: details.filter(d => d.status !== "Valide").map(d => `Niveau ${d.niveau} invalide`),
        details
      };
    },
    renderDetails: (details) => (
      <TableView
        data={details}
        columns={[
          { key: 'niveau', label: 'Niveau' },
          { key: 'elements', label: 'Éléments' },
          { key: 'connexions', label: 'Connexions' },
          { key: 'status', label: 'Statut' }
        ]}
      />
    )
  },
  {
    title: "Validation des noms",
    description: "Vérification des noms pour compatibilité IIH",
    validate: (data) => {
      const invalidNames: NameValidationDetail[] = [];
      const hierarchyData = data.hierarchyData;

      // Règles de validation des noms
      const nameRules = {
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\u00C0-\u017F\s-]+$/
      };

      hierarchyData.nodes.forEach(node => {
        if (node.name.length < nameRules.minLength) {
          invalidNames.push({
            niveau: node.levelName,
            nom: node.name,
            raison: "Nom trop court"
          });
        }
        if (node.name.length > nameRules.maxLength) {
          invalidNames.push({
            niveau: node.levelName,
            nom: node.name,
            raison: "Nom trop long"
          });
        }
        if (!nameRules.pattern.test(node.name)) {
          invalidNames.push({
            niveau: node.levelName,
            nom: node.name,
            raison: "Caractères non autorisés"
          });
        }
      });

      return {
        isValid: invalidNames.length === 0,
        errors: invalidNames.map(n => `${n.niveau} - "${n.nom}": ${n.raison}`),
        details: invalidNames
      };
    },
    renderDetails: (details: NameValidationDetail[]) => (
      <TableView
        data={details}
        columns={[
          { key: 'niveau', label: 'Niveau' },
          { key: 'nom', label: 'Nom' },
          { key: 'raison', label: 'Problème' }
        ]}
      />
    )
  },
  {
    title: "Préparation IIH",
    description: "Vérification de la compatibilité avec IIH",
    validate: (data) => {
      const hierarchyData = data.hierarchyData;
      const details: ValidationDetail[] = [];
      const errors: string[] = [];

      // Vérification des connexions entre niveaux
      hierarchyData.levels.forEach((level, index) => {
        if (index > 0) {
          const currentLevelNodes = hierarchyData.nodes.filter(n => n.level === level.level);
          const previousLevel = hierarchyData.levels[index - 1];
          
          const nodesWithoutParent = currentLevelNodes.filter(node => {
            const parentLinks = hierarchyData.links.filter(l => l.target === node.id);
            return parentLinks.length === 0;
          });

          if (nodesWithoutParent.length > 0) {
            errors.push(`${nodesWithoutParent.length} éléments du niveau "${level.name}" n'ont pas de parent dans le niveau "${previousLevel.name}"`);
          }

          details.push({
            niveau: level.name,
            total: currentLevelNodes.length,
            orphelins: nodesWithoutParent.length,
            status: nodesWithoutParent.length === 0 ? "Valide" : "À vérifier"
          });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        details
      };
    },
    renderDetails: (details: ValidationDetail[]) => (
      <TableView
        data={details}
        columns={[
          { key: 'niveau', label: 'Niveau' },
          { key: 'total', label: 'Total éléments' },
          { key: 'orphelins', label: 'Sans parent' },
          { key: 'status', label: 'Statut' }
        ]}
      />
    )
  },
  {
    title: "Création des agrégations",
    description: "Création des agrégations pour toutes les variables importées",
    validate: () => {
      // Cette étape est toujours valide car elle est optionnelle
      return {
        isValid: true,
        errors: [],
        details: []
      };
    },
    renderDetails: () => null
  },
  {
    title: "Configuration de la rétention des données",
    description: "Définir la durée de conservation des données à 6 ans pour les agrégations",
    validate: () => {
      // Cette étape est toujours valide car elle est optionnelle
      return {
        isValid: true,
        errors: [],
        details: []
      };
    },
    renderDetails: () => null
  }
];

export function FlexibleImportValidationModal({ 
  isOpen, 
  onClose, 
  data, 
  rawData,
  onImportSuccess 
}: FlexibleImportValidationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<Array<{ isValid: boolean; errors: string[]; details?: any[] } | null>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la configuration d'import
  const [adapters, setAdapters] = useState<any[]>([]);
  const [loadingAdapters, setLoadingAdapters] = useState(false);
  const [selectedAdapter, setSelectedAdapter] = useState<any>(null);
  const [adapterTags, setAdapterTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [importConfig, setImportConfig] = useState<ImportConfiguration>({...DEFAULT_IMPORT_CONFIG});
  // AJOUT: État pour la case à cocher IPE/Prod sur L5
  const [includeIpeProdOnLastLevel, setIncludeIpeProdOnLastLevel] = useState<boolean>(DEFAULT_IMPORT_CONFIG.includeIpeProdOnLastLevel ?? false);

  // Fonction pour obtenir la configuration d'authentification
  const getAuthConfig = () => {
    // Récupérer les données d'authentification (token, base URL, etc.)
    const authData = typeof window !== 'undefined' ? localStorage.getItem('authConfig') : null;
    return authData ? JSON.parse(authData) : null;
  };

  // État pour stocker la configuration d'authentification
  const [authConfig, setAuthConfig] = useState<any>(null);

  // Charger la configuration d'authentification au chargement
  useEffect(() => {
    const config = getAuthConfig();
    setAuthConfig(config);
  }, []);

  // Définir validateCurrentStep avant de l'utiliser dans le useEffect
  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const result = step.validate(data, rawData);
    setStepResults(prev => {
      const newResults = [...prev];
      newResults[currentStep] = result;
      return newResults;
    });
    return result.isValid;
  };

  // Fonction pour charger les adapters
  const loadAdapters = useCallback(async () => {
    if (!authConfig) {
      console.error('loadAdapters: authConfig est null. Impossible de charger les adapters.');
      return;
    }
    
    try {
      setLoadingAdapters(true);
      setError(null);
      
      // Déterminer quel token utiliser (token ou authToken)
      const token = authConfig.token || authConfig.authToken;
      
      console.log('Chargement des adapters avec la configuration:', {
        baseUrl: authConfig.baseUrl,
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
      
      if (!token) {
        console.error('Aucun token d\'authentification trouvé');
        setError('Aucun token d\'authentification trouvé');
        setAdapters(generateMockAdapters());
        setLoadingAdapters(false);
        return;
      }
      
      // Utiliser l'API proxy pour éviter les problèmes CORS
      console.log('Envoi de la requête au point de terminaison proxy API');
      const response = await fetch('/api/adapters', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-auth-config': JSON.stringify(authConfig)
        }
      });
      
      console.log('Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      let adaptersData = [];
      
      if (!response.ok) {
        const errorData = await response.text();
        console.warn('Avertissement lors du chargement des adapters:', errorData);
        adaptersData = generateMockAdapters();
      } else {
        try {
          const responseData = await response.json();
          console.log('Adapters récupérés:', responseData);
          
          // Extraire le tableau d'adapters de la réponse
          if (responseData && responseData.adapters && Array.isArray(responseData.adapters)) {
            adaptersData = responseData.adapters;
            console.log('Tableau d\'adapters extrait, nombre d\'adapters:', adaptersData.length);
          } else {
            console.error('Format de réponse inattendu, tableau adapters non trouvé:', responseData);
            adaptersData = generateMockAdapters();
          }
        } catch (jsonError) {
          console.error('Erreur lors de la conversion des données adapters en JSON:', jsonError);
          adaptersData = generateMockAdapters();
        }
      }
      
      // Vérifier si nous avons bien reçu un tableau d'adapters
      if (!Array.isArray(adaptersData) || adaptersData.length === 0) {
        console.error('Format de données invalide ou tableau vide - attendu: tableau non vide, reçu:', adaptersData);
        adaptersData = generateMockAdapters();
      }
      
      setAdapters(adaptersData);
      
      // Si on a des adapters, sélectionner le premier par défaut ou celui de la config
      if (adaptersData && adaptersData.length > 0) {
        // Vérifier si l'adapterId de la config existe dans la liste
        const configAdapter = adaptersData.find((a: any) => a.id === importConfig.adapterId);
        if (configAdapter) {
          setSelectedAdapter(configAdapter);
        } else {
          // Sinon prendre le premier
          setSelectedAdapter(adaptersData[0]);
          // Et mettre à jour la config avec l'ID du premier adapter
          setImportConfig(prev => ({
            ...prev,
            adapterId: adaptersData[0].id
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des adapters:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des adapters');
      
      // Utiliser des données de secours en cas d'erreur
      const fallbackAdapters = generateMockAdapters();
      
      setAdapters(fallbackAdapters);
      setSelectedAdapter(fallbackAdapters[0]);
      setImportConfig(prev => ({
        ...prev,
        adapterId: fallbackAdapters[0].id
      }));
      
    } finally {
      setLoadingAdapters(false);
    }
  }, [authConfig, importConfig.adapterId]);
  
  // Simplifier le chargement des tags (pas de chargement réel, juste des valeurs par défaut)
  const loadDefaultTags = useCallback(() => {
    const defaultTags = [
      "conso", "prod", "prod_kg", "ipe", "ipe_kg", "etat",
      "conso_elec", "conso_gaz", "conso_air", "conso_eau"
    ];
    
    setAdapterTags(defaultTags);
    
    // Pas besoin de pré-sélectionner, les valeurs par défaut dans importConfig sont déjà correctes
  }, []);
  
  // Fonction pour générer des adapters mock en cas d'erreur
  const generateMockAdapters = () => {
    return [
      { 
        id: 'mock-adapter-1', 
        name: 'OPC UA Mock Adapter', 
        type: 'OPC UA',
        canBrowse: true 
      },
      { 
        id: 'mock-adapter-2', 
        name: 'MQTT Mock Adapter', 
        type: 'MQTT',
        canBrowse: true 
      },
      { 
        id: 'mock-adapter-3', 
        name: 'REST Mock Adapter', 
        type: 'REST',
        canBrowse: true 
      }
    ];
  };
  
  // Charger les adapters à l'ouverture du modal si on est à l'étape de configuration
  useEffect(() => {
    if (isOpen && authConfig && currentStep === 0) {
      loadAdapters();
      loadDefaultTags(); // Charger les tags par défaut immédiatement
    }
  }, [isOpen, authConfig, currentStep, loadAdapters, loadDefaultTags]);

  // Validation des étapes
  useEffect(() => {
    if (isOpen) {
      // Ne valider que si data est disponible (pour les étapes qui le nécessitent)
      if (data && currentStep > 0) {
        validateCurrentStep();
      } else if (currentStep === 0) {
        // Étape de configuration, on peut valider sans data
        validateCurrentStep();
      }
    }
  }, [currentStep, data, isOpen]);

  // Gérer le changement d'adapter sélectionné
  const handleAdapterChange = (adapterId: string) => {
    setSelectedAdapter(adapters.find(a => a.id === adapterId));
    setImportConfig(prev => ({
      ...prev,
      adapterId
    }));
    // Pas besoin de charger les tags pour cet adapter
  };

  // Gérer le changement de mapping de tag
  const handleTagMappingChange = (tagKey: keyof ImportConfiguration['tagMappings'], value: string) => {
    setImportConfig(prev => ({
      ...prev,
      tagMappings: {
        ...prev.tagMappings,
        [tagKey]: value
      }
    }));
  };

  // Gérer le changement de type d'énergie par défaut
  const handleDefaultEnergyTypeChange = (value: string) => {
    setImportConfig(prev => ({
      ...prev,
      defaultEnergyType: value
    }));
  };

  // AJOUT: Gérer le changement de la case à cocher IPE/Prod
  const handleIncludeIpeProdChange = (checked: boolean) => {
    setIncludeIpeProdOnLastLevel(checked);
    // Mettre à jour directement la configuration d'import
    setImportConfig(prev => ({
      ...prev,
      includeIpeProdOnLastLevel: checked
    }));
    console.log(`Option IPE/Prod L5 mise à jour: ${checked}`);
  };

  // Passer à l'étape suivante ou terminer avec la configuration choisie
  const handlePassStepWithConfig = () => {
    console.log('Configuration d\'import appliquée:', importConfig);
    // On est à la dernière étape, donc on peut lancer l'import
    handleImport();
  };

  const renderConfigurationStep = () => {
    return (
      <div className="space-y-6">
        {/* Sélection de l'adapter */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-white">Adapter</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            {loadingAdapters ? (
              <div className="flex items-center justify-center p-4">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-300">Chargement des adapters...</span>
              </div>
            ) : adapters.length === 0 ? (
              <div className="text-gray-400 p-2">Aucun adapter disponible</div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm text-gray-400 mb-1">
                  Sélectionner un adapter pour la communication
                </label>
                <select
                  value={selectedAdapter?.id}
                  onChange={(e) => handleAdapterChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner un adapter --</option>
                  {adapters.map((adapter) => (
                    <option key={adapter.id} value={adapter.id}>
                      {adapter.name || adapter.id}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Mappage des tags pour les assets de dernier niveau (niveau 5) */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-white">Tags pour les assets de dernier niveau (niveau 5)</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-4">
              {/* MODIFICATION: Description conditionnelle */}
              <p className="text-sm text-gray-400">
                Définir les noms des tags pour les capteurs au niveau des machines (niveau 5).
                {includeIpeProdOnLastLevel && (
                    " Les tags Production et IPE sont aussi utilisés car l'option est activée."
                )}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tag de consommation */}
                <div className="space-y-1">
                  <label className="block text-sm text-gray-400">
                    Tag de consommation
                  </label>
                  <input
                    type="text"
                    value={importConfig.tagMappings.consumption}
                    onChange={(e) => handleTagMappingChange('consumption', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="conso"
                  />
                </div>

                {/* Tag d'état du capteur */}
                <div className="space-y-1">
                  <label className="block text-sm text-gray-400">
                    Tag d'état du capteur
                  </label>
                  <input
                    type="text"
                    value={importConfig.tagMappings.sensorStatus}
                    onChange={(e) => handleTagMappingChange('sensorStatus', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="etat"
                  />
                </div>

                {/* AJOUT: Champs conditionnels pour Production et IPE */}
                {includeIpeProdOnLastLevel && (
                  <>
                    {/* Tag de production (pcs) pour L5 */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Tag de Production (pièces)
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.productionPcsL5 || 'prod'}
                        onChange={(e) => handleTagMappingChange('productionPcsL5', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="prod"
                      />
                       <p className="text-xs text-gray-500">Utilisé pour le niveau 5 car l'option est activée.</p>
                    </div>

                    {/* Tag IPE (générique) pour L5 */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Tag IPE (générique)
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.ipe || 'ipe'}
                        onChange={(e) => handleTagMappingChange('ipe', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ipe"
                      />
                       <p className="text-xs text-gray-500">Utilisé pour le niveau 5 car l'option est activée.</p>
                    </div>
                  </>
                )}
                {/* FIN AJOUT */}
              </div>
            </div>
          </div>
        </div>

        {/* Mappage des tags pour les assets des niveaux supérieurs (niveaux 1-4) */}
        {/* NOTE: Les tags productionPcs et les IPE spécifiques restent ici car ils sont *principalement* utilisés pour les niveaux 1-4, même si productionPcs peut aussi être utilisé pour L5 si l'option est cochée. On pourrait ajouter une note ici aussi si nécessaire. */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-white">Tags pour les assets des niveaux supérieurs (niveaux 1-4)</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Définir les noms des tags pour les métriques agrégées aux niveaux supérieurs
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Consommation par type d'énergie */}
                <div className="col-span-2 mb-2">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Consommation par type d'énergie</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Électricité */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Consommation Électricité
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.consumptionElec || "conso_elec"}
                        onChange={(e) => handleTagMappingChange('consumptionElec', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="conso_elec"
                      />
                    </div>
                    
                    {/* Gaz */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Consommation Gaz
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.consumptionGaz || "conso_gaz"}
                        onChange={(e) => handleTagMappingChange('consumptionGaz', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="conso_gaz"
                      />
                    </div>
                    
                    {/* Eau */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Consommation Eau
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.consumptionEau || "conso_eau"}
                        onChange={(e) => handleTagMappingChange('consumptionEau', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="conso_eau"
                      />
                    </div>
                    
                    {/* Air */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Consommation Air
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.consumptionAir || "conso_air"}
                        onChange={(e) => handleTagMappingChange('consumptionAir', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="conso_air"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Production */}
                <div className="col-span-2 mb-2">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Production</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tag de production en pièces */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Production (pièces)
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.productionPcs}
                        onChange={(e) => handleTagMappingChange('productionPcs', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="prod_quantite"
                      />
                    </div>
                    
                    {/* Tag de production en kg */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        Production (kg)
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.productionKg}
                        onChange={(e) => handleTagMappingChange('productionKg', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="prod_kg"
                      />
                    </div>
                  </div>
                </div>
                
                {/* IPE */}
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">Indicateurs de Performance Énergétique (IPE)</h4>
                  
                  {/* IPE par type d'énergie */}
                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">IPE par type d'énergie</h5>
                    
                    {/* IPE Électricité */}
                    <div className="mb-3">
                      <h6 className="text-xs text-gray-500 mb-1">Électricité</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Élec (pièces)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeElecTag || "IPE_elec_quantite"}
                            onChange={(e) => handleTagMappingChange('ipeElecTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_elec_quantite"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Élec (kg)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeKgElecTag || "IPE_elec_kg"}
                            onChange={(e) => handleTagMappingChange('ipeKgElecTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_elec_kg"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* IPE Gaz */}
                    <div className="mb-3">
                      <h6 className="text-xs text-gray-500 mb-1">Gaz</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Gaz (pièces)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeGazTag || "IPE_gaz_quantite"}
                            onChange={(e) => handleTagMappingChange('ipeGazTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_gaz_quantite"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Gaz (kg)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeKgGazTag || "IPE_gaz_kg"}
                            onChange={(e) => handleTagMappingChange('ipeKgGazTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_gaz_kg"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* IPE Eau */}
                    <div className="mb-3">
                      <h6 className="text-xs text-gray-500 mb-1">Eau</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Eau (pièces)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeEauTag || "IPE_eau_quantite"}
                            onChange={(e) => handleTagMappingChange('ipeEauTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_eau_quantite"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Eau (kg)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeKgEauTag || "IPE_eau_kg"}
                            onChange={(e) => handleTagMappingChange('ipeKgEauTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_eau_kg"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* IPE Air */}
                    <div className="mb-3">
                      <h6 className="text-xs text-gray-500 mb-1">Air</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Air (pièces)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeAirTag || "IPE_air_quantite"}
                            onChange={(e) => handleTagMappingChange('ipeAirTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_air_quantite"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm text-gray-400">
                            IPE Air (kg)
                          </label>
                          <input
                            type="text"
                            value={importConfig.tagMappings.ipeKgAirTag || "IPE_air_kg"}
                            onChange={(e) => handleTagMappingChange('ipeKgAirTag', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="IPE_air_kg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Type d'énergie par défaut */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-white">Type d'énergie par défaut</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400 mb-1">
                Type d'énergie à utiliser si non spécifié
              </label>
              <select
                value={importConfig.defaultEnergyType || 'elec'}
                onChange={(e) => handleDefaultEnergyTypeChange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="elec">Électricité</option>
                <option value="gaz">Gaz</option>
                <option value="air">Air comprimé</option>
                <option value="eau">Eau</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* AJOUT: Option IPE et Prod au dernier niveau */}
        <div className="space-y-2">
          <h3 className="text-md font-medium text-white">Options supplémentaires</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center">
              <input
                id="includeIpeProd"
                type="checkbox"
                checked={includeIpeProdOnLastLevel}
                onChange={(e) => handleIncludeIpeProdChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <label htmlFor="includeIpeProd" className="ml-2 block text-sm text-gray-300">
                Ajouter les variables IPE et Production au dernier niveau (niveau 5)
              </label>
            </div>
             <p className="text-xs text-gray-500 mt-2 pl-6">
               Si activé, les variables `Production_[NomMachine]` et `IPE_[NomMachine]` seront créées en plus de la consommation et de l'état pour les assets de niveau 5.
             </p>
          </div>
        </div>

        {/* Conseils */}
        <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700">
          <div className="flex items-start">
            <Settings className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-blue-300 font-medium">Conseils de configuration</h4>
              <ul className="text-sm text-blue-200 mt-2 list-disc list-inside space-y-1">
                <li>L'adapter sélectionné sera utilisé pour toutes les variables de type Tag</li>
                <li>Les noms de tags seront utilisés pour la création des variables</li>
                <li>Le type d'énergie par défaut sera utilisé si aucun type n'est détecté dans les noms d'assets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const canProceed = useMemo(() => {
    const currentResult = stepResults[currentStep];
    return currentResult?.isValid ?? false;
  }, [currentStep, stepResults]);

  const handleImport = async () => {
    if (!validateCurrentStep()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Effacer les données d'un import précédent
    localStorage.removeItem('iihStructure');
    console.log('iihStructure effacé du localStorage pour un nouvel import');
    
    // Use the existing importConfig from handlePassStepWithConfig
    console.log('Début de l\'import - Configuration utilisée:', {
      adapterId: importConfig.adapterId,
      tagMappings: importConfig.tagMappings,
      defaultEnergyType: importConfig.defaultEnergyType
    });

    // S'assurer que l'auth config est disponible
    if (!authConfig) {
      console.error('Configuration d\'authentification manquante. Tentative de récupération...');
      const config = getAuthConfig();
      if (!config) {
        throw new Error('Impossible de récupérer la configuration d\'authentification');
      }
      console.log('Configuration d\'authentification récupérée:', { 
        baseUrl: config.baseUrl,
        hasToken: !!config.token,
        tokenLength: config.token?.length || 0
      });
      setAuthConfig(config);
    } else {
      console.log('Configuration d\'authentification existante:', { 
        baseUrl: authConfig.baseUrl,
        hasToken: !!authConfig.token,
        tokenLength: authConfig.token?.length || 0
      });
    }
    
    // Import des données hiérarchiques vers IIH avec authentification
    console.log('Appel de importFlexibleData avec authConfig et data');
    
    try {
      const result = await importFlexibleData(data);
      
      console.log('Résultat de l\'import:', {
        success: result.success,
        nbAssets: result.assets?.length || 0,
        message: result.message
      });
      
      if (result.success) {
        console.log('Import IIH réussi:', result);
        
        // Création des variables pour tous les niveaux d'assets
        if (result.assets && result.assets.length > 0) {
          console.log(`Création des variables hiérarchiques pour ${result.assets.length} assets...`);
          
          try {
            // Passage de la configuration d'authentification en plus
            console.log('Appel de createVariablesHierarchiques avec authConfig');
            const variablesResult = await createVariablesHierarchiques(
              result.assets, 
              importConfig,
              authConfig
            );
            
            console.log('Résultat de la création des variables:', {
              success: variablesResult.success,
              nbVariables: variablesResult.variables?.length || 0,
              message: variablesResult.message
            });
            
            if (variablesResult.success) {
              console.log('Création des variables hiérarchiques réussie');
              // Fusionner les résultats
              result.variables = variablesResult.variables;
              result.message += `. ${variablesResult.message}`;

              // Intégrer les IDs des variables et agrégations aux métadonnées des nœuds
              const updatedHierarchyData = structureDataForMendix(data.hierarchyData, result.assets, variablesResult.variables);

              // Sauvegarder la structure complète pour Mendix
              const iihStructure = {
                hierarchyData: updatedHierarchyData,
                assets: result.assets,
                variables: variablesResult.variables
              };

              // Sauvegarder dans le localStorage pour la génération du code Mendix
              localStorage.setItem('iihStructure', JSON.stringify(iihStructure));
              console.log('Structure IIH sauvegardée pour Mendix:', iihStructure);

              // Ajouter du logging pour déboguer la structure après import
              console.log("Raw variablesResult.variables:", JSON.stringify(variablesResult?.variables?.slice(0, 3), null, 2)); // Ajout du log brut
              console.log("Structure détaillée des 3 premières variables:", 
                variablesResult?.variables?.slice(0, 3)?.map((v: IIHVariableResponse) => ({ // Utiliser le type IIHVariableResponse corrigé
                  id: v.variableId,      // Correction: utiliser variableId
                  name: v.variableName,  // Correction: utiliser variableName
                  assetRef: v.assetId || "" // Correction: utiliser assetId directement
                })) || []
              );

              console.log("Structure détaillée des 3 premiers assets:", 
                result.assets?.slice(0, 3)?.map(a => ({
                  id: a.assetId, // IIHAsset utilise assetId et non id
                  name: a.name
                })) || []
              );

            } else {
              console.warn('Échec de la création des variables hiérarchiques:', variablesResult.message);
              // Ajouter un message d'avertissement sans échouer l'opération complète
              result.message += `. Attention: ${variablesResult.message}`;
            }
          } catch (varError) {
            console.error('Erreur lors de la création des variables hiérarchiques:', varError);
            // Ne pas échouer l'opération principale si les variables ne peuvent pas être créées
            result.message += `. Échec de la création des variables: ${varError instanceof Error ? varError.message : 'erreur inconnue'}`;
          }
        } else {
          console.warn('Aucun asset créé, impossible de créer les variables');
          result.message += '. Aucun asset créé, impossible de créer les variables';
        }
        
        // Store the result for later use with the aggregation button
        setImportResult(result);
        
        // Afficher un message de succès
        setSuccess(`Import réussi : ${result.message}`);
        
        // Passer automatiquement à l'étape d'agrégation
        setCurrentStep(4);
        
        // Commenté pour éviter la fermeture automatique du modal après un import réussi
        // onImportSuccess?.();
      } else {
        throw new Error(result.message || 'Échec de l\'import IIH');
      }
    } catch (err) {
      console.error('Erreur lors de l\'import:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'import');
    } finally {
      setIsLoading(false);
      console.log('Fin de la procédure d\'import');
    }
  };

  // Add a new state to store the import result
  const [importResult, setImportResult] = useState<any>(null);

  // Add a new function to handle creating aggregations
  const handleCreateAggregations = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[Modal] Démarrage du processus de création d\'agrégations...');
      
      // 1. Récupérer la structure actuelle de localStorage
      const iihStructureStr = localStorage.getItem('iihStructure');
      if (!iihStructureStr) {
        throw new Error('[Modal] Structure IIH non trouvée dans localStorage');
      }
      let iihStructure = JSON.parse(iihStructureStr);
      
      // *** MODIFIED: Call the updated createAggregationsForAll ***
      console.log('[Modal] Appel de createAggregationsForAll...');
      const aggregationResults = await createAggregationsForAll();
      console.log(`[Modal] Résultat de createAggregationsForAll: succès=${aggregationResults.success}, ${aggregationResults.aggregationsByVariableId.size} variables avec aggs, ${aggregationResults.errors.length} erreurs.`);

      if (!aggregationResults.success && aggregationResults.aggregationsByVariableId.size === 0) {
          // If the process failed AND no aggregations were found/created, throw the error message
          throw new Error(aggregationResults.message || 'Échec complet de la création/récupération des agrégations');
      }
      
      // If there were errors but some aggregations were processed, log a warning
      if (aggregationResults.errors.length > 0) {
          console.warn('[Modal] Erreurs rencontrées lors de la création/récupération des agrégations:', aggregationResults.errors);
          // Continue processing with the aggregations we did get
      }

      // 2. Mettre à jour les métadonnées des variables dans iihStructure
      console.log('[Modal] Mise à jour des métadonnées des variables dans iihStructure avec les agrégations...');
      let updatedVariablesCount = 0;
      if (iihStructure.variables && Array.isArray(iihStructure.variables)) {
        iihStructure.variables = iihStructure.variables.map((variable: any) => {
          const variableId = variable.id || variable.variableId || variable._id;
          const foundAggregations = aggregationResults.aggregationsByVariableId.get(variableId);

          if (foundAggregations && Object.keys(foundAggregations).length > 0) {
            // Assurer que metadata existe
            if (!variable.metadata) {
              variable.metadata = {};
            }
            // Ajouter ou remplacer les agrégations dans les métadonnées
            variable.metadata.aggregations = foundAggregations;
            updatedVariablesCount++;
            // Log first few updates for verification
            if (updatedVariablesCount <= 3) {
                console.log(`[Modal] Métadonnées mises à jour pour variable ${variableId}:`, variable.metadata.aggregations);
            }
          }
          return variable;
        });
        console.log(`[Modal] ${updatedVariablesCount} variables mises à jour avec les détails des agrégations.`);
      } else {
        console.warn('[Modal] Aucune variable trouvée dans iihStructure pour la mise à jour des agrégations.');
      }
      
      // 3. Mettre à jour la structure hiérarchique (via structureDataForMendix)
      // structureDataForMendix utilisera maintenant les variable.metadata.aggregations enrichies
      console.log('[Modal] Mise à jour de la structure hiérarchique via structureDataForMendix...');
        const updatedHierarchyData = structureDataForMendix(
          iihStructure.hierarchyData, 
          iihStructure.assets, 
        iihStructure.variables // Passer les variables mises à jour
        );
        
      // 4. Sauvegarder la structure mise à jour
        const updatedIIHStructure = {
        ...iihStructure, // Conserver les autres parties de iihStructure
          hierarchyData: updatedHierarchyData,
        // variables sont déjà à jour dans iihStructure
        };
        
        localStorage.setItem('iihStructure', JSON.stringify(updatedIIHStructure));
      console.log('[Modal] Structure IIH mise à jour dans localStorage avec les agrégations');
      
      // Update success message based on overall outcome
      let successMessage = aggregationResults.success 
          ? `Création/Vérification des agrégations réussie pour ${aggregationResults.aggregationsByVariableId.size} variables.` 
          : `Création/Vérification des agrégations terminée avec ${aggregationResults.errors.length} erreurs.`;
      if(updatedVariablesCount > 0) successMessage += ` ${updatedVariablesCount} variables mises à jour dans la structure locale.`;

      setSuccess(successMessage);
        // Passer automatiquement à l'étape de rétention des données
        setCurrentStep(5);
      
    } catch (err) {
      console.error('[Modal] Erreur lors de la création/mise à jour des agrégations:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création/mise à jour des agrégations');
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to configure data retention
  const handleConfigureDataRetention = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) {
        setError('Non authentifié');
        return;
      }

      console.log('Récupération des variables pour configuration de rétention...');

      // Récupérer les variables de l'asset
      const response = await fetch(`/api/variables`, {
        headers: {
          'X-Auth-Config': JSON.stringify(authConfig)
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur lors de la récupération des variables:', {
          status: response.status,
          error: errorText
        });
        throw new Error(`Erreur lors de la récupération des variables: ${errorText}`);
      }

      const variablesResponse = await response.json();
      console.log('Variables récupérées:', variablesResponse);
      
      // Extraire le tableau de variables à partir de la réponse
      // Assumer un type générique ou définir IIHVariableResponse si disponible globalement
      const allVariables: IIHVariableResponse[] = Array.isArray(variablesResponse) 
        ? variablesResponse 
        : (variablesResponse.variables || []);
      
      if (!allVariables || allVariables.length === 0) {
        throw new Error('Aucune variable trouvée');
      }

      console.log(`${allVariables.length} variables trouvées au total`);

      // Filtrer les variables non booléennes pour la rétention et la récupération des agrégations
      const nonBooleanVariables = allVariables.filter((variable: IIHVariableResponse) => variable.dataType !== 'Bool');
      // Utiliser variableId au lieu de id
      const nonBooleanVariableIds = nonBooleanVariables.map((v: IIHVariableResponse) => v.variableId); 

      console.log(`${nonBooleanVariables.length} variables non booléennes trouvées pour traitement.`);

      // Configuration de la rétention (6 ans) - en utilisant year comme base
      const retentionConfig = {
        timeSettings: {
          timeRange: {
            factor: 6,  // 6 ans
            base: "year"
          }
        }
      };

      console.log('Configuration de rétention standard:', retentionConfig);
      
      // Récupérer TOUTES les agrégations pertinentes en UN SEUL appel
      const allAggregations: AggregationInfo[] = [];
      if (nonBooleanVariableIds.length > 0) {
        try {
          console.log(`Récupération des agrégations pour ${nonBooleanVariableIds.length} variables...`);
          const aggUrl = `/api/aggregations?sourceIds=${encodeURIComponent(JSON.stringify(nonBooleanVariableIds))}`;
          
          const aggResponse = await fetch(aggUrl, {
            headers: {
              'X-Auth-Config': JSON.stringify(authConfig)
            }
          });
          
          if (aggResponse.ok) {
            // Assumer un type pour les données d'agrégation ou utiliser 'any' si inconnu
            const aggregationsData: any[] = await aggResponse.json(); 
            if (Array.isArray(aggregationsData) && aggregationsData.length > 0) {
              console.log(`${aggregationsData.length} agrégations trouvées au total.`);
              // Mapper les résultats au format AggregationInfo
              // Utiliser variableId et variableName
              const variableMap = nonBooleanVariables.reduce((map: Record<string, string>, v: IIHVariableResponse) => {
                map[v.variableId] = v.variableName; // Utiliser variableId et variableName
                return map;
              }, {} as Record<string, string>);

              aggregationsData.forEach(agg => {
                // Vérifier si sourceId existe et est une clé valide dans variableMap
                if (agg.sourceId && variableMap[agg.sourceId]) {
                allAggregations.push({
                  id: agg.id,
                  sourceId: agg.sourceId,
                      variableName: variableMap[agg.sourceId], // Trouver le nom de la variable parente
                  cycle: `${agg.cycle?.base || 'unknown'}/${agg.cycle?.factor || 'unknown'}`
                });
                 } else {
                    // Log si l'aggregation a une sourceId non mappée ou manquante
                    console.warn(`Agrégation ${agg.id} avec sourceId ${agg.sourceId} non trouvée parmi les variables non booléennes.`);
                 }
              });
            } else {
              console.log('Aucune agrégation trouvée pour les variables non booléennes.');
            }
          } else {
             const errorText = await aggResponse.text();
             console.error(`Erreur lors de la récupération groupée des agrégations: ${errorText}`);
             // Continuer sans agrégations si la récupération échoue
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération groupée des agrégations:`, error);
          // Continuer sans agrégations
        }
      } else {
         console.log("Aucune variable non booléenne, pas de récupération d\'agrégations nécessaire.");
      }
      
      console.log(`Total de ${allAggregations.length} agrégations mappées à traiter.`);

      // Configurer la rétention pour chaque variable NON BOOLÉENNE et ses agrégations
      const variableRetentionResults = [];
      const aggregationRetentionResults = [];
      
      // 1. Configurer la rétention pour les variables NON BOOLÉENNES
      // Utiliser variableId et variableName
      for (const variable of nonBooleanVariables) { // Utiliser la liste filtrée et typer la variable
        const variableId = variable.variableId; // Utiliser variableId
        const variableName = variable.variableName; // Utiliser variableName
        console.log(`Configuration de la rétention pour ${variableName} (${variableId})`);

        const variableRetentionConfig = {
          sourceTypeId: "Variable",
          sourceId: variableId,
          settings: retentionConfig
        };

        try {
          // D'abord essayer de créer (POST) la configuration de rétention
          const createResponse = await fetch('/api/retention', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Config': JSON.stringify(authConfig)
            },
            body: JSON.stringify(variableRetentionConfig)
          });

          if (!createResponse.ok) {
            console.log(`Création de rétention impossible pour ${variableName}, tentative de mise à jour...`);
            
            // Si la création échoue, essayer de mettre à jour (PUT)
            const updateResponse = await fetch('/api/retention', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth-Config': JSON.stringify(authConfig)
              },
              body: JSON.stringify(variableRetentionConfig)
            });

            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error(`Erreur pour ${variableName}:`, errorText);
              continue;
            }

            console.log(`Rétention mise à jour pour ${variableName}`);
            variableRetentionResults.push({
              variableName: variableName,
              variableId: variableId,
              retention: '6 ans',
              method: 'UPDATE'
            });
          } else {
            console.log(`Rétention créée pour ${variableName}`);
            variableRetentionResults.push({
              variableName: variableName,
              variableId: variableId,
              retention: '6 ans',
              method: 'CREATE'
            });
          }
        } catch (error) {
          console.error(`Erreur lors de la configuration de la rétention pour ${variableName}:`, error);
        }
      }
      
      // 2. Configurer la rétention pour les agrégations
      for (const aggregation of allAggregations) {
        const aggregationId = aggregation.id;
        console.log(`Configuration de la rétention pour l'agrégation ${aggregationId} (${aggregation.cycle}) de ${aggregation.variableName}`);

        const aggregationRetentionConfig = {
          sourceTypeId: "Aggregation", // Correction: Utiliser la majuscule
          sourceId: aggregationId,
          settings: retentionConfig
        };

        try {
          // D'abord essayer de créer (POST) la configuration de rétention
          const createResponse = await fetch('/api/retention', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Config': JSON.stringify(authConfig)
            },
            body: JSON.stringify(aggregationRetentionConfig)
          });

          if (!createResponse.ok) {
            console.log(`Création de rétention impossible pour l'agrégation ${aggregationId}, tentative de mise à jour...`);
            
            // Si la création échoue, essayer de mettre à jour (PUT)
            const updateResponse = await fetch('/api/retention', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth-Config': JSON.stringify(authConfig)
              },
              body: JSON.stringify(aggregationRetentionConfig)
            });

            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error(`Erreur pour l'agrégation ${aggregationId}:`, errorText);
              continue;
            }

            console.log(`Rétention mise à jour pour l'agrégation ${aggregationId}`);
            aggregationRetentionResults.push({
              variableName: aggregation.variableName,
              aggregationId: aggregationId,
              cycle: aggregation.cycle,
              retention: '6 ans',
              method: 'UPDATE'
            });
          } else {
            console.log(`Rétention créée pour l'agrégation ${aggregationId}`);
            aggregationRetentionResults.push({
              variableName: aggregation.variableName,
              aggregationId: aggregationId,
              cycle: aggregation.cycle,
              retention: '6 ans',
              method: 'CREATE'
            });
          }
        } catch (error) {
          console.error(`Erreur lors de la configuration de rétention pour l'agrégation ${aggregationId}:`, error);
        }
      }

      const totalResults = variableRetentionResults.length + aggregationRetentionResults.length;
      if (totalResults > 0) {
        setSuccess(`Configuration de la rétention des données complétée pour ${variableRetentionResults.length} variables et ${aggregationRetentionResults.length} agrégations`);
      } else {
        throw new Error('Aucune rétention n\'a pu être configurée');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration de la rétention:', error);
      setError(`Erreur lors de la configuration de la rétention: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a state for success message
  const [success, setSuccess] = useState<string>('');
  
  const renderStepContent = () => {
    // Si c'est l'étape de configuration, afficher l'interface de configuration
    if (currentStep === 0) {
      return renderConfigurationStep();
    }
    
    // Si c'est l'étape d'agrégation (après l'import)
    if (currentStep === 4) {
      return (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Création d'agrégations pour les variables</h3>
            
            <p className="text-gray-400 mb-6">
              Cette étape permet de créer automatiquement des agrégations pour toutes les variables importées. 
              Les agrégations suivantes seront générées : 5min, 1h, 4h, 8h et 24h.
            </p>
            
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-300 font-medium">Information</h4>
                  <p className="text-sm text-blue-200 mt-2">
                    La création d'agrégations est une étape importante qui permet d'optimiser les performances 
                    lors de la visualisation de données sur de longues périodes. Ce processus peut prendre 
                    plusieurs minutes selon le nombre de variables dans le système.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateAggregations}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création des agrégations en cours...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-2" />
                  Créer les agrégations pour toutes les variables
                </>
              )}
            </button>
          </div>
          
          {success && (
            <div className="p-4 bg-green-900 bg-opacity-50 rounded-lg text-green-300">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>{success}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Si c'est l'étape de configuration de la rétention des données
    if (currentStep === 5) {
      return (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Configuration de la rétention des données</h3>
            
            <p className="text-gray-400 mb-6">
              Cette étape permet de configurer la rétention des données à 6 ans pour toutes les agrégations.
              Cela garantit que les données historiques seront disponibles pour les analyses à long terme.
            </p>
            
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4 border border-blue-700 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-300 font-medium">Information</h4>
                  <p className="text-sm text-blue-200 mt-2">
                    La rétention des données définit la durée pendant laquelle les données sont conservées
                    dans le système. Une durée de 6 ans est recommandée pour les données d'agrégation
                    afin de permettre des analyses pluriannuelles et de respecter les exigences réglementaires.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleConfigureDataRetention}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Configuration de la rétention en cours...
                </>
              ) : (
                <>
                  <Settings className="h-5 w-5 mr-2" />
                  Configurer la rétention des données à 6 ans
                </>
              )}
            </button>
          </div>
          
          {success && (
            <div className="p-4 bg-green-900 bg-opacity-50 rounded-lg text-green-300">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>{success}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Sinon, afficher le contenu normal de l'étape
    return (
      <>
        {/* Validation results */}
        {stepResults[currentStep] && stepResults[currentStep]?.errors && stepResults[currentStep]?.errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Erreurs détectées</span>
            </div>
            <ul className="list-disc list-inside text-red-300">
              {stepResults[currentStep]?.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Details */}
        {stepResults[currentStep]?.details && steps[currentStep].renderDetails && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {steps[currentStep].renderDetails(stepResults[currentStep]?.details)}
          </div>
        )}
      </>
    );
  };

  // --- AJOUT : Définition de normalizeEnergyType ---
  // (Copiez/collez ou importez la fonction normalizeEnergyType ici si elle n'est pas déjà accessible)
  const normalizeEnergyType = (type: string): string => {
    if (!type) return 'elec'; 
    const typeLower = type.toLowerCase();
    if (typeLower === 'eau' || typeLower === 'water' || typeLower.includes('chauff') || typeLower.includes('heat')) return 'eau';
    if (typeLower === 'gaz' || typeLower === 'gas') return 'gaz';
    if (typeLower === 'air' || typeLower.includes('compr')) return 'air';
    if (typeLower === 'elec' || typeLower.includes('élect') || typeLower.includes('electr')) return 'elec';
    return 'elec'; // Fallback
  };
  // --- FIN AJOUT ---

  const structureDataForMendix = (hierarchyData: any, assets: any[] = [], variables: any[] = []) => {
    // Copie profonde pour ne pas modifier l'original
    const updatedHierarchyData = JSON.parse(JSON.stringify(hierarchyData));
    
    console.log("===== DÉBUT STRUCTURATION POUR MENDIX (Roll-up Dynamique) =====");
    
    // --- Préparation ---
    const assetMap = assets.reduce((acc: {[key: string]: any}, asset) => {
      acc[asset.assetId] = asset;
      return acc;
    }, {});
    const assetMapByName = assets.reduce((acc: {[key: string]: any}, asset) => {
      acc[asset.name] = asset;
      return acc;
    }, {});
     const variablesMap = variables.reduce((acc: {[key: string]: any[]}, variable: IIHVariableResponse) => { 
      const assetId = variable.assetId; 
      if (assetId) {
        if (!acc[assetId]) acc[assetId] = [];
        acc[assetId].push(variable);
      } else {
        console.log(`Variable ${variable.variableId} (${variable.variableName}) n\'a pas d\'assetId`);
      }
      return acc;
    }, {});

    // Maps pour la hiérarchie et la recherche rapide
    const nodeMapById: { [key: string]: any } = {}; // Pour accéder aux nœuds par leur ID
    const childrenMap: { [key: string]: string[] } = {}; // Pour stocker les enfants de chaque parent
    let maxLevel = 0; // Pour stocker le niveau max trouvé

    // --- PASSE 1: Initialisation et traitement de base ---
    console.log("--- PASSE 1: Initialisation des nœuds ---");
    updatedHierarchyData.nodes.forEach((node: any) => {
      // Initialisation de base
      nodeMapById[node.id] = node; 
      if (!node.metadata) node.metadata = {};
      
      // Utiliser node.level (numérique) s'il existe, sinon essayer de parser levelName
      let nodeLevelNum = node.level;
      if (typeof nodeLevelNum !== 'number' && node.levelName) {
          const match = node.levelName.match(/\d+/);
          if (match) nodeLevelNum = parseInt(match[0], 10);
      }
      if(typeof nodeLevelNum !== 'number') {
          console.warn(`Impossible de déterminer le niveau numérique pour ${node.name}. Assignation 1 par défaut.`);
          nodeLevelNum = 1; // Fallback
      }
      node.metadata.levelNum = nodeLevelNum; // Stocker le niveau numérique
      node.metadata.levelName = node.levelName; // Conserver le nom original

      // Mettre à jour le niveau max
      if (nodeLevelNum > maxLevel) {
          maxLevel = nodeLevelNum;
      }

      // Déterminer le type (machine, sector, etc.) - optionnel, basé sur nom si levelName existe
      if(node.levelName) {
        if (node.levelName.toLowerCase().includes('machine')) node.metadata.type = 'machine';
        else if (node.levelName.toLowerCase().includes('secteur')) node.metadata.type = 'sector';
        else if (node.levelName.toLowerCase().includes('atelier')) node.metadata.type = 'workshop';
        else if (node.levelName.toLowerCase().includes('ligne')) node.metadata.type = 'line';
        else if (node.levelName.toLowerCase().includes('poste')) node.metadata.type = 'station';
      } else {
         // Si pas de levelName, essayer de deviner type basé sur levelNum
         if (nodeLevelNum === maxLevel) node.metadata.type = 'machine'; // Dernier niveau = machine
      }

      // Déterminer le type d'énergie basé sur Excel (prioritaire)
      let determinedEnergyType = 'elec';
      let rawEnergyType = 'Elec';
      let sourceLog = 'Default (elec)';

      // ÉTAPE 1: Vérifier si les métadonnées pertinentes existent déjà sur le nœud
      //          (potentiellement définies lors de l'import initial)
      if (node.metadata.energyType && ['Elec', 'Gaz', 'Eau', 'Air'].includes(node.metadata.energyType)) {
          determinedEnergyType = node.metadata.energyType.toLowerCase(); // Utiliser la valeur normalisée existante
          rawEnergyType = node.metadata.rawEnergyType || node.metadata.energyType; // Utiliser la valeur brute si dispo, sinon la normalisée
          sourceLog = `Existing Metadata (energyType: "${node.metadata.energyType}")`;
      } else if (node.metadata.rawEnergyType) {
          // Si seul rawEnergyType existe, le normaliser
          const normalizedFromRaw = normalizeEnergyType(node.metadata.rawEnergyType);
          if (['elec', 'gaz', 'eau', 'air'].includes(normalizedFromRaw)) {
              determinedEnergyType = normalizedFromRaw;
              rawEnergyType = node.metadata.rawEnergyType;
              sourceLog = `Existing Metadata (rawEnergyType: "${rawEnergyType}" -> "${determinedEnergyType}")`;
          } else {
              // Si rawEnergyType existe mais n'est pas reconnu, on passera à l'étape 2 (Excel)
              console.warn(`[Passe 1] Node: "${node.name}", Existing rawEnergyType "${node.metadata.rawEnergyType}" non reconnu. Tentative via Excel.`);
              sourceLog = `Existing Metadata (non reconnu: "${node.metadata.rawEnergyType}") -> Tentative Excel`;
          }
      }

      // ÉTAPE 2: Si aucune métadonnée valide n'a été trouvée, essayer de lire depuis originalData (Excel)
      //          (Cette condition est maintenant atteinte SEULEMENT si l'étape 1 n'a pas trouvé de type valide)
      if (sourceLog.startsWith('Default') || sourceLog.includes('Tentative Excel')) {
          if (node.originalData?.type_energie) {
              const excelValue = node.originalData.type_energie;
              console.log(`[DEBUG Energy Check] Node: ${node.name}, Excel Value Raw: "${excelValue}", Length: ${excelValue?.length}`);
              const normalized = normalizeEnergyType(excelValue);
              if (['elec', 'gaz', 'eau', 'air'].includes(normalized)) {
                  determinedEnergyType = normalized;
                  rawEnergyType = excelValue;
                  sourceLog = `Excel ("${excelValue}" -> "${normalized}")`; // Mettre à jour la source
              } else {
                  sourceLog = `Excel (non reconnu: "${excelValue}") -> Default (elec)`; // La source reste par défaut si non reconnu
              }
          } else {
              // Si pas de métadonnées ET pas de donnée Excel, utiliser le fallback par nom
              console.log(`[DEBUG Energy Check] Node: ${node.name}, NO Excel Value found in node.originalData.type_energie`);
              const nodeNameLower = (node.name || '').toLowerCase();
              if (nodeNameLower.includes('air')) { determinedEnergyType = 'air'; rawEnergyType = 'Air'; sourceLog="Name analysis (air)";}
              else if (nodeNameLower.includes('eau')) { determinedEnergyType = 'eau'; rawEnergyType = 'Eau'; sourceLog="Name analysis (eau)";}
              else if (nodeNameLower.includes('gaz')) { determinedEnergyType = 'gaz'; rawEnergyType = 'Gaz'; sourceLog="Name analysis (gaz)";}
              else if (nodeNameLower.includes('elec')) { determinedEnergyType = 'elec'; rawEnergyType = 'Elec'; sourceLog="Name analysis (elec)";}
              // Si rien ne correspond, determinedEnergyType et rawEnergyType restent 'elec'/'Elec' par défaut.
          }
      }

      // Assignation finale basée sur la source déterminée
      node.metadata.energyType = determinedEnergyType.charAt(0).toUpperCase() + determinedEnergyType.slice(1);
      node.metadata.rawEnergyType = rawEnergyType;
      // Log final de la passe 1 pour ce nœud
      console.log(`[Passe 1] Node: "${node.name}", Level: ${node.metadata.levelNum}, EnergyType: "${node.metadata.energyType}", Raw: "${node.metadata.rawEnergyType}", Source: ${sourceLog}`);

      // Associer l'assetId IIH
      let asset = assetMap[node.id] || assetMapByName[node.name];
      if (asset) {
        node.metadata.assetId = asset.assetId;
      } else if (nodeLevelNum === maxLevel) { // Afficher l'alerte seulement pour le dernier niveau
         console.log(`⚠️ ATTENTION: Nœud du dernier niveau (${maxLevel}) sans asset correspondant: ${node.name} (ID: ${node.id})`);
      }
      
      // Initialiser les flags à false
      node.metadata.isElec = false;
      node.metadata.isGaz = false;
      node.metadata.isEau = false;
      node.metadata.isAir = false;
      // Supprimer les références variables (non nécessaires)
      delete node.metadata.elecVariable;
      delete node.metadata.gazVariable;
      delete node.metadata.eauVariable;
      delete node.metadata.airVariable;
      delete node.metadata.variable; 

      // Définir le flag initial pour les machines (dernier niveau) UNIQUEMENT
      // Utiliser nodeLevelNum ici
      if (nodeLevelNum === maxLevel) {
          const mainEnergyType = node.metadata.energyType; // 'Elec', 'Gaz', 'Eau', 'Air'
          if (mainEnergyType === 'Elec') node.metadata.isElec = true;
          else if (mainEnergyType === 'Gaz') node.metadata.isGaz = true;
          else if (mainEnergyType === 'Eau') node.metadata.isEau = true;
          else if (mainEnergyType === 'Air') node.metadata.isAir = true;
          console.log(`[Passe 1 L${maxLevel}] Flag initial is${mainEnergyType}=true défini pour ${node.name}`);
      }
      
      // Optionnel: Stocker la variable directe pour Lmax si besoin
       const assetVariables = asset ? variablesMap[asset.assetId] || [] : [];
       if (asset && nodeLevelNum === maxLevel && assetVariables.length > 0) {
           assetVariables.forEach((variable: IIHVariableResponse) => {
             let varName = (variable.variableName || '').toLowerCase();
             const isConsumptionVar = varName.startsWith('consommation_') || varName.startsWith('consommation_'.toLowerCase());
             const isTag = variable.sourceType === 'Tag';
               if (
                 isConsumptionVar && isTag &&
                 (
                   (node.metadata.energyType === 'Elec' && (varName.includes('_elec_') || varName.includes('electricite'))) ||
                   (node.metadata.energyType === 'Gaz' && varName.includes('_gaz_')) ||
                   (node.metadata.energyType === 'Eau' && varName.includes('_eau_')) ||
                   (node.metadata.energyType === 'Air' && varName.includes('_air_'))
                 )
               ) {
                   node.metadata.variable = { variableId: variable.variableId, variableName: variable.variableName, aggregations: variable.metadata?.aggregations || {} };
                   console.log(`[Passe 1 L${maxLevel}] Var principale ${variable.variableName} trouvée et stockée pour ${node.name}`);
               }
           });
       }

    }); // Fin de la première passe (forEach node)
    console.log(`[Passe 1] Niveau maximum détecté: ${maxLevel}`);

    // Construire la map des enfants
    hierarchyData.links.forEach((link: any) => {
        const parentId = link.source;
        const childId = link.target;
        if (!childrenMap[parentId]) childrenMap[parentId] = [];
        if (nodeMapById[childId]) childrenMap[parentId].push(childId);
    });
    console.log("--- PASSE 1: Map des enfants construite ---");

    // --- PASSE 2: Roll-up des flags ---
    console.log(`--- PASSE 2: Roll-up des flags (Niveaux ${maxLevel - 1} à 1) ---`);
    // Itérer des avant-derniers niveaux jusqu'au premier
    for (let level = maxLevel - 1; level >= 1; level--) {
        console.log(`[Passe 2] Traitement du niveau: ${level}`);
        // Filtrer les nœuds de ce niveau (utiliser levelNum)
        const nodesAtLevel = updatedHierarchyData.nodes.filter((n: any) => n.metadata.levelNum === level);

        nodesAtLevel.forEach((parentNode: any) => {
            const childIds = childrenMap[parentNode.id] || [];
            const childrenNodes = childIds.map(id => nodeMapById[id]).filter(Boolean); 

            // Le flag est TRUE si AU MOINS UN enfant a le flag TRUE
            parentNode.metadata.isElec = childrenNodes.some(child => child.metadata.isElec);
            parentNode.metadata.isGaz = childrenNodes.some(child => child.metadata.isGaz);
            parentNode.metadata.isEau = childrenNodes.some(child => child.metadata.isEau);
            parentNode.metadata.isAir = childrenNodes.some(child => child.metadata.isAir);
                
            console.log(`[Passe 2 L${level}] Flags roll-up pour ${parentNode.name}: Elec=${parentNode.metadata.isElec}, Gaz=${parentNode.metadata.isGaz}, Eau=${parentNode.metadata.isEau}, Air=${parentNode.metadata.isAir}`);
            
        });
    }
    console.log("--- PASSE 2: Roll-up terminé ---");
    
    // Ajouter les informations de parenté (peut rester à la fin)
    updatedHierarchyData.nodes.forEach((node: any) => {
        const parentLinks = hierarchyData.links.filter((link: any) => link.target === node.id);
        if (parentLinks.length > 0) {
          const parentId = parentLinks[0].source;
          const parentNode = nodeMapById[parentId]; 
          if (parentNode) {
             // Tenter de récupérer les noms des parents jusqu'au niveau Secteur
             let currentParent = parentNode;
             let hops = 0;
             while(currentParent && hops < maxLevel) { // Limiter la recherche pour éviter boucle infinie
                if(currentParent.metadata?.type === 'workshop' || currentParent.levelName?.toLowerCase().includes('atelier')) {
                    node.metadata.parentWorkshop = currentParent.name;
                }
                if(currentParent.metadata?.type === 'sector' || currentParent.levelName?.toLowerCase().includes('secteur')) {
                    node.metadata.parentSector = currentParent.name;
                    break; // On a trouvé le secteur, on arrête
                }
                 // Remonter au parent suivant
                 const grandParentLinks = hierarchyData.links.filter((link: any) => link.target === currentParent.id);
                 if (grandParentLinks.length > 0) {
                    currentParent = nodeMapById[grandParentLinks[0].source];
                 } else {
                    currentParent = null; // Pas de parent plus haut
                 }
                 hops++;
             }
          }
        }
     });

    console.log("===== FIN STRUCTURATION POUR MENDIX =====");
    
    // console.log('Structure finale avec roll-up:', JSON.stringify(updatedHierarchyData, null, 2)); // Pour débogage détaillé si besoin
    return updatedHierarchyData;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Validation de l'import</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step indicator */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-2">{steps[currentStep].title}</h3>
            <p className="text-gray-400">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
          
          {/* Success message */}
          {success && currentStep !== 4 && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-50 rounded-lg text-green-300">
              {success}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between">
          <div className="flex-1">
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              {currentStep === 4 || currentStep === 5 ? 'Fermer' : 'Annuler'}
            </button>
            {currentStep > 0 && currentStep <= 5 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Précédent
              </button>
            )}
            {currentStep === 0 ? (
              <button
                onClick={() => setCurrentStep(1)}
                disabled={!selectedAdapter || isLoading}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  selectedAdapter && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check className="h-5 w-5" />
                Continuer avec cette configuration
              </button>
            ) : currentStep === 4 || currentStep === 5 ? (
              <button
                onClick={() => {
                  // Fermer le modal
                  onClose();
                  // Rediriger vers la page de génération du code Mendix
                  window.location.href = '/mendix-generator';
                }}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Terminer et générer le code Mendix
              </button>
            ) : (
              <button
                onClick={handleImport}
                disabled={!canProceed || isLoading}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  canProceed && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Importer vers IIH
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 