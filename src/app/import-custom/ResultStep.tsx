export default function ResultStep({ result, onRestart }: any) {
  return (
    <div>
      <h2 className="text-xl mb-2">Résultat de l'import</h2>
      <pre className="bg-gray-900 text-green-300 p-4 rounded mb-4">
        {JSON.stringify(result, null, 2)}
      </pre>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onRestart}>
        Recommencer
      </button>
    </div>
  );
} 