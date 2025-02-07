'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SankeyChart } from '@/components/charts/SankeyChart';
import { TreemapChart } from '@/components/charts/TreemapChart';
import { TreeGraph } from '@/components/charts/TreeGraph';
import { isAuthenticated } from '@/lib/auth';

interface ExcelAsset {
  sector: string;
  workshop: string | null;
  machine: string;
  variables?: any;
}

interface SankeyData {
  nodes: Array<{
    id: string;
    name: string;
    category: 'sector' | 'workshop' | 'machine';
    value?: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

export default function ChartsPage() {
  const router = useRouter();
  const [data, setData] = useState<SankeyData | null>(null);
  const [activeTab, setActiveTab] = useState<'sankey' | 'treemap' | 'tree'>('sankey');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    const storedData = localStorage.getItem('excelData');
    if (storedData) {
      try {
        const excelData = JSON.parse(storedData) as ExcelAsset[];
        
        // Maps pour stocker les éléments uniques
        const sectorsMap = new Map<string, { name: string; machineCount: number }>();
        const workshopsMap = new Map<string, { name: string; sectorId: string; machineCount: number }>();
        const machinesMap = new Map<string, { name: string; workshopId: string | null; sectorId: string }>();

        // Première passe : collecter tous les éléments uniques
        excelData.forEach((asset) => {
          const sectorId = `sector-${asset.sector}`;
          const workshopId = asset.workshop ? `workshop-${asset.workshop}` : null;
          const machineId = `machine-${asset.machine}`;

          // Ajouter/mettre à jour le secteur
          if (!sectorsMap.has(sectorId)) {
            sectorsMap.set(sectorId, { name: asset.sector, machineCount: 0 });
          }
          sectorsMap.get(sectorId)!.machineCount++;

          // Ajouter/mettre à jour l'atelier si présent
          if (workshopId) {
            if (!workshopsMap.has(workshopId)) {
              workshopsMap.set(workshopId, { 
                name: asset.workshop!, 
                sectorId, 
                machineCount: 0 
              });
            }
            workshopsMap.get(workshopId)!.machineCount++;
          }

          // Ajouter la machine
          machinesMap.set(machineId, {
            name: asset.machine,
            workshopId,
            sectorId
          });
        });

        // Créer les nœuds
        const nodes = [
          // Secteurs
          ...Array.from(sectorsMap.entries()).map(([id, { name, machineCount }]) => ({
            id,
            name,
            category: 'sector' as const,
            value: machineCount
          })),
          // Ateliers
          ...Array.from(workshopsMap.entries()).map(([id, { name, machineCount }]) => ({
            id,
            name,
            category: 'workshop' as const,
            value: machineCount
          })),
          // Machines
          ...Array.from(machinesMap.entries()).map(([id, { name }]) => ({
            id,
            name,
            category: 'machine' as const,
            value: 1
          }))
        ];

        // Créer les liens
        const links = [
          // Liens Secteur -> Atelier
          ...Array.from(workshopsMap.entries()).map(([workshopId, { sectorId }]) => ({
            source: sectorId,
            target: workshopId,
            value: 1
          })),
          // Liens vers les machines
          ...Array.from(machinesMap.entries()).map(([machineId, { workshopId, sectorId }]) => ({
            source: workshopId || sectorId, // Si pas d'atelier, lier directement au secteur
            target: machineId,
            value: 1
          }))
        ];

        setData({ nodes, links });
      } catch (error) {
        console.error('Erreur lors du traitement des données:', error);
      }
    }
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">
          Aucune donnée disponible. Veuillez d'abord importer un fichier Excel.
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Visualisation des Assets</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retour au dashboard
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('sankey')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'sankey'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Diagramme Sankey
          </button>
          <button
            onClick={() => setActiveTab('treemap')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'treemap'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Treemap
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'tree'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Arbre hiérarchique
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 min-h-[800px]">
          {activeTab === 'sankey' && (
            <div className="h-full">
              <SankeyChart data={data} />
            </div>
          )}
          {activeTab === 'treemap' && (
            <div className="h-full">
              <TreemapChart data={data} />
            </div>
          )}
          {activeTab === 'tree' && (
            <div className="h-full">
              <TreeGraph data={data} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 