'use client';

import { useState, useEffect, useMemo } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { FlexibleProcessedData } from '@/types/sankey';
import { importFlexibleAssetsToIIH } from '@/lib/flexibleAssetImporter';

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

  useEffect(() => {
    if (isOpen && data) {
      validateCurrentStep();
    }
  }, [currentStep, data, isOpen]);

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const result = step.validate(data, rawData);
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

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import réel vers IIH
      const result = await importFlexibleAssetsToIIH(data);
      
      if (result.success) {
        console.log('Import IIH réussi:', result);
        onImportSuccess?.();
      } else {
        throw new Error('Échec de l\'import IIH');
      }
    } catch (err) {
      console.error('Erreur lors de l\'import:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'import');
    } finally {
      setIsLoading(false);
    }
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

          {/* Validation results */}
          {stepResults[currentStep] && stepResults[currentStep]?.errors && stepResults[currentStep].errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Erreurs détectées</span>
              </div>
              <ul className="list-disc list-inside text-red-300">
                {stepResults[currentStep].errors.map((error, index) => (
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
          </div>
        </div>
      </div>
    </div>
  );
} 