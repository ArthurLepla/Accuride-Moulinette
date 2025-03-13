'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { getAuthConfig } from '@/lib/auth';
import { ChevronDown, ChevronRight, RefreshCw, Search, ChevronLeft, Settings2, AlertCircle, Check, X, Plus } from 'lucide-react';

interface APIResponse {
  data: any;
  error?: string;
}

interface EndpointConfig {
  id: string;
  name: string;
  value: string;
  description: string;
  category: string;
  method: 'GET' | 'POST' | 'PUT';
  params?: {
    name: string;
    type: string;
    description: string;
  }[];
}

interface SourceTypeConfig {
  type: string;
  description: string;
  configFields: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

interface Tag {
  connectionName: string;
  tagName: string;
  topic: string;
  tagType: string;
  dataType: string;
}

interface VariableConfig {
  variableName: string;
  assetId: string;
  description?: string;
  unit?: string;
  dataType: string;
  sourceType?: string;
  sourceTypeConfig?: any;
  tag: Tag;
}

interface Adapter {
  id?: string;
  adapterId: string;
  name: string;
  type: string;
  connectionName?: string;
  [key: string]: any;
}

interface Connection {
  connectionName: string;
  tags: Array<{
    name: string;
    type: string;
    dataType: string;
    topic: string;
  }>;
}

const SOURCE_TYPES: SourceTypeConfig[] = [
  {
    type: 'Tag',
    description: 'Valeur provenant d\'un tag',
    configFields: []
  },
  {
    type: 'Constant',
    description: 'Valeur constante définie manuellement',
    configFields: [
      {
        name: 'value',
        type: 'string',
        required: true,
        description: 'Valeur constante à utiliser'
      }
    ]
  },
  {
    type: 'Calculated',
    description: 'Valeur calculée à partir d\'une formule',
    configFields: [
      {
        name: 'formula',
        type: 'string',
        required: true,
        description: 'Formule de calcul'
      },
      {
        name: 'variables',
        type: 'array',
        required: true,
        description: 'Variables utilisées dans la formule'
      }
    ]
  },
  {
    type: 'External',
    description: 'Valeur provenant d\'une source externe',
    configFields: [
      {
        name: 'url',
        type: 'string',
        required: true,
        description: 'URL de la source externe'
      },
      {
        name: 'method',
        type: 'string',
        required: true,
        description: 'Méthode HTTP (GET, POST, etc.)'
      }
    ]
  }
];

const DATA_TYPES = [
  'BOOL',
  'BYTE',
  'WORD',
  'DWORD',
  'INT',
  'DINT',
  'REAL',
  'STRING',
  'FLOAT32',
  'FLOAT64',
  'INT8',
  'INT16',
  'INT32',
  'INT64',
  'UINT8',
  'UINT16',
  'UINT32',
  'UINT64',
  'DOUBLE'
];

// Ajouter ces constantes pour les types de tags
const TAG_TYPES = [
  'Bool',
  'Byte',
  'Word',
  'DWord',
  'Int',
  'DInt',
  'Real',
  'Float',
  'String'
];

interface CreateVariableFormProps {
  onClose: () => void;
  onSubmit: (variable: VariableConfig) => Promise<void>;
  availableConnections: Adapter[];
  selectedConnection: string;
  onConnectionSelect: (connectionId: string) => void;
  initialVariable: VariableConfig;
}

const CreateVariableForm: React.FC<CreateVariableFormProps> = ({
  onClose,
  onSubmit,
  availableConnections,
  selectedConnection,
  onConnectionSelect,
  initialVariable
}) => {
  const [variable, setVariable] = useState<VariableConfig>(() => ({
    ...initialVariable,
    sourceType: 'Tag',  // Forcer la valeur à 'Tag'
    tag: {
      connectionName: initialVariable.tag?.connectionName || '',
      tagName: initialVariable.tag?.tagName || '',
      tagType: initialVariable.tag?.tagType || '',
      topic: initialVariable.tag?.topic || '',
      dataType: initialVariable.tag?.dataType || ''
    }
  }));

  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnectionData, setSelectedConnectionData] = useState<Connection | null>(null);

