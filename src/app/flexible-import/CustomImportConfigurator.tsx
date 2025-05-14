'use client';

import React, { useState, useEffect } from 'react';
import { Button, Stepper, Group, Title, Text, Paper, SimpleGrid, Select, TextInput, Checkbox, NumberInput, Code, LoadingOverlay, Alert, ActionIcon, Divider, Accordion, Tooltip, Menu, Popover, Stack } from '@mantine/core';
import { CustomImportConfig, DEFAULT_CUSTOM_IMPORT_CONFIG, LevelVariableConfig, PatternBlock, PlaceholderKey, PatternBlockType, InitialHierarchyConfig, DEFAULT_RETENTION_CONFIG, UnitRule } from '@/modules/custom-importer/types';
import { IconHierarchy, IconVariable, IconPlugConnected, IconTags, IconClock, IconExchange, IconAlertCircle, IconTrash, IconPlus, IconSettings, IconX, IconGripVertical, IconPlaceholder, IconStack2 } from '@tabler/icons-react';
import { IIHApi } from '@/modules/simple-importer/api';
import { AuthConfig } from '@/modules/simple-importer/types';
import { useProfile } from '@/contexts/ProfileContext';
import { nanoid } from 'nanoid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { slugify } from '@/utils/slugify';

interface AdapterInfo {
    id: string;
    name: string;
    // add other relevant fields if needed
}

interface CustomImportConfiguratorProps {
  processedData: Record<string, any>[] | null; 
  availableColumns: string[]; 
  // Use the imported InitialHierarchyConfig type
  initialHierarchyConfig: InitialHierarchyConfig;
  onConfigComplete: (config: CustomImportConfig) => void; 
  onCancel: () => void; 
}

// Use the imported default config
const initialConfigBase: Omit<CustomImportConfig, 'hierarchy'> & { retention: typeof DEFAULT_RETENTION_CONFIG } = {
  selectedAdapterId: DEFAULT_CUSTOM_IMPORT_CONFIG.selectedAdapterId,
  variables: DEFAULT_CUSTOM_IMPORT_CONFIG.variables,
  retention: DEFAULT_RETENTION_CONFIG,
  mappings: DEFAULT_CUSTOM_IMPORT_CONFIG.mappings,
};

// Function to generate example name
const generateExampleName = (pattern: string, levelName: string, energyType: string | undefined): string => {
  let example = pattern;
  const sanitizedLevelName = levelName.replace(/[^a-zA-Z0-9_]/g, '_');
  // Simulate energy type mapping (replace with actual logic if needed)
  const energyTypeDisplay = energyType === 'elec' ? 'Electricite' : energyType;
  
  example = example.replace(/\{assetName\}/g, sanitizedLevelName || '[NomNiveau]');
  example = example.replace(/\{energyType\}/g, energyTypeDisplay || '[TypeEnergie]');
  // Add other placeholders if needed
  return example;
};

// --- PatternBuilder Component --- 
interface PatternBuilderProps {
  value: PatternBlock[];
  onChange: (newValue: PatternBlock[]) => void;
  availablePlaceholders: Record<PlaceholderKey, string>; // Map key to display name
}

// Individual Sortable Block Item
function SortableBlockItem({ block, index, availablePlaceholders, onUpdate, onRemove }: {
  block: PatternBlock;
  index: number;
  availablePlaceholders: Record<PlaceholderKey, string>;
  onUpdate: (index: number, updatedBlock: PatternBlock) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none', // Prevent default touch actions like scrolling during drag
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement> | string | null) => {
    const newValue = typeof e === 'string' ? e : e?.currentTarget?.value ?? '';
    onUpdate(index, { ...block, value: newValue });
  };

  return (
    <Group ref={setNodeRef} style={style} gap="xs" wrap="nowrap" mb={5} align="flex-end">
      {/* Drag Handle */} 
      <Tooltip label="Glisser pour réordonner" position="top">
        <ActionIcon variant="subtle" {...attributes} {...listeners} style={{ cursor: 'grab' }}>
          <IconGripVertical size={16} />
        </ActionIcon>
      </Tooltip>

      {/* Input/Select */} 
      {block.type === 'text' ? (
        <TextInput
          size="xs"
          placeholder="Texte fixe..."
          value={block.value}
          onChange={handleValueChange}
          style={{ flexGrow: 1 }}
          className="dark:text-white"
        />
      ) : (
        <Select
          size="xs"
          placeholder="Choisir Placeholder..."
          value={block.value}
          onChange={handleValueChange}
          data={Object.entries(availablePlaceholders).map(([key, label]) => ({ value: key, label }))}
          style={{ flexGrow: 1 }}
          className="dark:text-white"
        />
      )}
      {/* Remove Button */} 
      <Tooltip label="Supprimer ce bloc" position="top">
          <ActionIcon color="red" variant="subtle" onClick={() => onRemove(index)} size="xs">
            <IconX size={14} />
          </ActionIcon>
      </Tooltip>
    </Group>
  );
}

function PatternBuilder({ value = [], onChange, availablePlaceholders }: PatternBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Drag only after 5px move
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddBlock = (type: PatternBlockType) => {
    const newBlock: PatternBlock = {
      id: nanoid(5),
      type,
      value: type === 'placeholder' ? Object.keys(availablePlaceholders)[0] || '' : '' // Default to first placeholder or empty
    };
    onChange([...value, newBlock]);
  };

  const handleRemoveBlock = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpdateBlock = (index: number, updatedBlock: PatternBlock) => {
    const newValue = [...value];
    newValue[index] = updatedBlock;
    onChange(newValue);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex(item => item.id === active.id);
      const newIndex = value.findIndex(item => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(value, oldIndex, newIndex));
      }
    }
  };

  const generatePreview = () => {
    return value.map(block => {
        if (block.type === 'text') {
            return block.value.replace(/[^a-zA-Z0-9_]/g, '_'); // Sanitize text blocks
        }
        if (block.type === 'placeholder') {
            return `{${block.value}}`;
        }
        return '';
    }).join('_'); // Join with underscore
  };

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {value.map((block, index) => (
            <SortableBlockItem 
              key={block.id} 
              block={block} 
              index={index} 
              availablePlaceholders={availablePlaceholders}
              onUpdate={handleUpdateBlock}
              onRemove={handleRemoveBlock}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button variant="light" size="xs" leftSection={<IconPlus size={14} />}>
            Ajouter un Bloc
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => handleAddBlock('text')}>
            Texte Fixe
          </Menu.Item>
          <Menu.Item leftSection={<IconPlaceholder size={14} />} onClick={() => handleAddBlock('placeholder')}>
            Placeholder
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      
      {value.length > 0 && (
        <Paper withBorder p="xs" radius="sm" className="bg-gray-100 dark:bg-gray-700">
            <Text size="xs" c="dimmed">Aperçu:</Text>
            <Code className="text-xs block break-all bg-transparent">{generatePreview()}</Code>
        </Paper>
      )}
    </div>
  );
}
// --- End PatternBuilder --- 

