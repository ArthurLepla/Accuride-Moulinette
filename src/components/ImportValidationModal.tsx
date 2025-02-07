'use client';

import { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { ExcelData } from '@/lib/types';
import { importAssetsFromExcel } from '@/lib/assetImporter';

interface ImportValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExcelData[];
  onImportSuccess?: () => void;
}

type Step = {
  title: string;
  description: string;
  validate: (data: ExcelData[]) => { isValid: boolean; errors: string[]; details?: any[] };
  renderDetails?: (details: any[]) => React.ReactNode;
};

// Fonction pour nettoyer les noms
const cleanName = (name: string): string => {
  return name.trim().replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '');
};

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

// Fonction utilitaire pour obtenir l'unité en fonction du type
const getUnitByType = (type: string): string => {
  switch (type) {
    case 'Elec':
      return 'kWh';
    case 'Gaz':
    case 'Eau':
    case 'Air':
      return 'm³';
    default:
      return '-';
  }
};

const steps: Step[] = [
  {
    title: "Validation des secteurs",
    description: "Vérification des noms de secteurs",
    validate: (data) => {
      const sectorsMap = new Map<string, {
        name: string;
        machines: Set<string>;
        workshops: Set<string>;
        isValid: boolean;
      }>();

      // Collecter et valider les données
      data.forEach(item => {
        if (!item.sector?.trim()) {
          return;
        }

        const cleanedSector = cleanName(item.sector);
        if (!sectorsMap.has(cleanedSector)) {
          sectorsMap.set(cleanedSector, {
            name: item.sector,
            machines: new Set(),
            workshops: new Set(),
            isValid: true
          });
        }

        const sectorInfo = sectorsMap.get(cleanedSector)!;
        if (item.machine) {
          sectorInfo.machines.add(cleanName(item.machine));
        }
        if (item.workshop) {
          sectorInfo.workshops.add(cleanName(item.workshop));
        }
      });

      // Préparer les détails
      const details = Array.from(sectorsMap.entries()).map(([_, info]) => ({
        name: info.name,
        ateliers: info.workshops.size,
        machines: info.machines.size,
        status: info.isValid ? "Valide" : "Ignoré"
      }));

      return {
        isValid: details.length > 0,
        errors: [],
        details: details.sort((a, b) => b.machines - a.machines)
      };
    },
    renderDetails: (details) => (
      <TableView
        data={details}
        columns={[
          { key: 'name', label: 'Secteur' },
          { key: 'ateliers', label: 'Ateliers' },
          { key: 'machines', label: 'Machines' },
          { key: 'status', label: 'Statut' }
        ]}
      />
    )
  },
  {
    title: "Validation des machines",
    description: "Vérification des noms de machines et de leurs unités de mesure",
    validate: (data) => {
      // Debug des données reçues
      console.log('Données reçues dans la validation:', data);

      const machines = new Map<string, {
        name: string;
        sector: string;
        workshop: string | null;
        type: string;
        unit: string;
        count: number;
      }>();

      data.forEach(item => {
        if (!item.machine?.trim()) return;
        console.log('Traitement de la machine:', item);

        const cleanedMachine = cleanName(item.machine);
        if (!machines.has(cleanedMachine)) {
          machines.set(cleanedMachine, {
            name: item.machine,
            sector: item.sector,
            workshop: item.workshop || null,
            type: item.type || 'Non spécifié',
            unit: getUnitByType(item.type || ''),
            count: 1
          });
        } else {
          machines.get(cleanedMachine)!.count++;
        }
      });

      // Debug des machines traitées
      console.log('Machines traitées:', Array.from(machines.values()));

      const details = Array.from(machines.values()).map(info => ({
        machine: info.name,
        secteur: info.sector,
        atelier: info.workshop || "Sans atelier",
        type: info.type,
        unite: info.unit,
        occurrences: info.count,
        status: "Valide"
      }));

      return {
        isValid: details.length > 0,
        errors: [],
        details: details.sort((a, b) => b.occurrences - a.occurrences)
      };
    },
    renderDetails: (details) => (
      <TableView
        data={details}
        columns={[
          { key: 'machine', label: 'Machine' },
          { key: 'secteur', label: 'Secteur' },
          { key: 'atelier', label: 'Atelier' },
          { key: 'type', label: 'Type' },
          { key: 'unite', label: 'Unité' },
          { key: 'occurrences', label: 'Occurrences' },
          { key: 'status', label: 'Statut' }
        ]}
      />
    )
  }
];

export function ImportValidationModal({ isOpen, onClose, data, onImportSuccess }: ImportValidationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<Array<{ isValid: boolean; errors: string[]; details?: any[] } | null>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && data) {
      validateCurrentStep();
    }
  }, [currentStep, data, isOpen]);

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const result = step.validate(data);
    setStepResults(prev => {
      const newResults = [...prev];
      newResults[currentStep] = result;
      return newResults;
    });
  };

  const canProceed = useMemo(() => {
    const currentResult = stepResults[currentStep];
    return currentResult?.isValid ?? false;
  }, [currentStep, stepResults]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1 && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Début de l\'import avec les données:', data);
      
      // Utiliser importAssetsFromExcel au lieu de créer directement les assets
      const result = await importAssetsFromExcel(data);
      
      if (result.success) {
        console.log('Import réussi:', result);
        if (onImportSuccess) {
          onImportSuccess();
        }
        onClose();
      } else {
        throw new Error('Échec de l\'import');
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header fixe */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Validation et Import IIH
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Étapes */}
          <div className="flex items-center mt-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${index === currentStep
                      ? 'border-blue-500 text-blue-500'
                      : index < currentStep
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-600 text-gray-600'
                    }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 
                      ${index < currentStep ? 'bg-green-500' : 'bg-gray-600'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-400">
              {steps[currentStep].description}
            </p>
          </div>

          {stepResults[currentStep]?.details && steps[currentStep].renderDetails && (
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              {steps[currentStep].renderDetails(stepResults[currentStep]!.details!)}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-900 bg-opacity-20 border border-red-500 rounded p-3">
              <div className="flex items-center text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer fixe avec les boutons */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className={`px-4 py-2 rounded ${
                currentStep === 0
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              disabled={currentStep === 0}
            >
              Retour
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleImport}
                disabled={!canProceed || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Import en cours...</span>
                  </>
                ) : (
                  'Importer vers IIH'
                )}
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={!canProceed}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 