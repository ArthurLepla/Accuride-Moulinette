import { useState } from 'react';
import type { CustomImportConfig } from '@/modules/custom-importer/configSchema';

export default function AggregationsStep({ config, setConfig, onNext, onPrev }: any) {
  // TODO: UI pour configurer les agrégations/rétention par variable
  function handleContinue() {
    // TODO: collecter les agrégations configurées
    onNext();
  }

  return (
    <div>
      <h2 className="text-xl mb-2">Étape 3 : Agrégations et rétention</h2>
      {/* TODO: UI dynamique */}
      <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={onPrev}>
        Précédent
      </button>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleContinue}>
        Continuer
      </button>
    </div>
  );
} 