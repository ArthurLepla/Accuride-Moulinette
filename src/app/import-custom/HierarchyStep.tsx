import { useState } from 'react';
import type { CustomImportConfig } from '@/modules/custom-importer/configSchema';

export default function HierarchyStep({ excelData, setExcelData, config, setConfig, onNext }: any) {
  const [localHierarchy, setLocalHierarchy] = useState(config?.hierarchy || [
    { name: 'Secteur', excelColumn: 'Secteur' },
    { name: 'Atelier', excelColumn: 'Atelier' },
    { name: 'Machine', excelColumn: 'Machine' }
  ]);

  // TODO: Ajouter un vrai composant d'upload Excel et de mapping dynamique
  function handleContinue() {
    setConfig((prev: CustomImportConfig) => ({
      ...prev,
      hierarchy: localHierarchy
    }));
    onNext();
  }

  return (
    <div>
      <h2 className="text-xl mb-2">Étape 1 : Mapping de la hiérarchie</h2>
      {/* Upload Excel (à remplacer par un vrai composant) */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx,.csv"
          onChange={e => {
            // TODO: parser le fichier et setExcelData
            alert('TODO: parser le fichier Excel');
          }}
        />
      </div>
      {/* Mapping hiérarchie (à remplacer par un vrai UI) */}
      <div className="mb-4">
        {localHierarchy.map((level: any, idx: number) => (
          <div key={idx} className="mb-2">
            <input
              className="border px-2 py-1"
              value={level.name}
              onChange={e => {
                const copy = [...localHierarchy];
                copy[idx].name = e.target.value;
                setLocalHierarchy(copy);
              }}
            />
            <input
              className="border px-2 py-1 ml-2"
              value={level.excelColumn}
              onChange={e => {
                const copy = [...localHierarchy];
                copy[idx].excelColumn = e.target.value;
                setLocalHierarchy(copy);
              }}
            />
          </div>
        ))}
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleContinue}>
        Continuer
      </button>
    </div>
  );
} 