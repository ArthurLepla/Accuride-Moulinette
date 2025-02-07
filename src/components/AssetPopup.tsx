import React, { useEffect, useState, useCallback } from 'react';
import { AssetNode, AssetTreeState } from '../types/assets';
import { getAssets, buildAssetTree, getAssetDetails } from '../services/asset-service';
import { AssetTree } from './AssetTree';

interface AssetPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetPopup: React.FC<AssetPopupProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<AssetNode[]>([]);
  const [treeState, setTreeState] = useState<AssetTreeState>({
    expandedNodes: new Set<string>(),
    selectedNode: null
  });
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any>(null);

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAssets();
      const tree = buildAssetTree(response);
      setTreeData(tree);
    } catch (err: any) {
      console.error('Erreur lors du chargement des assets:', err);
      setError(err.message || 'Une erreur est survenue lors du chargement des assets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    } else {
      setTreeData([]);
      setTreeState({ expandedNodes: new Set(), selectedNode: null });
      setSelectedNodeDetails(null);
    }
  }, [isOpen, loadAssets]);

  const handleToggleNode = (nodeId: string) => {
    setTreeState(prev => ({
      ...prev,
      expandedNodes: prev.expandedNodes.has(nodeId)
        ? new Set([...prev.expandedNodes].filter(id => id !== nodeId))
        : new Set([...prev.expandedNodes, nodeId])
    }));
  };

  const handleSelectNode = async (node: AssetNode) => {
    setTreeState(prev => ({ ...prev, selectedNode: node.id }));
    try {
      const details = await getAssetDetails(node.id);
      setSelectedNodeDetails(details);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-3xl mt-20 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">Assets IIH</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-[400px] max-h-[600px]">
          {/* Liste des assets */}
          <div className="w-2/5 border-r border-gray-700 p-4 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-3 py-2 rounded mb-3 text-sm">
                <p>{error}</p>
                <button
                  onClick={loadAssets}
                  className="mt-2 bg-red-900/50 px-2 py-1 rounded hover:bg-red-900/70"
                >
                  Réessayer
                </button>
              </div>
            )}

            {!loading && !error && treeData.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun asset trouvé
              </div>
            )}

            {!loading && !error && treeData.length > 0 && (
              <AssetTree
                nodes={treeData}
                expandedNodes={treeState.expandedNodes}
                selectedNode={treeState.selectedNode}
                onToggleNode={handleToggleNode}
                onSelectNode={handleSelectNode}
              />
            )}
          </div>

          {/* Détails de l'asset sélectionné */}
          <div className="w-3/5 p-4 overflow-y-auto">
            {treeState.selectedNode ? (
              <div>
                <h3 className="text-lg font-bold mb-3 text-white">
                  Détails de l'asset
                </h3>
                {selectedNodeDetails ? (
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-md p-3">
                      <h4 className="font-medium text-gray-200 mb-2 text-sm">Informations</h4>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(selectedNodeDetails, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    Chargement des détails...
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sélectionnez un asset pour voir ses détails
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 