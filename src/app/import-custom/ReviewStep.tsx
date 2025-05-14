export default function ReviewStep({ config, excelData, onImport, loading, onPrev }: any) {
  return (
    <div>
      <h2 className="text-xl mb-2">Étape 4 : Résumé et lancement de l'import</h2>
      <pre className="bg-gray-900 text-green-300 p-4 rounded mb-4">
        {JSON.stringify({ config, excelData }, null, 2)}
      </pre>
      <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={onPrev}>
        Précédent
      </button>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onImport} disabled={loading}>
        {loading ? 'Import en cours...' : 'Lancer l\'import'}
      </button>
    </div>
  );
} 