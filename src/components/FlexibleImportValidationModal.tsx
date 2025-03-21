'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, AlertCircle, X, RefreshCw, Settings } from 'lucide-react';
import { FlexibleProcessedData } from '@/types/sankey';
import { 
  importFlexibleData, 
  createVariablesHierarchiques, 
  ImportConfiguration,
  DEFAULT_IMPORT_CONFIG
} from '@/modules/simple-importer';
import { IIHApi } from '@/modules/simple-importer/api';

interface FlexibleImportValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FlexibleProcessedData;
  rawData: Record<string, string>[];
  onImportSuccess?: () => void;
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
              <p className="text-sm text-gray-400">
                Définir les noms des tags pour les capteurs au niveau des machines (niveau 5)
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
              </div>
            </div>
          </div>
        </div>

        {/* Mappage des tags pour les assets des niveaux supérieurs (niveaux 1-4) */}
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
                        placeholder="prod"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tag d'IPE */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        IPE (pièces)
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.ipeTag}
                        onChange={(e) => handleTagMappingChange('ipeTag', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ipe"
                      />
                    </div>
                    
                    {/* Tag d'IPE en kg */}
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-400">
                        IPE (kg)
                      </label>
                      <input
                        type="text"
                        value={importConfig.tagMappings.ipeKgTag}
                        onChange={(e) => handleTagMappingChange('ipeKgTag', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ipe_kg"
                      />
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
    try {
      setIsLoading(true);
      setError(null);
      
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
      const result = await importFlexibleData(data, authConfig);
      
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
        
        console.log('Import terminé avec succès, appel du callback onImportSuccess');
        onImportSuccess?.();
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

  const renderStepContent = () => {
    // Si c'est l'étape de configuration, afficher l'interface de configuration
    if (currentStep === 0) {
      return renderConfigurationStep();
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
            {steps[currentStep].renderDetails(stepResults[currentStep]?.details!)}
          </div>
        )}
      </>
    );
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
              Annuler
            </button>
            {currentStep > 0 && (
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