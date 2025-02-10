'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import FlexibleSankeyChart from '@/components/charts/FlexibleSankeyChart';
import { HierarchyData } from '@/types/sankey';
import { ArrowLeft } from 'lucide-react';

export default function ChartsPage() {
  const router = useRouter();
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null);

  useEffect(() => {
    const iihStructure = localStorage.getItem('iihStructure');
    if (!iihStructure) {
      router.push('/dashboard');
      return;
    }

    try {
      const data = JSON.parse(iihStructure);
      setHierarchyData(data.hierarchyData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      router.push('/dashboard');
    }
  }, [router]);

  if (!hierarchyData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Visualisation de la Structure</h1>
          </div>
        </div>

        <div className="space-y-8">
          {/* Sankey Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Diagramme de Flux Hiérarchique</h2>
            <div className="bg-gray-900 rounded-lg p-4">
              <FlexibleSankeyChart data={hierarchyData} />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total des Niveaux</h3>
              <p className="text-3xl font-bold text-blue-400">{hierarchyData.levels.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total des Nœuds</h3>
              <p className="text-3xl font-bold text-blue-400">{hierarchyData.nodes.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Total des Connexions</h3>
              <p className="text-3xl font-bold text-blue-400">{hierarchyData.links.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Moyenne de Connexions</h3>
              <p className="text-3xl font-bold text-blue-400">
                {(hierarchyData.links.length / hierarchyData.nodes.length).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Level Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Détails par Niveau</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Nombre de Nœuds
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Connexions Entrantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Connexions Sortantes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {hierarchyData.levels.map((level, index) => {
                    const nodesAtLevel = hierarchyData.nodes.filter(n => n.level === level.level);
                    const incomingLinks = hierarchyData.links.filter(l => {
                      const targetNode = hierarchyData.nodes.find(n => n.id === l.target);
                      return targetNode?.level === level.level;
                    });
                    const outgoingLinks = hierarchyData.links.filter(l => {
                      const sourceNode = hierarchyData.nodes.find(n => n.id === l.source);
                      return sourceNode?.level === level.level;
                    });

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {level.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {nodesAtLevel.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {incomingLinks.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {outgoingLinks.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 