  // Charger les connections quand un adapter est sélectionné
  useEffect(() => {
    const loadConnections = async () => {
      if (!selectedConnection) {
        setConnections([]);
        setSelectedConnectionData(null);
        setError(null);
        return;
      }

      setIsLoadingConnections(true);
      setError(null);

      try {
        const authConfig = getAuthConfig();
        if (!authConfig) {
          setError('Configuration d\'authentification manquante');
          return;
        }

        const response = await fetch(`/api/adapters/${selectedConnection}/connections`, {
          headers: {
            'X-Auth-Config': JSON.stringify(authConfig)
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Réponse des connections:', data);
        
        if (!data || !data.connections || !Array.isArray(data.connections)) {
          setError('Format de réponse invalide');
          setConnections([]);
          return;
        }

        setConnections(data.connections);

        // Si nous n'avons trouvé aucune connection
        if (data.connections.length === 0) {
          setError('Aucune connection disponible pour cet adapter');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des connections:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
        setConnections([]);
      } finally {
        setIsLoadingConnections(false);
      }
    };

    loadConnections();
  }, [selectedConnection]);

  // Mettre à jour les données de la connection sélectionnée
  useEffect(() => {
    const connection = connections.find(c => c.connectionName === variable.tag.connectionName);
    setSelectedConnectionData(connection || null);
  }, [variable.tag.connectionName, connections]);

  const handleTagChange = (field: keyof Tag, value: string) => {
    setVariable(prev => {
      const updatedTag = { ...prev.tag, [field]: value };

      // Si on change le connectionName, on réinitialise les autres champs du tag
      if (field === 'connectionName') {
        updatedTag.tagName = '';
        updatedTag.tagType = '';
        updatedTag.topic = '';
        updatedTag.dataType = '';
      }

      // Si on sélectionne un tag, on met à jour automatiquement ses propriétés
      if (field === 'tagName' && selectedConnectionData) {
        const selectedTag = selectedConnectionData.tags.find(t => t.name === value);
        if (selectedTag) {
          updatedTag.tagType = selectedTag.type;
          updatedTag.dataType = selectedTag.dataType;
          updatedTag.topic = selectedTag.topic;
        }
      }

      return {
        ...prev,
        tag: updatedTag,
        dataType: updatedTag.dataType || prev.dataType // Mettre à jour le dataType de la variable
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Créer une Variable</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de la variable *
              </label>
              <input
                type="text"
                value={variable.variableName}
                onChange={(e) => setVariable({
                  ...variable,
                  variableName: e.target.value
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nom_variable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Asset ID *
              </label>
              <input
                type="text"
                value={variable.assetId}
                onChange={(e) => setVariable({
                  ...variable,
                  assetId: e.target.value
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ID de l'asset parent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={variable.description}
                onChange={(e) => setVariable({
                  ...variable,
                  description: e.target.value
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description de la variable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unité
              </label>
              <input
                type="text"
                value={variable.unit}
                onChange={(e) => setVariable({
                  ...variable,
                  unit: e.target.value
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="kWh, m³, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de données *
              </label>
              <select
                value={variable.dataType}
                onChange={(e) => setVariable({
                  ...variable,
                  dataType: e.target.value
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag Configuration */}
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Configuration du Tag</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adapter
                  </label>
                  <select
                    value={selectedConnection}
                    onChange={(e) => {
                      onConnectionSelect(e.target.value);
                      handleTagChange('connectionName', '');
                      setError(null);
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un adapter</option>
                    {availableConnections.map(adapter => (
                      <option key={adapter.adapterId} value={adapter.adapterId}>
                        {adapter.name} ({adapter.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Connection Name
                  </label>
                  <select
                    value={variable.tag.connectionName}
                    onChange={(e) => handleTagChange('connectionName', e.target.value)}
                    disabled={!selectedConnection || isLoadingConnections}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une connection</option>
                    {connections.map(conn => (
                      <option key={conn.connectionName} value={conn.connectionName}>
                        {conn.connectionName}
                      </option>
                    ))}
                  </select>
                  {isLoadingConnections && (
                    <div className="mt-2 text-sm text-gray-400">
                      Chargement des connections...
                    </div>
                  )}
                  {error && (
                    <div className="mt-2 text-sm text-red-400">
                      {error}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tag disponibles
                  </label>
                  <select
                    value={variable.tag.tagName}
                    onChange={(e) => handleTagChange('tagName', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedConnection || !variable.tag.connectionName}
                  >
                    <option value="">Sélectionner un tag</option>
                    {selectedConnectionData?.tags.map(tag => (
                      <option key={tag.name} value={tag.name}>
                        {tag.name} ({tag.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de tag
                  </label>
                  <input
                    type="text"
                    value={variable.tag.tagType}
                    readOnly
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={variable.tag.topic}
                    readOnly
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Source Type Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de source
              </label>
              <select
                value={variable.sourceType || 'Tag'}
                onChange={(e) => setVariable({
                  ...variable,
                  sourceType: e.target.value,
                  sourceTypeConfig: {}
                })}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled
              >
                <option value="Tag">Tag</option>
              </select>
            </div>

            {/* Configuration spécifique au type de source */}
            {variable.sourceType && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Configuration de la source</h3>
                {SOURCE_TYPES.find(st => st.type === variable.sourceType)?.configFields.map(field => (
                  <div key={field.name} className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {field.name}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === 'array' ? (
                      <textarea
                        value={JSON.stringify(variable.sourceTypeConfig?.[field.name] || [], null, 2)}
                        onChange={(e) => {
                          try {
                            const value = JSON.parse(e.target.value);
                            setVariable({
                              ...variable,
                              sourceTypeConfig: {
                                ...variable.sourceTypeConfig,
                                [field.name]: value
                              }
                            });
                          } catch (error) {
                            // Ignorer les erreurs de parsing JSON pendant la saisie
                          }
                        }}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        rows={4}
                      />
                    ) : (
                      <input
                        type="text"
                        value={variable.sourceTypeConfig?.[field.name] || ''}
                        onChange={(e) => setVariable({
                          ...variable,
                          sourceTypeConfig: {
                            ...variable.sourceTypeConfig,
                            [field.name]: e.target.value
                          }
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={field.description}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => onSubmit(variable)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Créer la variable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SandboxPage() {
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('adapters');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Assets', 'Variables', 'Adapters']);
  const [selectedAdapter, setSelectedAdapter] = useState<any | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);
  const [editingSourceType, setEditingSourceType] = useState(false);
  const [sourceTypeConfig, setSourceTypeConfig] = useState<any>({});
  const [updateStatus, setUpdateStatus] = useState<{
    loading: boolean;
    error?: string;
    success?: boolean;
  }>({ loading: false });
  const [showCreateVariable, setShowCreateVariable] = useState(false);
  const [newVariable, setNewVariable] = useState<VariableConfig>(() => ({
    variableName: '',
    assetId: '',
    description: '',
    unit: '',
    dataType: 'Float',
    sourceType: 'Tag',  // Forcer la valeur à 'Tag'
    sourceTypeConfig: {},
    tag: {
      connectionName: '',
      tagName: '',
      tagType: '',
      topic: '',
      dataType: ''
    }
  }));
  const [availableConnections, setAvailableConnections] = useState<Adapter[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedConnectionName, setSelectedConnectionName] = useState<string>('');

  const endpoints: EndpointConfig[] = [
    // Assets
    { 
      id: 'asset-root',
      name: 'Asset Racine', 
      value: 'assets/root', 
      description: 'Récupère l\'asset racine',
      category: 'Assets',
      method: 'GET'
    },
    
    // Variables
    { 
      id: 'variables-list',
      name: 'Liste des Variables', 
      value: 'variables', 
      description: 'Liste toutes les variables',
      category: 'Variables',
      method: 'GET'
    },
    
    // Adapters
    { 
      id: 'adapters-list',
      name: 'Liste des Adapters', 
      value: 'adapters', 
      description: 'Liste tous les adapters IIH',
      category: 'Adapters',
      method: 'GET'
    },
    { 
      id: 'adapter-details',
      name: 'Détails d\'un Adapter', 
      value: 'adapters/:id', 
      description: 'Récupère les détails d\'un adapter spécifique',
      category: 'Adapters',
      method: 'GET',
      params: [
        {
          name: 'id',
          type: 'string',
          description: 'Identifiant de l\'adapter'
        }
      ]
    },
    
    // Aggregations
    { 
      id: 'aggregations-list',
      name: 'Liste des Agrégations', 
      value: 'aggregations', 
      description: 'Liste toutes les agrégations',
      category: 'Aggregations',
      method: 'GET'
    },
    {
      id: 'attribute-update',
      name: 'Modifier Attribut',
      value: 'attributes/:id',
      description: 'Modifie la configuration d\'un attribut',
      category: 'Attributes',
      method: 'PUT',
      params: [
        {
          name: 'id',
          type: 'string',
          description: 'Identifiant de l\'attribut'
        }
      ]
    },
    {
      id: 'variable-update',
      name: 'Configurer Variable',
      value: 'variables/:id',
      description: 'Configure une variable et ses attributs',
      category: 'Variables',
      method: 'PUT',
      params: [
        {
          name: 'id',
          type: 'string',
          description: 'Identifiant de la variable'
        }
      ]
    },
    {
      id: 'variable-create',
      name: 'Créer Variable',
      value: 'variables',
      description: 'Crée une nouvelle variable pour un asset',
      category: 'Variables',
      method: 'POST',
      params: [
        {
          name: 'variableName',
          type: 'string',
          description: 'Nom de la variable'
        },
        {
          name: 'assetId',
          type: 'string',
          description: 'ID de l\'asset parent'
        }
      ]
    }
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredEndpoints = endpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedEndpoints = filteredEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = [];
    }
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, EndpointConfig[]>);

  const renderJsonTree = (data: any, level = 0) => {
    if (typeof data !== 'object' || data === null) {
      return <span className="text-green-400">{JSON.stringify(data)}</span>;
    }

    if (Array.isArray(data)) {
      return (
        <div style={{ marginLeft: level > 0 ? '1.5rem' : 0 }}>
          {data.map((item, index) => (
            <div key={index} className="my-1 bg-gray-800 p-4 rounded-lg">
              {selectedEndpoint === 'adapters' && item.adapterId && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-400 font-medium">{item.name || 'Adapter ' + item.adapterId}</span>
                  <button
                    onClick={() => {
                      setSelectedAdapter(item);
                      const detailsEndpoint = endpoints.find(e => e.value === 'adapters/:id');
                      if (detailsEndpoint) {
                        setSelectedEndpoint(detailsEndpoint.value);
                        setTimeout(fetchData, 0);
                      }
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                  >
                    <span>Voir les détails</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              {renderJsonTree(item, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={{ marginLeft: level > 0 ? '1.5rem' : 0 }}>
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="my-1">
            <span className="text-blue-400">{key}:</span>{' '}
            {renderJsonTree(value, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  const renderAdapterDetails = (adapter: any) => {
    if (!adapter) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">{adapter.name || 'Adapter ' + adapter.id}</h3>
          <button
            onClick={() => setSelectedAdapter(null)}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour à la liste
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">ID</h4>
            <p className="text-white">{adapter.id}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Type</h4>
            <p className="text-white">{adapter.type || 'N/A'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">État</h4>
            <p className="text-white">{adapter.state || 'N/A'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Version</h4>
            <p className="text-white">{adapter.version || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Configuration</h4>
          <pre className="text-white overflow-auto p-2 bg-gray-800 rounded">
            {JSON.stringify(adapter.configuration || {}, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const renderAdaptersList = (data: any[]) => {
    if (!Array.isArray(data)) return null;
    
    return (
      <div className="grid gap-4">
        {data.map((adapter, index) => (
          <div key={index} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {adapter.name || 'Adapter ' + adapter.id}
                </h3>
                <p className="text-sm text-gray-400">ID: {adapter.id}</p>
                <p className="text-sm text-gray-400">Type: {adapter.type || 'N/A'}</p>
              </div>
              <button
                onClick={() => setSelectedAdapter(adapter)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
              >
                <span>Voir les détails</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSourceTypeEditor = () => {
    if (!selectedAttribute) return null;

    const currentSourceType = selectedAttribute.sourceType || 'CONSTANT';
    const sourceTypeInfo = SOURCE_TYPES.find(st => st.type === currentSourceType);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Configuration du SourceType</h3>
          <button
            onClick={() => setEditingSourceType(false)}
            className="text-sm text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type de source
          </label>
          <select
            value={currentSourceType}
            onChange={(e) => {
              setSourceTypeConfig({});
              setSelectedAttribute({
                ...selectedAttribute,
                sourceType: e.target.value
              });
            }}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SOURCE_TYPES.map(st => (
              <option key={st.type} value={st.type}>{st.type}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-400">
            {sourceTypeInfo?.description}
          </p>
        </div>

        {sourceTypeInfo && (
          <div className="space-y-4">
            {sourceTypeInfo.configFields.map(field => (
              <div key={field.name} className="bg-gray-700 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.name}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {field.type === 'array' ? (
                  <textarea
                    value={JSON.stringify(sourceTypeConfig[field.name] || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const value = JSON.parse(e.target.value);
                        setSourceTypeConfig({
                          ...sourceTypeConfig,
                          [field.name]: value
                        });
                      } catch (error) {
                        // Ignorer les erreurs de parsing JSON pendant la saisie
                      }
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    rows={4}
                  />
                ) : (
                  <input
                    type="text"
                    value={sourceTypeConfig[field.name] || ''}
                    onChange={(e) => setSourceTypeConfig({
                      ...sourceTypeConfig,
                      [field.name]: e.target.value
                    })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.description}
                  />
                )}
                <p className="mt-1 text-sm text-gray-400">{field.description}</p>
              </div>
            ))}

            <button
              onClick={async () => {
                setUpdateStatus({ loading: true });
                try {
                  const response = await fetch(`/api/variables/${selectedAttribute.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Auth-Config': JSON.stringify(getAuthConfig())
                    },
                    body: JSON.stringify({
                      sourceType: currentSourceType,
                      sourceTypeConfig: sourceTypeConfig
                    })
                  });

                  if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour');
                  }

                  const data = await response.json();
                  setSelectedAttribute(data);
                  setUpdateStatus({ loading: false, success: true });
                  setTimeout(() => setUpdateStatus({ loading: false }), 2000);
                } catch (error) {
                  setUpdateStatus({
                    loading: false,
                    error: error instanceof Error ? error.message : 'Une erreur est survenue'
                  });
                }
              }}
              disabled={updateStatus.loading}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                updateStatus.loading
                  ? 'bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {updateStatus.loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Appliquer les modifications'
              )}
            </button>

            {updateStatus.error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500">{updateStatus.error}</p>
              </div>
            )}

            {updateStatus.success && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-500">Configuration mise à jour avec succès</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAttributeDetails = (attribute: any) => {
    if (!attribute) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">{attribute.name}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingSourceType(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
            >
              <Settings2 className="h-4 w-4" />
              <span>Configurer SourceType</span>
            </button>
            <button
              onClick={() => setSelectedAttribute(null)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">ID</h4>
            <p className="text-white">{attribute.id}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Type</h4>
            <p className="text-white">{attribute.type || 'N/A'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Source Type</h4>
            <p className="text-white">{attribute.sourceType || 'N/A'}</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
            <p className="text-white">{attribute.description || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Configuration actuelle</h4>
          <pre className="text-white overflow-auto p-2 bg-gray-800 rounded">
            {JSON.stringify(attribute.sourceTypeConfig || {}, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const handleCreateVariable = async (variable: VariableConfig) => {
    try {
      console.log('Début de la création de variable avec les données:', {
        variable,
        tag: variable.tag,
        sourceType: variable.sourceType,
        sourceTypeConfig: variable.sourceTypeConfig
      });

      // Vérifier que tous les champs requis sont présents
      if (!variable.variableName || !variable.assetId) {
        throw new Error('Nom de variable et Asset ID sont requis');
      }

      // Trouver l'adapter correspondant à la connection sélectionnée
      const selectedAdapter = availableConnections.find(
        adapter => adapter.adapterId === selectedConnection
      );

      if (!selectedAdapter) {
        throw new Error('Adapter non trouvé');
      }

      // Formater les données pour l'API
      const formattedVariable = {
        name: variable.variableName,
        assetId: variable.assetId,
        description: variable.description || '',
        unit: variable.unit || '',
        dataType: variable.dataType,
        sourceType: variable.sourceType || 'Tag',
        sourceTypeConfig: variable.sourceTypeConfig || {},
        tag: variable.tag && variable.tag.connectionName ? {
          adapterId: selectedAdapter.adapterId, // Ajouter l'adapterId
          connectionName: variable.tag.connectionName,
          tagName: variable.tag.tagName,
          tagType: variable.tag.tagType,
          topic: variable.tag.topic,
          dataType: variable.tag.dataType
        } : undefined
      };

      console.log('Données formatées pour l\'API:', formattedVariable);

      const response = await fetch('/api/variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Config': JSON.stringify(getAuthConfig())
        },
        body: JSON.stringify(formattedVariable)
      });

      console.log('Statut de la réponse:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erreur de réponse:', {
          status: response.status,
          body: errorData
        });
        throw new Error(`Erreur lors de la création de la variable: ${errorData}`);
      }

      const data = await response.json();
      console.log('Variable créée avec succès:', data);

      setShowCreateVariable(false);
      if (selectedEndpoint === 'variables') {
        fetchData();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la variable:', error);
      // TODO: Ajouter un message d'erreur à l'interface utilisateur
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) {
        throw new Error('Non authentifié');
      }

      // Construire l'URL en remplaçant les paramètres si nécessaire
      let endpoint = selectedEndpoint;
      if (endpoint.includes(':id') && selectedAdapter) {
        endpoint = endpoint.replace(':id', selectedAdapter.id);
      }

      const response = await fetch(`/api/${endpoint}`, {
        headers: {
          'X-Auth-Config': JSON.stringify(authConfig)
        }
      });

      const data = await response.json();
      setResponse({ data });
    } catch (error) {
      setResponse({ 
        data: null, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Modification de la gestion des adapters et tags
  useEffect(() => {
    let mounted = true;

    const loadAdapters = async () => {
      try {
        const authConfig = getAuthConfig();
        if (!authConfig) return;

        console.log('Chargement des adapters...');
        const response = await fetch('/api/adapters', {
          headers: {
            'X-Auth-Config': JSON.stringify(authConfig)
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des adapters');
        }

        const rawData = await response.json();
        console.log('Réponse brute de l\'API:', rawData);

        if (mounted) {
          // Traitement des données des adapters
          let adapters: Adapter[];
          if (rawData.adapters && Array.isArray(rawData.adapters)) {
            adapters = rawData.adapters.map((adapter: any) => ({
              ...adapter,
              adapterId: adapter.id || adapter.adapterId,
              connectionName: adapter.name // Utiliser le nom comme connectionName par défaut
            }));
          } else if (Array.isArray(rawData)) {
            adapters = rawData.map((adapter: any) => ({
              ...adapter,
              adapterId: adapter.id || adapter.adapterId,
              connectionName: adapter.name
            }));
          } else if (rawData.data && Array.isArray(rawData.data)) {
            adapters = rawData.data.map((adapter: any) => ({
              ...adapter,
              adapterId: adapter.id || adapter.adapterId,
              connectionName: adapter.name
            }));
          } else {
            adapters = [];
          }

          console.log('Adapters traités:', adapters);
          setAvailableConnections(adapters);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des adapters:', error);
        if (mounted) {
          setAvailableConnections([]);
        }
      }
    };

    loadAdapters();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadTags = async () => {
      if (!selectedConnection || !selectedConnectionName) {
        setSelectedConnectionName('');
        return;
      }

      try {
        const authConfig = getAuthConfig();
        if (!authConfig) return;

        console.log('Chargement des tags pour:', {
          adapterId: selectedConnection,
          connectionName: selectedConnectionName
        });

        const response = await fetch(`/api/adapters/${selectedConnection}/tags?connectionName=${selectedConnectionName}`, {
          headers: {
            'X-Auth-Config': JSON.stringify(authConfig)
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des tags');
        }

        const data = await response.json();
        console.log('Tags reçus:', data);

        if (mounted) {
          setSelectedConnectionName(data.connectionName || '');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tags:', error);
        if (mounted) {
          setSelectedConnectionName('');
        }
      }
    };

    loadTags();

    return () => {
      mounted = false;
    };
  }, [selectedConnection]);

  useEffect(() => {
    if (!showCreateVariable) {
      setNewVariable({
        variableName: '',
        assetId: '',
        description: '',
        unit: '',
        dataType: 'Float',
        sourceType: 'Tag',
        sourceTypeConfig: {},
        tag: {
          connectionName: '',
          tagName: '',
          tagType: '',
          topic: '',
          dataType: ''
        }
      });
    }
  }, [showCreateVariable]);

  return (
    <AppLayout>
      {showCreateVariable && (
        <CreateVariableForm
          onClose={() => setShowCreateVariable(false)}
          onSubmit={handleCreateVariable}
          availableConnections={availableConnections}
          selectedConnection={selectedConnection}
          onConnectionSelect={setSelectedConnection}
          initialVariable={newVariable}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Sandbox API IIH</h1>
          <button
            onClick={() => setShowCreateVariable(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Créer une Variable
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section de contrôle */}
          <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un endpoint..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Liste des endpoints */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Endpoints API</h2>
              <div className="space-y-4">
                {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                  <div key={category} className="border border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <span className="text-white font-medium">{category}</span>
                      {expandedCategories.includes(category) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedCategories.includes(category) && (
                      <div className="p-3 space-y-2">
                        {endpoints.map((endpoint) => (
                          <div
                            key={endpoint.id}
                            onClick={() => setSelectedEndpoint(endpoint.value)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedEndpoint === endpoint.value
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <div className="font-medium">{endpoint.name}</div>
                            <div className="text-sm opacity-75">{endpoint.description}</div>
                            <div className="mt-2 text-xs">
                              <span className="px-2 py-1 rounded-full bg-gray-600">
                                {endpoint.method}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton d'exécution */}
            <button
              onClick={fetchData}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors`}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Exécuter la requête
                </>
              )}
            </button>
          </div>

          {/* Section de réponse */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              {selectedAdapter ? 'Détails de l\'adapter' : selectedAttribute ? 'Détails de l\'attribut' : 'Réponse'}
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-6 overflow-auto max-h-[600px]">
              {loading && (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}

              {!loading && response && (
                <div className="font-mono text-sm">
                  {response.error ? (
                    <div className="text-red-400 bg-red-900/20 p-4 rounded-md">
                      <p className="font-medium">Erreur:</p>
                      <p>{response.error}</p>
                    </div>
                  ) : (
                    <>
                      {selectedAdapter && renderAdapterDetails(selectedAdapter)}
                      {selectedAttribute && !editingSourceType && renderAttributeDetails(selectedAttribute)}
                      {selectedAttribute && editingSourceType && renderSourceTypeEditor()}
                      {!selectedAttribute && !selectedAdapter && renderJsonTree(response.data)}
                    </>
                  )}
                </div>
              )}

              {!loading && !response && (
                <div className="text-gray-400 text-center py-12">
                  Sélectionnez un endpoint et cliquez sur "Exécuter la requête"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 