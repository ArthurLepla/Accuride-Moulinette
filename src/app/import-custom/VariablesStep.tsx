import { useState } from 'react';
import type { CustomImportConfig } from '@/modules/custom-importer/configSchema';

export default function VariablesStep({ excelData, config, setConfig, onNext, onPrev }: any) {
  // Pour chaque niveau, permettre d'ajouter des variables (UI simplifiée)
  // TODO: UI dynamique pour chaque niveau
  function handleContinue() {
    // TODO: collecter les variables configurées
    setConfig((prev: CustomImportConfig) => ({
      ...prev,
      variables: {
        ...prev.variables,
        // Ex: Secteur: [{ ... }]
      }
    }));
    onNext();
  }

  return (
    <div>
      <h2 className="text-xl mb-2">Étape 2 : Définition des variables</h2>
      {/* TODO: UI dynamique pour chaque niveau */}
      <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={onPrev}>
        Précédent
      </button>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleContinue}>
        Continuer
      </button>
    </div>
  );
} 