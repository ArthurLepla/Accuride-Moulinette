import { FlexibleProcessedData } from '@/types/sankey';

interface FlexibleImportSummaryProps {
  data: FlexibleProcessedData;
  rawData: Record<string, string>[];
}

export default function FlexibleImportSummary({ data, rawData }: FlexibleImportSummaryProps) {
  // Calcul des statistiques supplémentaires
  const stats = {
    totalRows: data.summary.totalRows,
    totalLevels: data.hierarchyData.levels.length,
    totalConnections: data.hierarchyData.links.length,
    averageChildrenPerNode: (data.hierarchyData.links.length / data.hierarchyData.nodes.length).toFixed(2),
    missingValues: Object.entries(data.summary.levelCounts).map(([levelName, count]) => ({
      levelName,
      missing: data.summary.totalRows - count
    }))
  };

  // Fonction pour formater les grands nombres
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">Lignes totales</h3>
          <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalRows)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">Niveaux</h3>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalLevels}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">Connexions</h3>
          <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalConnections)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-500">Moy. enfants/nœud</h3>
          <p className="text-2xl font-semibold text-gray-900">{stats.averageChildrenPerNode}</p>
        </div>
      </div>

      {/* Détails par niveau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Détails par niveau</h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Éléments uniques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeurs manquantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Couverture
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.hierarchyData.levels.map((level, index) => {
                const count = data.summary.levelCounts[level.name] || 0;
                const missing = stats.missingValues.find(m => m.levelName === level.name)?.missing || 0;
                const coverage = ((count / stats.totalRows) * 100).toFixed(1);

                return (
                  <tr key={level.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {level.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(count)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(missing)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${coverage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{coverage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aperçu des données */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Aperçu des données</h3>
        </div>
        <div className="border-t border-gray-200 p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(rawData[0] || {}).map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rawData.slice(0, 5).map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rawData.length > 5 && (
            <div className="text-center text-sm text-gray-500 mt-4">
              ... et {rawData.length - 5} lignes supplémentaires
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 