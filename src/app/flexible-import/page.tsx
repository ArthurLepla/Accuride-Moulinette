'use client';

import { useState, ChangeEvent } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { processFlexibleHierarchy, validateFlexibleHierarchyData } from '@/lib/flexible-hierarchy-processor';
import FlexibleSankeyChart from '@/components/charts/FlexibleSankeyChart';
import { FlexibleProcessedData } from '@/types/sankey';
import FlexibleImportSummary from '@/components/FlexibleImportSummary';
import { useRouter } from 'next/navigation';
import { ImportValidationModal } from '@/components/ImportValidationModal';
import { FlexibleImportValidationModal } from '@/components/FlexibleImportValidationModal';
import AppLayout from '@/components/layout/AppLayout';
import { Modal, Button, Group, Alert, Select, TextInput, ActionIcon, Paper, Text, LoadingOverlay } from '@mantine/core';
import { IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { CustomImportConfigurator } from './CustomImportConfigurator';
import { CustomImportConfig } from '@/modules/custom-importer/types';
import { importCustomData } from '@/modules/custom-importer';
import { AuthConfig } from '@/modules/simple-importer/types';

interface LevelConfig {
  name: string;
  columnName: string;
  level: number;
  energyTypeColumn?: string;
}

export default function FlexibleImportPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<LevelConfig[]>([
    { name: 'Niveau 1', columnName: '', level: 1 },
  ]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [importedData, setImportedData] = useState<Record<string, string>[]>([]);
  const [processedData, setProcessedData] = useState<FlexibleProcessedData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showImportTypeModal, setShowImportTypeModal] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState<'default' | 'custom' | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomImportConfig | null>(null);
  const [iihImportSuccess, setIihImportSuccess] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResultMessage, setImportResultMessage] = useState<string | null>(null);
  const [showImportProgress, setShowImportProgress] = useState<boolean>(false);
  const [importSteps, setImportSteps] = useState<Array<{name: string, status: 'pending' | 'loading' | 'success' | 'error', message?: string}>>([
    { name: "Création des assets", status: "pending" },
    { name: "Création des variables", status: "pending" },
    { name: "Configuration des agrégations", status: "pending" },
    { name: "Application des politiques de rétention", status: "pending" }
  ]);

  // Prepare initial hierarchy config for the configurator
  const initialHierarchy = {
    levels: levels.map(level => ({ columnName: level.columnName || '' })),
    energyTypeColumn: levels.length > 0 ? levels[levels.length - 1].energyTypeColumn : undefined
  };

  // Gestion du drag & drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      // Réinitialiser les états
      setLevels([{ name: 'Niveau 1', columnName: '', level: 1 }]);
      setProcessedData(null);
      setErrors([]);
      setExcelColumns([]);
      setImportedData([]);

      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Forcer XLSX à traiter la première ligne comme des en-têtes
          const options = {
            raw: false,
            defval: '',
            header: 1,
            blankrows: false
          };
          
          // Lire toutes les lignes
          const rows = XLSX.utils.sheet_to_json(worksheet, options) as any[];
          
          if (rows.length > 0) {
            // Nettoyer et valider les noms de colonnes (première ligne)
            const headers = rows[0].map((header: any) => {
              if (!header) return '';
              // Convertir en chaîne et nettoyer
              const cleanedHeader = String(header)
                .trim()
                .replace(/[\r\n]+/g, ' ') // Remplacer les sauts de ligne par des espaces
                .replace(/\s+/g, ' '); // Normaliser les espaces multiples
              
              return cleanedHeader;
            });

            // Vérifier les en-têtes dupliqués
            const duplicateHeaders = headers.filter(Boolean).filter(
              (header: string, index: number, array: string[]) => array.indexOf(header) !== index
            );

            if (duplicateHeaders.length > 0) {
              setErrors([`Colonnes en double détectées: ${duplicateHeaders.join(', ')}`]);
              return;
            }

            // Vérifier les en-têtes vides
            const validHeaders = headers.filter(Boolean);
            if (validHeaders.length === 0) {
              setErrors(['Aucune colonne valide détectée dans le fichier Excel']);
              return;
            }

            // Créer les objets de données avec les en-têtes nettoyés
            const jsonData = rows.slice(1).map((row: any) => {
              const obj: Record<string, string> = {};
              headers.forEach((header: string, index: number) => {
                if (header) {
                  // Convertir et nettoyer les valeurs des cellules
                  const cellValue = row[index];
                  obj[header] = cellValue !== undefined && cellValue !== null 
                    ? String(cellValue).trim() 
                    : '';
                }
              });
              return obj;
            });

            // Filtrer les lignes vides
            const filteredData = jsonData.filter(row => 
              Object.values(row).some(value => value !== '')
            );

            if (filteredData.length === 0) {
              setErrors(['Le fichier Excel ne contient aucune donnée valide']);
              return;
            }

            console.log('Colonnes détectées:', validHeaders);
            setExcelColumns(validHeaders);
            setImportedData(filteredData);

            // Afficher un résumé des données importées
            console.log(`Import réussi:
              - ${validHeaders.length} colonnes valides
              - ${filteredData.length} lignes de données
              - Colonnes: ${validHeaders.join(', ')}`);
          } else {
            setErrors(['Le fichier Excel est vide']);
          }
        } catch (error) {
          console.error('Erreur détaillée lors de la lecture du fichier Excel:', error);
          setErrors([
            'Erreur lors de la lecture du fichier Excel',
            error instanceof Error ? error.message : 'Format de fichier non valide'
          ]);
        }
      };

      reader.onerror = () => {
        setErrors(['Erreur lors de la lecture du fichier']);
      };

      reader.readAsArrayBuffer(file);
    }
  });

  // Ajout d'un nouveau niveau
  const addLevel = () => {
    const newLevel: LevelConfig = {
      name: `Niveau ${levels.length + 1}`,
      columnName: '',
      level: levels.length + 1
    };
    setLevels([...levels, newLevel]);
  };

  // Mise à jour d'un niveau
  const updateLevel = (index: number, field: keyof LevelConfig, value: string | number) => {
    const newLevels = [...levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setLevels(newLevels);
  };

  // Suppression d'un niveau
  const removeLevel = (index: number) => {
    const newLevels = levels.filter((_: LevelConfig, i: number) => i !== index);
    // Réajuster les numéros de niveau
    newLevels.forEach((level: LevelConfig, i: number) => {
      level.level = i + 1;
    });
    setLevels(newLevels);
  };

  // Traitement des données
  const processData = () => {
    setErrors([]);

    // Validation supplémentaire pour les colonnes non sélectionnées
    const emptyColumns = levels.filter(level => !level.columnName);
    if (emptyColumns.length > 0) {
      setErrors(["Veuillez sélectionner une colonne pour chaque niveau"]);
      return;
    }

    // Validation des colonnes dupliquées
    const selectedColumns = levels.map(level => level.columnName);
    const uniqueColumns = new Set(selectedColumns);
    if (uniqueColumns.size !== selectedColumns.length) {
      setErrors(["Une même colonne ne peut pas être utilisée pour plusieurs niveaux"]);
      return;
    }

    // Validation
    const validationErrors = validateFlexibleHierarchyData(importedData, levels);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = processFlexibleHierarchy(importedData, levels);
      console.log("Processed data for Sankey:", result); // Log processed data
      setProcessedData(result);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Une erreur est survenue']);
      setProcessedData(null); // Clear processed data on error
    }
  };

  // MODIFIED: Opens the import type selection modal
  const handleIIHImport = () => {
    if (processedData) {
      setShowImportTypeModal(true);
      setShowConfigurator(false); // Ensure configurator is hidden initially
      setCustomConfig(null); // Reset custom config
    } else {
      console.warn("handleIIHImport called without processedData");
      setErrors(["Veuillez d'abord valider la configuration des niveaux."]);
    }
  };

  // MODIFIED: Handles selection from the first modal
  const handleSelectImportType = (type: 'default' | 'custom') => {
    setSelectedImportType(type);
    setShowImportTypeModal(false);

    if (type === 'default') {
      setShowValidationModal(true); // Show default validation modal
    } else {
      // Show the configurator for custom import
      setShowConfigurator(true);
    }
  };

  // Handler when custom config is complete
  const handleConfigComplete = (config: CustomImportConfig) => {
    console.log("Custom configuration received, initiating import:", config);
    setCustomConfig(config); // Store the config
    setShowConfigurator(false); // Hide configurator
    // Call the import function directly
    performActualImport(config);
  };

  // NEW: Callback to cancel/close the configurator
  const handleCancelConfig = () => {
    setShowConfigurator(false);
    setSelectedImportType(null); // Reset selection
  };

  // MODIFIED: Handles only CUSTOM import now
  const performActualImport = async (config: CustomImportConfig) => {
    // Ensure we have the raw imported data
    if (!importedData || importedData.length === 0) {
        console.error("performActualImport called without importedData");
        setErrors(["Erreur interne: Données brutes non disponibles pour l'import."]);
        return;
    }

    setIsImporting(true); // Set loading state
    setIihImportSuccess(false);
    setImportResultMessage(null);
    setErrors([]); // Clear previous errors
    
    // Réinitialiser les étapes et afficher le modal de progression
    setImportSteps([
      { name: "Création des assets", status: "pending" },
      { name: "Création des variables", status: "pending" },
      { name: "Configuration des agrégations", status: "pending" },
      { name: "Application des politiques de rétention", status: "pending" }
    ]);
    setShowImportProgress(true);

    try {
        // 1. Get AuthConfig from localStorage
        const authConfigString = localStorage.getItem('authConfig');
        if (!authConfigString) {
            throw new Error("Configuration d'authentification introuvable. Veuillez vous reconnecter.");
        }
        const authConfig: AuthConfig = JSON.parse(authConfigString);
        if (!authConfig.baseUrl || !authConfig.token) {
            throw new Error("Configuration d'authentification invalide.");
        }

        // 2. Perform the import with progress tracking
        console.log("Calling importCustomData with:", { importedDataCount: importedData.length });
        
        // Mettre à jour l'étape actuelle
        setImportSteps(prev => prev.map((step, idx) => 
            idx === 0 ? { ...step, status: 'loading' } : step
        ));
        
        // Utiliser un timeout pour permettre au state de se mettre à jour et au modal de s'afficher
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // Essayer l'import
            const result = await importCustomData(config, importedData);
            
            // Vérifier le résultat de l'import
            if (result.success) {
                console.log("Custom import successful:", result.message);
                
                // Mettre à jour toutes les étapes comme réussies
                setImportSteps(prev => prev.map(step => ({
                    ...step,
                    status: 'success'
                })));
                
                setIihImportSuccess(true);
                setImportResultMessage('Importation personnalisée réussie !');
            } else {
                // En cas d'erreur
                console.error("Custom import failed:", result.error);
                
                // Marquer les étapes appropriées comme échouées
                const newSteps = [...importSteps];
                if (result.assetsCount === 0) {
                    newSteps[0].status = 'error';
                    newSteps[0].message = "Erreur lors de la création des assets";
                } else if (result.variablesCount === 0) {
                    newSteps[0].status = 'success';
                    newSteps[1].status = 'error';
                    newSteps[1].message = "Erreur lors de la création des variables";
                } else if (result.aggregationsCount === 0) {
                    newSteps[0].status = 'success';
                    newSteps[1].status = 'success';
                    newSteps[2].status = 'error';
                    newSteps[2].message = "Erreur lors de la configuration des agrégations";
                } else {
                    newSteps[0].status = 'success';
                    newSteps[1].status = 'success';
                    newSteps[2].status = 'success';
                    newSteps[3].status = 'error';
                    newSteps[3].message = "Erreur lors de l'application des politiques de rétention";
                }
                setImportSteps(newSteps);
                
                // Ensure error is a string
                const errorMessage = typeof result.error === 'string' ? result.error : (result.error?.message || "Une erreur inconnue est survenue lors de l'import.");
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw error; // Re-throw to be caught by the outer try-catch
        }
    } catch (error) {
      console.error("Custom import process failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue lors du processus d'import personnalisé.";
      setErrors([errorMessage]);
      setImportResultMessage(`Échec de l'import : ${errorMessage}`); // Display error message
      setIihImportSuccess(false);
      
      // Marquer l'étape actuelle comme échouée si aucune étape n'est déjà marquée
      if (!importSteps.some(step => step.status === 'error')) {
          setImportSteps(prev => {
              const loading = prev.findIndex(step => step.status === 'loading');
              if (loading >= 0) {
                  const newSteps = [...prev];
                  newSteps[loading].status = 'error';
                  newSteps[loading].message = errorMessage;
                  return newSteps;
              }
              return prev;
          });
      }
    } finally {
      setIsImporting(false); // Clear loading state
      // Ne pas fermer le modal de progression - l'utilisateur le fermera manuellement
    }
  };

  // Fonction pour continuer vers Mendix
  const handleContinue = () => {
    if (processedData && iihImportSuccess) {
      // Maybe clear local storage before navigating?
      // localStorage.removeItem('iihStructure'); // Example cleanup
      router.push('/mendix-generator');
    } else {
       alert("L'import IIH doit être réussi avant de continuer.");
    }
  };

  return (
    <AppLayout>
      <LoadingOverlay visible={isImporting} overlayProps={{ radius: "sm", blur: 2 }} />
      <div className="max-w-4xl mx-auto space-y-8 relative">
        {/* Conditionally render configurator or the main content */}
        {showConfigurator ? (
          // Pass the pre-calculated initial hierarchy config
          <CustomImportConfigurator
            processedData={importedData}
            availableColumns={excelColumns}
            initialHierarchyConfig={initialHierarchy} // Pass the variable directly
            onConfigComplete={handleConfigComplete}
            onCancel={handleCancelConfig}
          />
        ) : ( // No need for IIFE here
          <>
            {/* En-tête avec description */}
            <div className="bg-gray-800 rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-white mb-4">Import Hiérarchique Flexible</h1>
              <p className="text-gray-400">
                Cet outil vous permet d'importer des données hiérarchiques depuis un fichier Excel et de les visualiser sous forme de diagramme Sankey.
                Suivez les étapes ci-dessous pour configurer et importer vos données.
              </p>
            </div>

            {/* Étape 1: Import du fichier */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                Import du fichier Excel
              </h2>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600">Glissez-déposez un fichier Excel ici, ou cliquez pour sélectionner</p>
                  <p className="text-sm text-gray-500">Formats acceptés: .xlsx, .xls</p>
                </div>
              </div>
            </div>

            {/* Étape 2: Configuration des niveaux */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                Configuration des niveaux hiérarchiques
              </h2>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Pour chaque niveau de votre hiérarchie :
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Donnez un nom explicite au niveau (ex: "Secteur", "Atelier", "Machine")</li>
                  <li>Sélectionnez la colonne Excel correspondante dans le menu déroulant</li>
                  <li>L'ordre des niveaux définit la hiérarchie (du plus haut au plus bas)</li>
                </ul>
              </div>
              <div className="space-y-4">
                {levels.map((level: LevelConfig, index: number) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-700">Nom du niveau</label>
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => updateLevel(index, 'name', e.target.value)}
                        placeholder="ex: Secteur, Atelier, Machine..."
                        className="w-full border border-gray-300 p-2 rounded-md text-gray-800"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-sm font-medium text-gray-700">Colonne Excel</label>
                      <select
                        value={level.columnName}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => updateLevel(index, 'columnName', e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded-md text-gray-800 bg-white"
                      >
                        <option value="">Sélectionner une colonne</option>
                        {excelColumns.map((col: string) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                    {index === levels.length - 1 && (
                      <div className="flex-1 space-y-1">
                        <label className="text-sm font-medium text-gray-700">Colonne Type d'Énergie</label>
                        <select
                          value={level.energyTypeColumn || ''}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => updateLevel(index, 'energyTypeColumn', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-md text-gray-800 bg-white"
                        >
                          <option value="">Sélectionner une colonne</option>
                          {excelColumns.map((col: string) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex items-end justify-between md:justify-end gap-4">
                      <span className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-full whitespace-nowrap">
                        Niveau {level.level}
                      </span>
                      {levels.length > 1 && (
                        <button
                          onClick={() => removeLevel(index)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                          title="Supprimer ce niveau"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addLevel}
                  className="w-full mt-4 py-2 px-4 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter un niveau
                </button>
              </div>
            </div>

            {/* Affichage des erreurs */}
            {errors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-red-800 font-medium">Erreurs à corriger</h3>
                </div>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Étape 3: Traitement des données */}
            {importedData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                  Traitement des données
                </h2>
                <button
                  onClick={processData}
                  className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Traiter les données
                </button>
              </div>
            )}

            {/* Résultats */}
            {processedData && (
              <div className="space-y-8">
                {/* Résumé et statistiques */}
                <FlexibleImportSummary data={processedData} rawData={importedData} />

                {/* Visualisation Sankey */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisation Sankey</h2>
                  <FlexibleSankeyChart data={processedData.hierarchyData} />
                </div>

                {/* Étape 4: Validation et Import IIH */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                    Validation et Import IIH
                  </h2>
                  <div className="space-y-4">
                    {importResultMessage && (
                       <Alert 
                         color={iihImportSuccess ? "green" : "red"}
                         title={iihImportSuccess ? "Succès" : "Échec"}
                         icon={iihImportSuccess ? <IconCheck size={16} /> : <IconX size={16} />}
                         withCloseButton 
                         onClose={() => setImportResultMessage(null)}
                       >
                         {importResultMessage}
                       </Alert>
                     )} 
                    
                    {!iihImportSuccess ? (
                      <>
                        <p className="text-gray-600">
                          Les données ont été traitées avec succès. Vous pouvez maintenant valider et importer la structure vers IIH.
                        </p>
                        <button
                          onClick={handleIIHImport}
                          disabled={isImporting}
                          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {isImporting ? 'Importation en cours...' : 'Valider et importer vers IIH'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleContinue}
                          className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Continuer vers la génération Mendix
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* New Modal for Import Type Selection */}
        <Modal
          opened={showImportTypeModal}
          onClose={() => setShowImportTypeModal(false)}
          title="Choisir le type d'importation"
          centered
          classNames={{
            body: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", 
            header: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
          }}
        >
         <p className="mb-4">Sélectionnez comment vous souhaitez importer les données :</p>
         <Group justify="center">
           <Button onClick={() => handleSelectImportType('default')} variant="filled">
             Import par Défaut
           </Button>
           <Button 
             onClick={() => handleSelectImportType('custom')} 
             variant="filled"
             className="bg-blue-600 hover:bg-blue-700 text-white"
           >
             Import Personnalisé
           </Button>
         </Group>
       </Modal>

        {/* Default Validation Modal */}
        {processedData && !showConfigurator && (
          <FlexibleImportValidationModal
            isOpen={showValidationModal}
            onClose={() => {
              setShowValidationModal(false);
              // Optionally reset import status if modal is closed without confirming?
              // setIihImportSuccess(false); 
            }}
            data={processedData} 
            rawData={importedData}
            onImportSuccess={() => {
              console.log("Import successful callback received from Modal");
              setIihImportSuccess(true);
              setShowValidationModal(false); // Close modal on success
            }}
          />
        )}

        {/* Modal pour afficher le progrès de l'import */}
        <Modal 
          opened={showImportProgress} 
          onClose={() => iihImportSuccess || !isImporting ? setShowImportProgress(false) : null}
          withCloseButton={!isImporting}
          closeOnClickOutside={false}
          closeOnEscape={!isImporting}
          title="Progression de l'import"
          size="lg"
        >
          <div className="space-y-4">
            {importSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'pending' ? 'bg-gray-200' :
                  step.status === 'loading' ? 'bg-blue-200 animate-pulse' :
                  step.status === 'success' ? 'bg-green-200' :
                  'bg-red-200'
                }`}>
                  {step.status === 'pending' && <span className="text-gray-500">{index + 1}</span>}
                  {step.status === 'loading' && <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>}
                  {step.status === 'success' && <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>}
                  {step.status === 'error' && <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    step.status === 'pending' ? 'text-gray-600' :
                    step.status === 'loading' ? 'text-blue-600' :
                    step.status === 'success' ? 'text-green-600' :
                    'text-red-600'
                  }`}>{step.name}</p>
                  {step.message && <p className="text-sm text-red-500">{step.message}</p>}
                </div>
              </div>
            ))}
            
            {/* Résumé et actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              {iihImportSuccess ? (
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-3">Import réussi !</p>
                  <Button color="green" onClick={() => setShowImportProgress(false)}>Fermer</Button>
                </div>
              ) : errors.length > 0 ? (
                <div className="text-center">
                  <p className="text-red-600 font-medium mb-3">Des erreurs sont survenues durant l'import</p>
                  <Button color="red" onClick={() => setShowImportProgress(false)}>Fermer</Button>
                </div>
              ) : isImporting ? (
                <div className="text-center">
                  <p className="text-blue-600 font-medium mb-3">Import en cours...</p>
                  <div className="animate-pulse">Veuillez patienter</div>
                </div>
              ) : null}
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
} 