const PLACEHOLDER_MAP: Record<PlaceholderKey, string> = {
  assetName: "Nom Asset",
  energyType: "Type Énergie",
  levelName: "Nom Niveau",
};

// Définir un type local pour le niveau de hiérarchie avec variables (pour le state du front)
interface HierarchyLevelWithVars extends Omit<InitialHierarchyConfig, 'levels'> {
  columnName: string;
  levelVariables: LevelVariableConfig[];
}

// Utilitaire pour options Mantine
function toSelectOptions(arr: string[]): { value: string; label: string }[] {
  // GUARD CLAUSE: Handle non-array inputs gracefully
  if (!Array.isArray(arr)) {
    console.warn("DEBUG: toSelectOptions received non-array:", arr);
    return []; // Return empty array to prevent errors
  }
  return arr.map(val => ({ value: val, label: val }));
}

export function CustomImportConfigurator({ 
  processedData, 
  availableColumns, 
  // Use the imported InitialHierarchyConfig type
  initialHierarchyConfig, 
  onConfigComplete, 
  onCancel 
}: CustomImportConfiguratorProps) {
  const [activeStep, setActiveStep] = useState(0);
  // Initialize state using the passed initial hierarchy config
  const [config, setConfig] = useState<CustomImportConfig & { hierarchy: { levels: HierarchyLevelWithVars[], energyTypeColumn?: string }, retention: typeof DEFAULT_RETENTION_CONFIG }>(() => ({
    ...initialConfigBase, // Start with the non-hierarchy defaults
    ...DEFAULT_CUSTOM_IMPORT_CONFIG, // In case other defaults are added
    hierarchy: { 
      levels: initialHierarchyConfig.levels.map((level: { columnName: string }) => ({ 
          columnName: level.columnName,
          levelVariables: [] 
      })), 
      energyTypeColumn: initialHierarchyConfig.energyTypeColumn || DEFAULT_CUSTOM_IMPORT_CONFIG.hierarchy.energyTypeColumn
    },
    retention: {
      ...DEFAULT_RETENTION_CONFIG,
      ...(DEFAULT_CUSTOM_IMPORT_CONFIG.retention || {}),
    },
    tagMappings: [], // Initialisation de tagMappings comme tableau vide
    aggregation: {
      defaultMethod: 'average',
      cycles: [
        { interval: 'hour', retention: 24 },  // 24 heures 
        { interval: 'day', retention: 30 }    // 30 jours
      ]
    },
  }));
  
  const [adapters, setAdapters] = useState<AdapterInfo[]>([]);
  const [loadingAdapters, setLoadingAdapters] = useState<boolean>(false);
  const [adapterError, setAdapterError] = useState<string | null>(null);
  const { profile } = useProfile(); 

  // 1. Add state for tags and loading/errors
  const [adapterTags, setAdapterTags] = useState<Record<string, any[]>>({}); // key: adapterId, value: tags
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // 2. Fetch tags when entering Variables step (activeStep === 1)
  useEffect(() => {
    if (activeStep === 1 && config.selectedAdapterId) {
      const authConfigString = localStorage.getItem('authConfig');
      if (!authConfigString) {
        setTagsError("Configuration d'authentification introuvable.");
        return;
      }
      let authConfig: AuthConfig;
      try {
        authConfig = JSON.parse(authConfigString);
        if (!authConfig.baseUrl || !authConfig.token) {
          throw new Error("Config d'auth incomplète");
        }
      } catch (e: any) {
        setTagsError("Erreur de parsing de la config d'auth");
        return;
      }

      setTagsLoading(true);
      setTagsError(null);

      // Utilisation de la méthode du IIHApi
      new IIHApi(authConfig)
        .getAdapterTags(config.selectedAdapterId)
        .then((tags) => {
          setAdapterTags((prev) => ({ ...prev, [config.selectedAdapterId!]: tags }));
          setTagsLoading(false);
        })
        .catch((err) => {
          setTagsError('Erreur lors du chargement des tags: ' + (err?.message || String(err)));
          setTagsLoading(false);
        });
    }
  }, [activeStep, config.selectedAdapterId]);

  // --- Fetch Adapters --- 
  useEffect(() => {
    const fetchAdapters = async () => {
      // Fetch auth config directly from localStorage
      const authConfigString = localStorage.getItem('authConfig');
      
      if (!authConfigString) {
          setAdapterError("Configuration d'authentification introuvable. Veuillez vous reconnecter ou reconfigurer l'environnement.");
          setLoadingAdapters(false); 
          return;
      }

      let authConfig: AuthConfig;
      try {
          authConfig = JSON.parse(authConfigString);
          // Validate essential parts of AuthConfig
          if (!authConfig.baseUrl || !authConfig.token) {
              throw new Error("La configuration d'authentification est invalide (URL ou token manquant).");
          }
      } catch (e: any) {
          console.error("Erreur parsing AuthConfig depuis localStorage:", e);
          setAdapterError(`Erreur de configuration d'authentification: ${e.message}. Veuillez reconfigurer.`);
          setLoadingAdapters(false);
          return;
      }
      
      // Destructure needed properties from the parsed authConfig
      const { baseUrl, token, iedIp } = authConfig;

      setLoadingAdapters(true);
      setAdapterError(null);
      try {
        // Test de connectivité avant la requête réelle
        const testResponse = await fetch(`${baseUrl}/ping`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!testResponse.ok) {
          console.log("Test de connectivité échoué:", testResponse.status);
        }
        
        const api = new IIHApi(authConfig);
        const fetchedAdapters = await api.getAdapters();
        setAdapters(fetchedAdapters || []);
      } catch (error: any) {
        console.error("Erreur détaillée:", error);
        setAdapterError(error.message || "Impossible de charger la liste des adaptateurs.");
        setAdapters([]);
      } finally {
        setLoadingAdapters(false);
      }
    };
    
    // Run fetchAdapters once when the component mounts or if profile context indicates auth might be ready
    // (We still depend on profile slightly to know *when* authConfig *should* be available)
    if (profile) { // Only attempt fetch if profile context suggests user might be logged in
        fetchAdapters();
    }

  }, [profile]); // Keep profile dependency to trigger fetch when user context is ready

  // Update steps count for navigation
  const MAX_STEP_INDEX = 5; // 6 steps: Hierarchy(0), VarsByLevel(1), AdapterTags(2), Retention(3), Mappings(4), Aggregation(5)
  const nextStep = () => setActiveStep((current) => (current < MAX_STEP_INDEX ? current + 1 : current)); 
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  // Specific handler for hierarchy level column change
  const handleHierarchyLevelChange = (index: number, value: string | null) => {
      setConfig((prev: CustomImportConfig) => {
          const newLevels = prev.hierarchy.levels.map((level: HierarchyLevelWithVars, i: number) => 
              i === index ? { ...level, columnName: value || '' } : level
          );
          // Ensure we don't have trailing empty levels except maybe the last one during editing
          // const filteredLevels = newLevels.filter((l, i, arr) => l.columnName || i === arr.length - 1);
          return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
      });
  };
  
  // Specific handler for adding a hierarchy level
  const addHierarchyLevel = () => {
       setConfig((prev: CustomImportConfig) => ({
          ...prev,
          hierarchy: {
              ...prev.hierarchy,
              levels: [...prev.hierarchy.levels, { columnName: '', levelVariables: [] }] // Use levelVariables
          }
      }));
  };
  
  // Specific handler for removing a hierarchy level
  const removeHierarchyLevel = (indexToRemove: number) => {
       setConfig((prev: CustomImportConfig) => ({
           ...prev,
           hierarchy: {
               ...prev.hierarchy,
               levels: prev.hierarchy.levels.filter((_: HierarchyLevelWithVars, index: number) => index !== indexToRemove)
           }
       }));
  };

  // Specific handler for simple hierarchy fields (like energyTypeColumn)
  // Use correct indexed access type
  const handleHierarchySimpleChange = <K extends keyof Omit<CustomImportConfig['hierarchy'], 'levels'>>(
      field: K,
      value: CustomImportConfig['hierarchy'][K] | null // Allow null for clearable selects
  ) => {
      const finalValue = field === 'energyTypeColumn' && value === null ? undefined : value;
      setConfig((prev: CustomImportConfig) => ({ 
          ...prev, 
          // Ensure correct update structure
          hierarchy: { ...prev.hierarchy, [field]: finalValue } 
      }));
  };

  // --- Level Variable Handlers --- 
  const addLevelVariable = (levelIndex: number) => {
    setConfig((prev: CustomImportConfig) => {
      const newLevels = [...prev.hierarchy.levels];
      const defaultPatternBlocks: PatternBlock[] = [ 
        { id: nanoid(3), type: 'placeholder', value: 'assetName' },
        { id: nanoid(3), type: 'text', value: '_' }, 
        { id: nanoid(3), type: 'text', value: 'Consommation' }
      ];
      
      const newVariable: LevelVariableConfig = {
        id: nanoid(5),
        baseName: 'Nouvelle Variable',
        displayNamePatternBlocks: defaultPatternBlocks,
        dataType: 'Float',
        unitSource: 'auto',
        unitRules: [] // Initialize empty rules array
      };
      
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        levelVariables: [...newLevels[levelIndex].levelVariables, newVariable]
      };
      
      return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
    });
  };

  const removeLevelVariable = (levelIndex: number, variableIdToRemove: string) => {
    setConfig((prev: CustomImportConfig) => {
        const newLevels = [...prev.hierarchy.levels];
        // Ensure modification targets levelVariables
        const currentVariables = newLevels[levelIndex].levelVariables;
        newLevels[levelIndex] = {
            ...newLevels[levelIndex],
            levelVariables: currentVariables.filter((variable: LevelVariableConfig) => variable.id !== variableIdToRemove)
        };
        return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
    });
  };

  // Update handler for level variable fields (including namePatternBlocks)
  const updateLevelVariable = (
      levelIndex: number, 
      variableId: string, 
      field: keyof LevelVariableConfig, 
      // Accept PatternBlock[] for displayNamePatternBlocks and UnitRule[] for unitRules
      value: string | null | 'auto' | 'column' | 'ruleBased' | 'none' | PatternBlock[] | UnitRule[]
  ) => {
      setConfig((prev: CustomImportConfig) => {
          const newLevels = 
            prev.hierarchy.levels.map((level: HierarchyLevelWithVars, lIndex: number) => {
              if (lIndex === levelIndex) {
                  const newLevelVariables = level.levelVariables.map((variable: LevelVariableConfig) => {
                      if (variable.id === variableId) {
                          // Handle specific field updates based on field type
                          if (field === 'displayNamePatternBlocks' && Array.isArray(value)) {
                              return { ...variable, displayNamePatternBlocks: value };
                          } else if (field === 'unitRules' && Array.isArray(value)) {
                              return { ...variable, unitRules: value };
                          } else {
                              // Handle other fields (strings, null, enum values)
                              return { ...variable, [field]: value };
                          }
                      }
                      return variable;
                  });
                  return { ...level, levelVariables: newLevelVariables }; 
              }
              return level; 
          });
          return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
      });
  };

  // Handler for GLOBAL variable config (in Adapter & Tags step)
  const handleGlobalVariableChange = <K extends keyof CustomImportConfig['variables']>( 
      field: K,
      value: CustomImportConfig['variables'][K] | string | null | boolean 
  ) => {
       const isOptionalColumn = ['unitColumn', 'nodeIdColumn'].includes(field as string);
       const finalValue = isOptionalColumn && value === null ? undefined : value;
      setConfig((prev: CustomImportConfig) => ({ 
          ...prev, 
          variables: { ...prev.variables, [field]: finalValue }
      }));
  };

  // --- Specific Handler for Retention --- 
  // Use correct indexed access type
  const handleRetentionChange = <K extends keyof CustomImportConfig['retention']>( 
      field: K,
      value: CustomImportConfig['retention'][K] | number 
  ) => {
      setConfig((prev: CustomImportConfig) => ({ 
          ...prev, 
          // Ensure correct update structure
          retention: { ...prev.retention, [field]: value } 
      }));
  };

   // --- Handler for top-level Adapter ID --- 
   const handleAdapterSelect = (value: string | null) => {
       setConfig((prev: CustomImportConfig) => ({ ...prev, selectedAdapterId: value }));
   };

  // --- Preview Logic --- 
  const generateHierarchyPreview = (): string => {
    // Check if processedData is an array and has data
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0 || !availableColumns.length) return "Données non disponibles ou format incorrect.";
    const sampleRow = processedData[0]; 
    // Add explicit type for 'l'
    const relevantColumns = config.hierarchy.levels.map((l: HierarchyLevelWithVars) => l.columnName).filter(Boolean);
    if (relevantColumns.length === 0) return "Aucun niveau défini";
    
    let preview = "";
    try {
        preview = relevantColumns
            // Add explicit type for 'colName'
            .map((colName: string) => sampleRow[colName] !== undefined ? String(sampleRow[colName]) : `[${colName}]`) // Use actual value or column name, ensure string conversion
            .join(" / ");
        if (config.hierarchy.energyTypeColumn && sampleRow[config.hierarchy.energyTypeColumn] !== undefined) {
            preview += ` (Type: ${String(sampleRow[config.hierarchy.energyTypeColumn])})`; // Ensure string conversion
        }
    } catch (e) {
        console.error("Error generating preview:", e);
        return "Erreur prévisualisation";
    }
    return preview || "Prévisualisation indisponible";
  };

  // --- Finish Handler --- 
  const handleFinish = () => {
    // Validation moved to canProceed where applicable
    console.log("Final Custom Config:", config);
    console.log("Tag Mappings détaillés:", config.tagMappings.map(m => ({
      levelIndex: m.levelIndex,
      variableId: m.variableId,
      selectedTag: m.selectedTag,
      // Vérifie que tu as toutes ces informations
      connectionName: m.connectionName,
      tagName: m.tagName
    })));
    onConfigComplete(config);
  };

  // Determine if next step is allowed 
  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0: // Hierarchy
        return config.selectedAdapterId && config.hierarchy.levels.length > 0 && 
               // Add explicit type for 'l'
               config.hierarchy.levels.every((l: HierarchyLevelWithVars) => l.columnName);
      case 1: // Variables per Level 
        return config.hierarchy.levels.every((level: HierarchyLevelWithVars) => 
            level.levelVariables.length === 0 || 
            level.levelVariables.every((v: LevelVariableConfig) => 
                v.baseName && 
                v.dataType && 
                v.displayNamePatternBlocks && v.displayNamePatternBlocks.length > 0 && 
                v.displayNamePatternBlocks.every((b: PatternBlock) => b.value) &&
                // Verify unit source configuration is valid
                (
                  (v.unitSource === 'auto') || 
                  (v.unitSource === 'none') ||
                  (v.unitSource === 'column' && !!v.unitColumn) ||
                  (v.unitSource === 'ruleBased' && Array.isArray(v.unitRules) && 
                    // Check that each rule is properly configured
                    v.unitRules.every(rule => 
                      rule.conditionValue && 
                      ((rule.unit && rule.unit.trim() !== '') || 
                       (rule.unitSource === 'column' && rule.unitColumn && rule.unitColumn.trim() !== ''))
                    ) &&
                    // Check that a default is configured if there are any rules
                    (v.unitRules.length === 0 || 
                     ((v.defaultUnit && v.defaultUnit.trim() !== '') || 
                      (v.defaultUnitColumn && v.defaultUnitColumn.trim() !== '')))
                  )
                )
            ) 
        );
      case 2: // Adapter & Tags (Mappage des variables aux tags)
        // Vérifier que chaque variable définie a un mapping de tag
        const definedVariables = config.hierarchy.levels.flatMap((level: HierarchyLevelWithVars, levelIndex: number) => 
          level.levelVariables.map((variable: LevelVariableConfig) => ({ levelIndex, variableId: variable.id }))
        );
        
        return config.selectedAdapterId && definedVariables.every(({ levelIndex, variableId }: { levelIndex: number, variableId: string }) => 
          config.tagMappings.some((mapping: { levelIndex: number, variableId: string }) => 
            mapping.levelIndex === levelIndex && mapping.variableId === variableId
          )
        );
      case 3: // Retention
        return !config.retention.enable || config.retention.years > 0;
      case 4: // Mappings
        return true; 
      case 5: // Aggregation
        return true;
      default:
        return false;
    }
  };

  // Ajouter cette fonction avec les autres handlers (après handleAdapterSelect)
  const handleTagMappingChange = (levelIndex: number, variableId: string, tagValue: string | null) => {
    setConfig((prev: CustomImportConfig) => {
      // Don't include mappings for the current level/variable combination
      const existingMappings = prev.tagMappings.filter(
        (m: { levelIndex: number; variableId: string }) => 
          !(m.levelIndex === levelIndex && m.variableId === variableId)
      );
      
      if (tagValue) {
        // Trouver les informations complètes du tag sélectionné
        const tags = adapterTags[prev.selectedAdapterId!] || [];
        const selectedTagInfo = tags.find((tag: { tagName: string }) => tag.tagName === tagValue);
        
        return {
          ...prev,
          tagMappings: [
            ...existingMappings,
            { 
              levelIndex, 
              variableId, 
              selectedTag: tagValue,
              // Ajouter ces informations supplémentaires
              connectionName: selectedTagInfo?.connectionName || '',
              tagPath: selectedTagInfo?.tagPath || '',
              // Tout autre info nécessaire depuis l'objet tag
              tagName: tagValue
            }
          ]
        };
      }
      
      return {
        ...prev,
        tagMappings: existingMappings
      };
    });
  };

  // --- Aggregation Handlers --- 
  const handleAggregationChange = (field: string, value: any) => {
    setConfig((prev: CustomImportConfig) => ({
      ...prev,
      aggregation: {
        ...prev.aggregation,
        [field]: value
      }
    }));
  };

  const handleCycleChange = (index: number, field: string, value: any) => {
    setConfig((prev: CustomImportConfig) => {
      const newCycles = [...(prev.aggregation?.cycles || [])];
      newCycles[index] = {
        ...(newCycles[index] || {}),
        [field]: value
      };
      return {
        ...prev,
        aggregation: {
          ...prev.aggregation,
          cycles: newCycles
        }
      };
    });
  };

  const addCycle = () => {
    setConfig((prev: CustomImportConfig) => ({
      ...prev,
      aggregation: {
        ...prev.aggregation,
        cycles: [...(prev.aggregation?.cycles || []), { interval: 'day', value: 1, retention: 7 }]
      }
    }));
  };

  const removeCycle = (index: number) => {
    setConfig((prev: CustomImportConfig) => ({
      ...prev,
      aggregation: {
        ...prev.aggregation,
        cycles: (prev.aggregation?.cycles || []).filter((_: any, i: number) => i !== index)
      }
    }));
  };

  if (!processedData) {
    return <Text color="dimmed">Données traitées non disponibles.</Text>;
  }

  return (
    <Paper 
      shadow="sm" 
      p="lg" 
      radius="md" 
      withBorder 
      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
    >
      <Title order={2} mb="lg">Configuration de l'Import Personnalisé</Title>
      
      <Stepper active={activeStep} onStepClick={setActiveStep}>
        {/* Step 1: Hierarchy */}
        <Stepper.Step label="Hiérarchie" description="Définir la structure" icon={<IconHierarchy size={18} />}>
           <Select
             label="Adaptateur IIH"
             description="Sélectionnez l'adaptateur à utiliser pour l'import."
             placeholder={loadingAdapters ? "Chargement..." : "Choisir adaptateur..."}
             data={adapters.map(a => ({ value: a.id, label: `${a.name} (${a.id})` }))}
             value={config.selectedAdapterId}
             onChange={handleAdapterSelect}
             searchable
             required
             disabled={loadingAdapters || !!adapterError || adapters.length === 0}
             mb="lg"
             classNames={{
               input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
               dropdown: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
               option: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600",
               label: "text-gray-700 dark:text-gray-300"
             }}
           />
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">Sélectionnez les colonnes Excel qui définiront les niveaux hiérarchiques, de haut en bas.</Text>
           {config.hierarchy.levels.map((level: HierarchyLevelWithVars, index: number) => {
             const levelSelectData = toSelectOptions(availableColumns
                   .filter(col => col !== config.hierarchy.energyTypeColumn && !config.hierarchy.levels.slice(0, index).map((l: HierarchyLevelWithVars) => l.columnName).includes(col) && !config.hierarchy.levels.slice(index + 1).map((l: HierarchyLevelWithVars) => l.columnName).includes(col)));
             return (
               <Group key={index} mb="sm" wrap="nowrap">
                 <Select
                   label={`Niveau ${index + 1}`}
                   placeholder="Choisir colonne..."
                   data={levelSelectData}
                   value={level.columnName || null}
                   onChange={(value) => handleHierarchyLevelChange(index, value)}
                   clearable
                   searchable
                   classNames={{
                     input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                     dropdown: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                     option: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600",
                     label: "text-gray-700 dark:text-gray-300"
                   }}
                   style={{ flexGrow: 1 }}
                 />
                 {config.hierarchy.levels.length > 1 && (
                     <ActionIcon 
                       color="red" 
                       onClick={() => removeHierarchyLevel(index)} 
                       title="Supprimer ce niveau" 
                       mt={25}
                     >
                         <IconTrash size={18} />
                     </ActionIcon>
                 )}
               </Group>
             );
           })}
           <Button 
             variant="outline" 
             size="xs" 
             onClick={addHierarchyLevel} 
             // Allow adding if the last level is filled
             disabled={config.hierarchy.levels.length > 0 && !config.hierarchy.levels[config.hierarchy.levels.length - 1].columnName}
             className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
           >
             Ajouter un niveau
           </Button>
           <Select
             label="Colonne Type d'Énergie (Optionnel)"
             placeholder="Choisir colonne..."
             data={toSelectOptions(availableColumns
               .filter(col => !config.hierarchy.levels.map((l: HierarchyLevelWithVars) => l.columnName).includes(col)))}
             value={config.hierarchy.energyTypeColumn || null}
             onChange={(value) => handleHierarchySimpleChange('energyTypeColumn', value)}
             clearable
             searchable
             mt="md"
             classNames={{
                 input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                 dropdown: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                 option: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600",
                 label: "text-gray-700 dark:text-gray-300"
             }}
           />
           <Text size="sm" mt="lg" mb="xs" className="font-medium text-gray-700 dark:text-gray-300">Aperçu de la Structure:</Text>
           <Code block className="whitespace-pre-wrap dark:bg-gray-700 dark:text-gray-200">
              {generateHierarchyPreview()} 
           </Code>
        </Stepper.Step>

        {/* Step 2: Variables par Niveau (Modified) */}
        <Stepper.Step label="Variables par Niveau" description="Configurer les données" icon={<IconVariable size={18} />}>
           <Title order={3} mb="sm">Configuration des Variables par Niveau</Title>
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">
              Pour chaque niveau hiérarchique, définissez les variables conceptuelles (ex: Consommation, Température) et leur modèle de nommage.
              Définissez également comment les unités seront déterminées, potentiellement selon le type d'énergie.
           </Text>
           
           <Accordion variant="separated" defaultValue={config.hierarchy.levels[0]?.columnName}> 
             {config.hierarchy.levels.map((level: HierarchyLevelWithVars, levelIndex: number) => (
               level.columnName && ( 
                 <Accordion.Item key={level.columnName} value={level.columnName}> 
                   <Accordion.Control>
                     Niveau {levelIndex + 1}: {level.columnName}
                   </Accordion.Control>
                   <Accordion.Panel>
                     {level.levelVariables.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" my="md">Aucune variable définie pour ce niveau.</Text>
                     )}
                     {level.levelVariables.map((variable: LevelVariableConfig) => (
                        <Paper key={variable.id} withBorder p="sm" mb="sm" radius="md" className="relative bg-gray-50 dark:bg-gray-700">
                            <ActionIcon 
                                color="red" 
                                variant="subtle" 
                                onClick={() => removeLevelVariable(levelIndex, variable.id)}
                                className="absolute top-1 right-1 z-10" 
                                title="Supprimer cette variable"
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                            
                            <SimpleGrid cols={1} spacing="xs">
                                {/* Base Name */}
                                <TextInput
                                    label="Nom de Base Variable"
                                    placeholder="Ex: Consommation"
                                    value={variable.baseName || ''}
                                    onChange={(e) => updateLevelVariable(levelIndex, variable.id, 'baseName', e.currentTarget.value)}
                                    required
                                    className="text-gray-900 dark:text-white"
                                />
                                
                                {/* Display Name Pattern Builder */}
                                <Stack gap={2}>
                                  <Text size="sm" fw={500}>Modèle de Nom d'Affichage</Text>
                                  <PatternBuilder
                                    value={variable.displayNamePatternBlocks || []}
                                    onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'displayNamePatternBlocks', value)}
                                    availablePlaceholders={PLACEHOLDER_MAP}
                                  />
                                </Stack>
                                
                                {/* Data Type Selection */}
                                <Select 
                                    label="Type de Données"
                                    data={toSelectOptions(['Float', 'Double', 'Int32', 'String', 'Boolean'])}
                                    value={variable.dataType || 'Float'}
                                    onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'dataType', value)}
                                    required
                                    classNames={{ input: "dark:text-white", label: "dark:text-gray-300"}}
                                />
                                
                                {/* Unit Source with Rules */}
                                <Select
                                    label="Source Unités"
                                    data={[
                                        { value: 'auto', label: 'Auto (Type énergie global)' },
                                        { value: 'column', label: 'Colonne Excel' },
                                        { value: 'ruleBased', label: 'Règles selon Type Énergie' },
                                        { value: 'none', label: 'Aucune (sans unité)' },
                                    ]}
                                    value={variable.unitSource || 'auto'}
                                    onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'unitSource', value as 'auto' | 'column' | 'ruleBased' | 'none')}
                                    classNames={{ input: "dark:text-white", label: "dark:text-gray-300"}}
                                />
                                
                                {/* Show relevant unit configuration based on unitSource */}
                                {variable.unitSource === 'column' && (
                                    <Select
                                        label="Colonne Unités"
                                        data={toSelectOptions(availableColumns)}
                                        value={variable.unitColumn || null}
                                        onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'unitColumn', value)}
                                        clearable
                                        searchable
                                        required
                                        classNames={{ input: "dark:text-white", label: "dark:text-gray-300"}}
                                    />
                                )}
                                
                                {/* Unit Rules Configuration */}
                                {variable.unitSource === 'ruleBased' && (
                                  <div className="space-y-2">
                                    <Text size="sm" fw={500}>Règles d'Unités par Type d'Énergie</Text>
                                    
                                    {/* Display existing rules */}
                                    {(variable.unitRules || []).map((rule: UnitRule, ruleIndex: number) => (
                                      <Paper key={ruleIndex} p="xs" withBorder className="relative">
                                        <ActionIcon 
                                          color="red" 
                                          variant="subtle" 
                                          onClick={() => {
                                            const newRules = [...(variable.unitRules || [])];
                                            newRules.splice(ruleIndex, 1);
                                            updateLevelVariable(levelIndex, variable.id, 'unitRules', newRules);
                                          }}
                                          className="absolute top-1 right-1" 
                                          title="Supprimer cette règle"
                                          size="xs"
                                        >
                                          <IconX size={14} />
                                        </ActionIcon>
                                        
                                        <Group justify="space-between" mb="xs" align="flex-end">
                                          <Select
                                            label="Si Type Énergie"
                                            size="xs"
                                            data={[
                                              { value: 'elec', label: 'Électricité' },
                                              { value: 'gaz', label: 'Gaz' },
                                              { value: 'eau', label: 'Eau' },
                                              { value: 'air', label: 'Air' },
                                            ]}
                                            value={rule.conditionValue}
                                            onChange={(value) => {
                                              const newRules = [...(variable.unitRules || [])];
                                              newRules[ruleIndex] = { ...newRules[ruleIndex], conditionValue: value || 'elec' };
                                              updateLevelVariable(levelIndex, variable.id, 'unitRules', newRules);
                                            }}
                                            style={{ width: '120px' }}
                                          />
                                          
                                          <Text size="xs" fw={500} mx="xs">Alors</Text>
                                          
                                          <Select
                                            label="Type Source"
                                            size="xs"
                                            data={[
                                              { value: 'fixed', label: 'Unité Fixe' },
                                              { value: 'column', label: 'Colonne Excel' },
                                            ]}
                                            value={rule.unitSource === 'column' ? 'column' : 'fixed'}
                                            onChange={(value) => {
                                              const newRules = [...(variable.unitRules || [])];
                                              if (value === 'column') {
                                                // Switch to column-based
                                                const { unit, ...rest } = newRules[ruleIndex];
                                                newRules[ruleIndex] = { ...rest, unitSource: 'column', unitColumn: '' };
                                              } else {
                                                // Switch to fixed unit
                                                const { unitSource, unitColumn, ...rest } = newRules[ruleIndex];
                                                newRules[ruleIndex] = { ...rest, unit: '' };
                                              }
                                              updateLevelVariable(levelIndex, variable.id, 'unitRules', newRules);
                                            }}
                                            style={{ width: '120px' }}
                                          />
                                          
                                          {rule.unitSource === 'column' ? (
                                            <Select
                                              label="Colonne Unité"
                                              size="xs"
                                              data={toSelectOptions(availableColumns)}
                                              value={rule.unitColumn || null}
                                              onChange={(value) => {
                                                const newRules = [...(variable.unitRules || [])];
                                                newRules[ruleIndex] = { ...newRules[ruleIndex], unitColumn: value || '' };
                                                updateLevelVariable(levelIndex, variable.id, 'unitRules', newRules);
                                              }}
                                              searchable
                                              clearable
                                              style={{ width: '150px' }}
                                            />
                                          ) : (
                                            <TextInput
                                              label="Unité"
                                              size="xs"
                                              placeholder="Ex: kWh"
                                              value={rule.unit || ''}
                                              onChange={(e) => {
                                                const newRules = [...(variable.unitRules || [])];
                                                newRules[ruleIndex] = { ...newRules[ruleIndex], unit: e.currentTarget.value };
                                                updateLevelVariable(levelIndex, variable.id, 'unitRules', newRules);
                                              }}
                                              style={{ width: '120px' }}
                                            />
                                          )}
                                        </Group>
                                      </Paper>
                                    ))}
                                    
                                    {/* Add Rule Button */}
                                    <Button 
                                      variant="light" 
                                      size="xs" 
                                      onClick={() => {
                                        const newRule: UnitRule = {
                                          conditionField: 'energyType',
                                          conditionValue: 'elec',
                                          unit: 'kWh'
                                        };
                                        const newRules = [...(variable.unitRules || []), newRule];
                                        updateLevelVariable(levelIndex, variable.id, 'unitRules', newRules);
                                      }}
                                      leftSection={<IconPlus size={14} />}
                                    >
                                      Ajouter une Règle
                                    </Button>
                                    
                                    {/* Default Unit */}
                                    <Text size="xs" fw={500} mt="md">Unité par Défaut (si aucune règle ne correspond)</Text>
                                    <Group justify="space-between" mb="xs">
                                      <Select
                                        label="Type Source"
                                        size="xs"
                                        data={[
                                          { value: 'fixed', label: 'Unité Fixe' },
                                          { value: 'column', label: 'Colonne Excel' },
                                        ]}
                                        value={variable.defaultUnitColumn ? 'column' : 'fixed'}
                                        onChange={(value) => {
                                          if (value === 'column') {
                                            // Switch to column-based default
                                            updateLevelVariable(levelIndex, variable.id, 'defaultUnit', null);
                                            updateLevelVariable(levelIndex, variable.id, 'defaultUnitColumn', '');
                                          } else {
                                            // Switch to fixed default unit
                                            updateLevelVariable(levelIndex, variable.id, 'defaultUnitColumn', null);
                                            updateLevelVariable(levelIndex, variable.id, 'defaultUnit', '');
                                          }
                                        }}
                                        style={{ width: '120px' }}
                                      />
                                      
                                      {variable.defaultUnitColumn !== undefined ? (
                                        <Select
                                          label="Colonne Unité"
                                          size="xs"
                                          data={toSelectOptions(availableColumns)}
                                          value={variable.defaultUnitColumn || null}
                                          onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'defaultUnitColumn', value)}
                                          searchable
                                          clearable
                                          style={{ width: '150px' }}
                                        />
                                      ) : (
                                        <TextInput
                                          label="Unité"
                                          size="xs"
                                          placeholder="Ex: kWh"
                                          value={variable.defaultUnit || ''}
                                          onChange={(e) => updateLevelVariable(levelIndex, variable.id, 'defaultUnit', e.currentTarget.value)}
                                          style={{ width: '120px' }}
                                        />
                                      )}
                                    </Group>
                                  </div>
                                )}
                            </SimpleGrid>
                        </Paper>
                     ))}
                     <Button 
                        variant="light" 
                        size="xs" 
                        onClick={() => addLevelVariable(levelIndex)} 
                        leftSection={<IconPlus size={14} />}
                        fullWidth
                        mt="md"
                      >
                       Ajouter une Variable
                     </Button>
                   </Accordion.Panel>
                 </Accordion.Item>
               )
             ))}
           </Accordion>
        </Stepper.Step>

        {/* Step 3: Adapter & Tags (Refonte pour mappeur de tags) */}
        <Stepper.Step label="Adaptateur & Tags" description="Mappage des Variables" icon={<IconTags size={18} />}>
           <Title order={3} mb="sm">Sélection de l'Adaptateur IIH</Title>
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">
             Choisissez l'adaptateur IIH qui sera utilisé pour les tags et mappez chaque variable à un tag spécifique.
           </Text>
           
           <LoadingOverlay visible={loadingAdapters} overlayProps={{ radius: "sm", blur: 2 }} />
           {adapterError && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Erreur Adaptateurs" color="red" withCloseButton onClose={() => setAdapterError(null)} mb="md">
                {adapterError}
              </Alert>
           )}
           
           <Select
              label="Adaptateur IIH"
              description="Sélectionnez l'adaptateur à utiliser pour créer les tags."
              placeholder={loadingAdapters ? "Chargement..." : "Choisir adaptateur..."}
              data={adapters.map(a => ({ value: a.id, label: `${a.name} (${a.id})` }))}
              value={config.selectedAdapterId}
              onChange={handleAdapterSelect}
              searchable
              required
              disabled={loadingAdapters || !!adapterError || adapters.length === 0}
              mb="lg"
              classNames={{
                input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                dropdown: "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                option: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600",
                label: "text-gray-700 dark:text-gray-300"
              }}
           />
           
           <Divider my="lg" />
           
           <Title order={3} mb="sm">Mappage des Variables aux Tags IIH</Title>
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">
             Pour chaque variable définie par niveau, sélectionnez le tag IIH correspondant.
           </Text>
           
           <LoadingOverlay visible={tagsLoading} overlayProps={{ radius: "sm", blur: 2 }} />
           {tagsError && (
              <Alert icon={<IconAlertCircle size="1rem" />} title="Erreur Tags" color="red" withCloseButton onClose={() => setTagsError(null)} mb="md">
                {tagsError}
              </Alert>
           )}
           
           {adapterTags[config.selectedAdapterId!]?.length === 0 && !tagsLoading && (
             <Alert title="Aucun tag disponible" color="yellow" mb="md">
               L'adaptateur sélectionné ne fournit aucun tag. Veuillez sélectionner un autre adaptateur.
             </Alert>
           )}
           
           {config.hierarchy.levels.filter((l: HierarchyLevelWithVars) => l.levelVariables.length > 0).length === 0 ? (
             <Alert title="Aucune variable définie" color="blue" mb="md">
               Aucune variable n'a été définie à l'étape précédente. Revenez à l'étape "Variables par Niveau" pour en définir.
             </Alert>
           ) : (
             <Accordion variant="separated">
               {config.hierarchy.levels.map((level: HierarchyLevelWithVars, levelIndex: number) => (
                 level.columnName && level.levelVariables.length > 0 && (
                   <Accordion.Item key={`level-${levelIndex}`} value={`level-${levelIndex}`}>
                     <Accordion.Control>
                       Niveau {levelIndex + 1}: {level.columnName} ({level.levelVariables.length} variable{level.levelVariables.length > 1 ? 's' : ''})
                     </Accordion.Control>
                     <Accordion.Panel>
                       <SimpleGrid cols={1} spacing="sm">
                         {level.levelVariables.map((variable: LevelVariableConfig) => {
                           // Générer un aperçu du nom d'affichage en utilisant displayNamePatternBlocks
                           const displayNamePreview = generateExampleName(
                             variable.displayNamePatternBlocks?.map((block: PatternBlock) => {
                               if (block.type === 'text') return block.value;
                               if (block.type === 'placeholder') {
                                 switch (block.value) {
                                   case 'assetName': return '[NomAsset]';
                                   case 'energyType': return '[TypeEnergie]';
                                   case 'levelName': return level.columnName;
                                   default: return `{${block.value}}`;
                                 }
                               }
                               return '';
                             }).join('') || variable.baseName,
                             level.columnName,
                             'elec'
                           );
                           
                           // Trouver s'il existe déjà un mapping pour cette variable
                           const existingMapping = config.tagMappings.find(
                             (m: { levelIndex: number, variableId: string, selectedTag: string }) => 
                               m.levelIndex === levelIndex && m.variableId === variable.id
                           );
                           
                           // Calcul une seule fois pour tous les niveaux
                           const tags = Array.isArray(adapterTags[config.selectedAdapterId!]) ? adapterTags[config.selectedAdapterId!] : [];
                           const uniqueTags = Object.values(tags.reduce((acc: Record<string, any>, tag: any) => {
                             if (!acc[tag.tagName]) acc[tag.tagName] = tag;
                             return acc;
                           }, {} as Record<string, any>));

                           return (
                             <Paper key={variable.id} withBorder p="sm" radius="md" className="bg-gray-50 dark:bg-gray-700">
                               <Group justify="space-between" mb="xs">
                                 <div>
                                   <Text fw={500} size="sm" mb={0}>
                                     {variable.baseName}
                                   </Text>
                                   <Text size="xs" color="dimmed">
                                     {displayNamePreview} ({variable.dataType})
                                   </Text>
                                 </div>
                                 
                                 <Select
                                   placeholder="Sélectionner un tag"
                                   data={uniqueTags.map((tag: any) => ({
                                     value: tag.tagName,
                                     label: tag.tagName
                                   }))}
                                   value={existingMapping?.selectedTag || null}
                                   onChange={(value) => handleTagMappingChange(levelIndex, variable.id, value)}
                                   searchable
                                   clearable
                                   disabled={tagsLoading || !config.selectedAdapterId}
                                   style={{ minWidth: 200 }}
                                   classNames={{ input: "dark:text-white" }}
                                 />
                               </Group>
                               
                               {/* Afficher les détails de configuration d'unité */}
                               <Text size="xs" color="dimmed">
                                 Unité: {variable.unitSource === 'auto' ? 'Auto (Type énergie)' :
                                        variable.unitSource === 'none' ? 'Aucune' :
                                        variable.unitSource === 'column' ? `Colonne: ${variable.unitColumn}` :
                                        'Selon règles'}
                               </Text>
                             </Paper>
                           );
                         })}
                       </SimpleGrid>
                     </Accordion.Panel>
                   </Accordion.Item>
                 )
               ))}
             </Accordion>
           )}
           
           <Divider my="lg" />
           
           <Alert icon={<IconAlertCircle size="1rem" />} color="blue" mb="md">
             <Text size="sm" mb={2} fw={500}>Rappel important</Text>
             <Text size="xs">
               Chaque variable doit être mappée à un tag IIH pour que les données puissent être importées correctement.
               Les tags non mappés ne seront pas créés dans IIH.
             </Text>
           </Alert>
        </Stepper.Step>
        
        {/* Step 4: Retention */}
        <Stepper.Step label="Rétention" description="Conservation des données" icon={<IconClock size={18} />}>
          <Title order={3} mb="sm" className="dark:text-gray-200">Rétention des Données</Title>
          <Checkbox
            label="Activer la rétention de données"
            checked={config.retention.enable}
            onChange={(event) => handleRetentionChange('enable', event.currentTarget.checked)}
            classNames={{
              label: "dark:text-gray-300",
              input: "dark:bg-gray-700 dark:border-gray-600"
            }}
          />
          {config.retention.enable && (
             <NumberInput
               label="Nombre d'années de rétention"
               description="0 pour indéfini (si supporté)."
               value={config.retention.years}
               onChange={(value) => handleRetentionChange('years', Number(value) || 0)}
               min={0} 
               step={1}
               required
               mt="sm"
               classNames={{
                 input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                 label: "text-gray-700 dark:text-gray-300",
                 description: "text-xs text-gray-500 dark:text-gray-400"
               }}
             />
          )}
        </Stepper.Step>

        {/* Step 5: Aggregation */}
        <Stepper.Step label="Agrégation" description="Cycles et méthodes" icon={<IconStack2 size={18} />}>
          <Title order={3} mb="sm" className="dark:text-gray-200">Configuration de l'Agrégation</Title>
          
          <Paper withBorder p="md" mb="md">
            <Text size="sm" mb="md">
              Configurez comment les données seront agrégées dans IIH. Ces paramètres s'appliquent à toutes les variables numériques.
            </Text>
            
            <SimpleGrid cols={1} spacing="md">
              {/* Méthode d'agrégation par défaut */}
              <Select
                label="Méthode d'agrégation par défaut"
                description="Méthode utilisée pour agréger les données dans le temps."
                data={[
                  { value: 'average', label: 'Moyenne' },
                  { value: 'sum', label: 'Somme' },
                  { value: 'min', label: 'Minimum' },
                  { value: 'max', label: 'Maximum' },
                  { value: 'count', label: 'Comptage' },
                  { value: 'last', label: 'Dernière valeur' }
                ]}
                value={config.aggregation?.defaultMethod || 'average'}
                onChange={(value) => handleAggregationChange('defaultMethod', value)}
                required
              />
              
              {/* Cycles d'agrégation */}
              <Title order={4} mt="md">Cycles d'agrégation</Title>
              <Text size="xs" color="dimmed">
                Configurez les intervalles pour lesquels les données seront agrégées et conservées.
              </Text>
              
              {(config.aggregation?.cycles || []).map((cycle: any, index: number) => (
                <Paper key={index} withBorder p="sm" pos="relative">
                  <Group justify="space-between">
                    <Select
                      label="Intervalle"
                      size="xs"
                      data={[
                        { value: 'second', label: 'Seconde' },
                        { value: 'minute', label: 'Minute' },
                        { value: 'hour', label: 'Heure' },
                        { value: 'day', label: 'Jour' },
                        { value: 'week', label: 'Semaine' },
                        { value: 'month', label: 'Mois' },
                        { value: 'year', label: 'Année' }
                      ]}
                      value={cycle.interval}
                      onChange={(value) => handleCycleChange(index, 'interval', value)}
                      style={{ width: 120 }}
                    />
                    
                    <NumberInput
                      label="Valeur"
                      size="xs"
                      value={cycle.value || 1}
                      onChange={(value) => handleCycleChange(index, 'value', Number(value))}
                      min={1}
                      style={{ width: 80 }}
                    />
                    
                    <NumberInput
                      label="Durée de conservation"
                      size="xs"
                      value={cycle.retention}
                      onChange={(value) => handleCycleChange(index, 'retention', Number(value))}
                      min={1}
                      style={{ width: 150 }}
                    />
                    
                    <ActionIcon 
                      color="red" 
                      variant="subtle" 
                      onClick={() => removeCycle(index)} 
                      style={{ position: 'absolute', top: 5, right: 5 }}
                      title="Supprimer ce cycle"
                      size="xs"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
              
              <Button 
                variant="light" 
                leftSection={<IconPlus size={14} />}
                onClick={addCycle}
                size="xs"
              >
                Ajouter un cycle
              </Button>
            </SimpleGrid>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Completed>
          <Title order={3} ta="center">Récapitulatif</Title>
          <Text ta="center" mb="md">Vérifiez la configuration avant de lancer l'import.</Text>
          <Code block className="dark:bg-gray-700 dark:text-gray-200">
            {JSON.stringify(config, null, 2)}
          </Code>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button 
           variant="default" 
           onClick={activeStep === 0 ? onCancel : prevStep}
           className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white border-gray-300 dark:border-gray-500"
         >
           {activeStep === 0 ? 'Annuler' : 'Précédent'}
        </Button>
       
        {activeStep < MAX_STEP_INDEX ? ( // Use MAX_STEP_INDEX
           <Button 
              onClick={nextStep} 
              disabled={!canProceed(activeStep)} 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
             Suivant
           </Button>
        ) : ( 
           <Button onClick={handleFinish} color="green" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white">
             Lancer l'Import
           </Button>
        )}
      </Group>
    </Paper>
  );
} 