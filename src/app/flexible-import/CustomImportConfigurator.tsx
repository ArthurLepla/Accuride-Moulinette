'use client';

import React, { useState, useEffect } from 'react';
import { Button, Stepper, Group, Title, Text, Paper, SimpleGrid, Select, TextInput, Checkbox, NumberInput, Code, LoadingOverlay, Alert, ActionIcon, Divider, Accordion, Tooltip, Menu, Popover, Stack } from '@mantine/core';
import { CustomImportConfig, DEFAULT_CUSTOM_IMPORT_CONFIG, LevelVariableConfig, PatternBlock, PlaceholderKey, PatternBlockType, InitialHierarchyConfig } from '@/modules/custom-importer/types'; 
import { IconHierarchy, IconVariable, IconPlugConnected, IconTags, IconClock, IconExchange, IconAlertCircle, IconTrash, IconPlus, IconSettings, IconX, IconGripVertical, IconPlaceholder } from '@tabler/icons-react'; 
import { IIHApi } from '@/modules/simple-importer/api'; 
import { AuthConfig } from '@/modules/simple-importer/types'; 
import { useProfile } from '@/contexts/ProfileContext'; 
import { nanoid } from 'nanoid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdapterInfo {
    adapterId: string;
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
const initialConfigBase: Omit<CustomImportConfig, 'hierarchy'> = {
  selectedAdapterId: DEFAULT_CUSTOM_IMPORT_CONFIG.selectedAdapterId,
  variables: DEFAULT_CUSTOM_IMPORT_CONFIG.variables,
  retention: DEFAULT_CUSTOM_IMPORT_CONFIG.retention,
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
  const [config, setConfig] = useState<CustomImportConfig>(() => ({
    ...initialConfigBase, // Start with the non-hierarchy defaults
    hierarchy: { 
      levels: initialHierarchyConfig.levels.map(level => ({ 
          columnName: level.columnName,
          // Initialize levelVariables as empty array, don't read from initialHierarchyConfig.levels
          levelVariables: [] 
      })), 
      energyTypeColumn: initialHierarchyConfig.energyTypeColumn || DEFAULT_CUSTOM_IMPORT_CONFIG.hierarchy.energyTypeColumn
    }
  }));
  
  const [adapters, setAdapters] = useState<AdapterInfo[]>([]);
  const [loadingAdapters, setLoadingAdapters] = useState<boolean>(false);
  const [adapterError, setAdapterError] = useState<string | null>(null);
  const { profile } = useProfile(); 

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
        // Use the parsed authConfig directly
        const api = new IIHApi(authConfig); 
        const fetchedAdapters = await api.getAdapters(); 
        setAdapters(fetchedAdapters || []);
      } catch (error: any) {
        console.error("Erreur chargement adapters:", error);
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
  const MAX_STEP_INDEX = 4; // 5 steps: Hierarchy(0), VarsByLevel(1), AdapterTags(2), Retention(3), Mappings(4)
  const nextStep = () => setActiveStep((current) => (current < MAX_STEP_INDEX ? current + 1 : current)); 
  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  // Specific handler for hierarchy level column change
  const handleHierarchyLevelChange = (index: number, value: string | null) => {
      setConfig((prev) => {
          const newLevels = prev.hierarchy.levels.map((level, i) => 
              i === index ? { ...level, columnName: value || '' } : level
          );
          // Ensure we don't have trailing empty levels except maybe the last one during editing
          // const filteredLevels = newLevels.filter((l, i, arr) => l.columnName || i === arr.length - 1);
          return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
      });
  };
  
  // Specific handler for adding a hierarchy level
  const addHierarchyLevel = () => {
       setConfig((prev) => ({
          ...prev,
          hierarchy: {
              ...prev.hierarchy,
              levels: [...prev.hierarchy.levels, { columnName: '', levelVariables: [] }] // Use levelVariables
          }
      }));
  };
  
  // Specific handler for removing a hierarchy level
  const removeHierarchyLevel = (indexToRemove: number) => {
       setConfig((prev) => ({
           ...prev,
           hierarchy: {
               ...prev.hierarchy,
               levels: prev.hierarchy.levels.filter((_, index) => index !== indexToRemove)
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
      setConfig((prev) => ({ 
          ...prev, 
          // Ensure correct update structure
          hierarchy: { ...prev.hierarchy, [field]: finalValue } 
      }));
  };

  // --- Level Variable Handlers --- 
  const addLevelVariable = (levelIndex: number) => {
    setConfig((prev) => {
        const newLevels = [...prev.hierarchy.levels];
        const newVariable: LevelVariableConfig = {
            id: nanoid(5), 
            displayName: 'Nouvelle Variable', 
            namePatternBlocks: [ 
                { id: nanoid(3), type: 'placeholder', value: 'assetName' } 
            ], 
            unitSource: 'auto',
            dataType: 'Float' 
        };
        newLevels[levelIndex] = {
            ...newLevels[levelIndex],
            levelVariables: [...newLevels[levelIndex].levelVariables, newVariable]
        };
        return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
    });
  };

  const removeLevelVariable = (levelIndex: number, variableIdToRemove: string) => {
    setConfig((prev) => {
        const newLevels = [...prev.hierarchy.levels];
        // Ensure modification targets levelVariables
        const currentVariables = newLevels[levelIndex].levelVariables;
        newLevels[levelIndex] = {
            ...newLevels[levelIndex],
            levelVariables: currentVariables.filter(variable => variable.id !== variableIdToRemove)
        };
        return { ...prev, hierarchy: { ...prev.hierarchy, levels: newLevels } };
    });
  };

  // Update handler for level variable fields (including namePatternBlocks)
  const updateLevelVariable = (
      levelIndex: number, 
      variableId: string, 
      field: keyof LevelVariableConfig, 
      // Accept PatternBlock[] for namePatternBlocks
      value: string | null | 'auto' | 'column' | PatternBlock[] 
  ) => {
      setConfig((prev) => {
          const newLevels = 
            prev.hierarchy.levels.map((level, lIndex) => {
              if (lIndex === levelIndex) {
                  const newLevelVariables = level.levelVariables.map(variable => {
                      if (variable.id === variableId) {
                          // Handle specific field updates
                          if (field === 'namePatternBlocks' && Array.isArray(value)) {
                             return { ...variable, namePatternBlocks: value };
                          } else if (field !== 'namePatternBlocks') { // Handle other fields
                              const isOptionalColumn = field === 'unitColumn';
                              const finalValue = isOptionalColumn && value === null ? undefined : value;
                              return { ...variable, [field]: finalValue };
                          }
                      }
                      return variable;
                  });
                  return { ...level, levelVariables: newLevelVariables }; 
              }
              return { ...level, levelVariables: level.levelVariables }; 
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
      setConfig((prev) => ({ 
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
      setConfig((prev) => ({ 
          ...prev, 
          // Ensure correct update structure
          retention: { ...prev.retention, [field]: value } 
      }));
  };

   // --- Handler for top-level Adapter ID --- 
   const handleAdapterSelect = (value: string | null) => {
       setConfig((prev) => ({ ...prev, selectedAdapterId: value }));
   };

  // --- Preview Logic --- 
  const generateHierarchyPreview = (): string => {
    // Check if processedData is an array and has data
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0 || !availableColumns.length) return "Données non disponibles ou format incorrect.";
    const sampleRow = processedData[0]; 
    const relevantColumns = config.hierarchy.levels.map(l => l.columnName).filter(Boolean);
    if (relevantColumns.length === 0) return "Aucun niveau défini";
    
    let preview = "";
    try {
        preview = relevantColumns
            .map(colName => sampleRow[colName] !== undefined ? String(sampleRow[colName]) : `[${colName}]`) // Use actual value or column name, ensure string conversion
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
    onConfigComplete(config);
  };

  // Determine if next step is allowed 
  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0: // Hierarchy
        return config.hierarchy.levels.length > 0 && 
               config.hierarchy.levels.every(l => l.columnName);
      case 1: // Variables per Level 
        return config.hierarchy.levels.every(level => 
            level.levelVariables.length === 0 || 
            level.levelVariables.every(v => 
                v.displayName && 
                v.dataType && 
                v.namePatternBlocks && v.namePatternBlocks.length > 0 && 
                v.namePatternBlocks.every(b => b.value) 
            ) 
        );
      case 2: // Adapter & Tags (Global config)
        return !!config.selectedAdapterId && 
               !!config.variables.namePattern &&
               (config.variables.unitSource !== 'column' || !!config.variables.unitColumn) &&
               (config.variables.nodeIdSource !== 'column' || !!config.variables.nodeIdColumn);
      case 3: // Retention
        return !config.retention.enable || config.retention.years > 0;
      case 4: // Mappings
        return true; 
      default:
        return false;
    }
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
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">Sélectionnez les colonnes Excel qui définiront les niveaux hiérarchiques, de haut en bas.</Text>
           {config.hierarchy.levels.map((level: { columnName: string }, index: number) => (
             <Group key={index} mb="sm" wrap="nowrap">
               <Select
                 label={`Niveau ${index + 1}`}
                 placeholder="Choisir colonne..."
                 data={availableColumns.filter(col => col !== config.hierarchy.energyTypeColumn && !config.hierarchy.levels.slice(0, index).map(l => l.columnName).includes(col) && !config.hierarchy.levels.slice(index + 1).map(l => l.columnName).includes(col))}
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
           ))}
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
           {/* Use handleHierarchySimpleChange */}
           <Select
             label="Colonne Type d'Énergie (Optionnel)"
             placeholder="Choisir colonne..."
             data={availableColumns.filter(col => !config.hierarchy.levels.map(l => l.columnName).includes(col))}
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

        {/* Step 2: Variables per Level (Modified) */}
        <Stepper.Step label="Variables par Niveau" description="Configurer les données" icon={<IconVariable size={18} />}>
           <Title order={3} mb="sm">Configuration des Variables par Niveau</Title>
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">
              Pour chaque niveau hiérarchique, ajoutez les variables/tags que vous souhaitez créer (ex: Consommation, Température). 
              Définissez leur nom d'affichage, le modèle pour le nom du tag IIH final (utilisez {'{assetName}'}, {'{energyType}'}), et le type de données.
              <br/>
              <em className="text-xs">Note : La création effective des tags se fera via la configuration globale (étape suivante) pour l'instant.</em>
           </Text>
           
           <Accordion variant="separated" defaultValue={config.hierarchy.levels[0]?.columnName}> 
             {config.hierarchy.levels.map((level, levelIndex) => (
               level.columnName && ( 
                 <Accordion.Item key={level.columnName} value={level.columnName}> 
                   <Accordion.Control>
                     Niveau {levelIndex + 1}: {level.columnName}
                   </Accordion.Control>
                   <Accordion.Panel>
                     {level.levelVariables.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" my="md">Aucune variable définie pour ce niveau.</Text>
                     )}
                     {/* Ensure map uses levelVariables */} 
                     {level.levelVariables.map((variable) => (
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
                                <TextInput
                                    label="Nom Affichage Variable"
                                    placeholder="Ex: Consommation Energie"
                                    value={variable.displayName}
                                    onChange={(e) => updateLevelVariable(levelIndex, variable.id, 'displayName', e.currentTarget.value)}
                                    required
                                    className="text-gray-900 dark:text-white"
                                />
                                
                                {/* Replace Group with Stack */} 
                                <Stack gap={2}>
                                  <Text size="sm" fw={500}>Modèle Nommage Tag</Text>
                                  <PatternBuilder 
                                    value={variable.namePatternBlocks}
                                    onChange={(newBlocks) => updateLevelVariable(levelIndex, variable.id, 'namePatternBlocks', newBlocks)}
                                    availablePlaceholders={PLACEHOLDER_MAP}
                                  />
                                </Stack>
                                
                                <Select 
                                    label="Type de Données"
                                    data={['Float', 'Double', 'Int32', 'String', 'Boolean']}
                                    value={variable.dataType || 'Float'}
                                    onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'dataType', value)}
                                    required
                                    classNames={{ input: "dark:text-white", label: "dark:text-gray-300"}}
                                />
                                <Select
                                    label="Source Unités"
                                    data={[
                                        { value: 'auto', label: 'Auto (Type énergie global)' },
                                        { value: 'column', label: 'Colonne Excel' },
                                    ]}
                                    value={variable.unitSource || 'auto'}
                                    onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'unitSource', value as 'auto' | 'column')}
                                    classNames={{ input: "dark:text-white", label: "dark:text-gray-300"}}
                                />
                                {variable.unitSource === 'column' && (
                                    <Select
                                        label="Colonne Unités"
                                        data={availableColumns} 
                                        value={variable.unitColumn || null}
                                        onChange={(value) => updateLevelVariable(levelIndex, variable.id, 'unitColumn', value)}
                                        clearable
                                        searchable
                                        required
                                        classNames={{ input: "dark:text-white", label: "dark:text-gray-300"}}
                                    />
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

        {/* Step 3: Adapter & Tags (Global Config) */}
        <Stepper.Step label="Adaptateur & Tags" description="Connexion & Global" icon={<IconTags size={18} />}>
           <Title order={3} mb="sm">Sélection Adaptateur IIH</Title>
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">Choisissez l'adaptateur IIH qui sera utilisé pour lier les tags créés.</Text>
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
              data={adapters.map(a => ({ value: a.adapterId, label: `${a.name} (${a.adapterId})` }))}
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
           
           {/* --- Global Variable Config UI --- */} 
           <Title order={3} mb="sm">Configuration Globale des Tags</Title>
           <Text size="sm" mb="md" className="text-gray-700 dark:text-gray-300">
              Cette configuration sera utilisée pour créer les tags pour les éléments <strong className="font-semibold">feuilles</strong> de la hiérarchie.
           </Text>
           <SimpleGrid cols={1} spacing="md">
              {/* Use handleGlobalVariableChange */}
              <TextInput
                 label="Modèle Nommage (Global)"
                 value={config.variables.namePattern}
                 onChange={(event) => handleGlobalVariableChange('namePattern', event.currentTarget.value)}
                 classNames={{
                   input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                   label: "text-gray-700 dark:text-gray-300"
                 }}
              />
              {/* Use handleGlobalVariableChange */} 
              <Select
                 label="Source Unités (Global)"
                 value={config.variables.unitSource}
                 onChange={(value) => handleGlobalVariableChange('unitSource', value as 'auto' | 'column')}
                 classNames={{
                   input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                   label: "text-gray-700 dark:text-gray-300"
                 }}
              />
              {config.variables.unitSource === 'column' && (
                <Select
                  label="Colonne Unités (Global)"
                  value={config.variables.unitColumn || null}
                  onChange={(value) => handleGlobalVariableChange('unitColumn', value)}
                  classNames={{
                    input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                    label: "text-gray-700 dark:text-gray-300"
                  }}
                />
              )}
              {/* Use handleGlobalVariableChange */} 
              <Select
                label="Source Node ID (Global)"
                value={config.variables.nodeIdSource}
                onChange={(value) => handleGlobalVariableChange('nodeIdSource', value as 'auto' | 'column')}
                classNames={{
                  input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                  label: "text-gray-700 dark:text-gray-300"
                }}
              />
              {config.variables.nodeIdSource === 'column' && (
                <Select
                  label="Colonne Node ID (Global)"
                  value={config.variables.nodeIdColumn || null}
                  onChange={(value) => handleGlobalVariableChange('nodeIdColumn', value)}
                  classNames={{
                    input: "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
                    label: "text-gray-700 dark:text-gray-300"
                  }}
                />
              )}
              {/* Use handleGlobalVariableChange */} 
              <Checkbox
                 label="Créer agrégations (Global)"
                 checked={config.variables.createAggregations}
                 onChange={(event) => handleGlobalVariableChange('createAggregations', event.currentTarget.checked)}
                 classNames={{
                   label: "dark:text-gray-300",
                   input: "dark:bg-gray-700 dark:border-gray-600"
                 }}
              />
           </SimpleGrid>
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

        {/* Step 5: Mappings */}
        <Stepper.Step label="Mappings" description="Renommer et lier" icon={<IconExchange size={18} />}>
            <Text size="sm" color="dimmed">Configuration du renommage des tags et des connecteurs (sera ajoutée ultérieurement).</Text>
             {/* TODO: Implement Mappings UI using a new handleMappingChange */} 
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