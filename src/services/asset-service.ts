import axios from 'axios';
import { IIHAssetResponse, AssetNode, IIHVariable } from '../types/assets';

export const getAssets = async (): Promise<IIHAssetResponse> => {
  try {
    const response = await fetch('/api/assets');
    const data = await response.json();

    if (!data || !data.assets) {
      console.error('Format de réponse invalide:', data);
      throw new Error('Format de réponse invalide');
    }

    // Récupérer les détails des assets qui ont des enfants
    const assetsWithDetails = await Promise.all(
      data.assets
        .filter(asset => asset.hasChildren)
        .map(async asset => {
          try {
            const details = await getAssetDetails(asset.assetId);
            return {
              ...asset,
              children: details.children || [],
              variables: details.variables || []
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails de l'asset ${asset.assetId}:`, error);
            return asset;
          }
        })
    );

    // Mettre à jour les assets avec leurs enfants et variables
    const updatedAssets = data.assets.map(asset => {
      const assetWithDetails = assetsWithDetails.find(a => a.assetId === asset.assetId);
      return assetWithDetails || asset;
    });

    return {
      assets: updatedAssets
    };
  } catch (error: any) {
    console.error('Erreur détaillée lors de la récupération des assets:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des assets');
  }
};

export const getAssetDetails = async (assetId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/assets/${assetId}`);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`Erreur lors de la récupération des détails de l'asset ${assetId}:`, error);
    throw new Error(error.message || 'Erreur lors de la récupération des détails');
  }
};

export const buildAssetTree = (assets: IIHAssetResponse): AssetNode[] => {
  if (!assets.assets || !Array.isArray(assets.assets)) {
    console.error('Données invalides pour la construction de l\'arbre:', assets);
    return [];
  }

  const assetMap = new Map<string, AssetNode>();
  const rootNodes: AssetNode[] = [];

  // Première passe : créer tous les nœuds
  assets.assets.forEach(asset => {
    const node: AssetNode = {
      id: asset.assetId,
      name: asset.name,
      parentId: asset.parentId,
      hasChildren: asset.hasChildren,
      type: asset.parentId === '' ? 'root' : asset.hasChildren ? 'parent' : 'child',
      children: [],
      variables: asset.variables || []
    };
    assetMap.set(asset.assetId, node);

    // Ajouter les enfants s'ils existent
    if (asset.children && Array.isArray(asset.children)) {
      asset.children.forEach(child => {
        if (child && typeof child === 'object') {
          const childNode: AssetNode = {
            id: child.assetId || child.id,
            name: child.name,
            parentId: asset.assetId,
            hasChildren: child.hasChildren || false,
            type: child.hasChildren ? 'parent' : 'child',
            children: [],
            variables: child.variables || []
          };
          assetMap.set(childNode.id, childNode);
        }
      });
    }
  });

  // Deuxième passe : construire l'arbre
  assetMap.forEach(node => {
    if (!node.parentId || node.parentId === '') {
      rootNodes.push(node);
    } else {
      const parentNode = assetMap.get(node.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        console.warn(`Parent non trouvé pour l'asset ${node.id}, ajout à la racine`);
        rootNodes.push(node);
      }
    }
  });

  // Trier les nœuds par sortOrder
  const sortNodes = (nodes: AssetNode[]) => {
    nodes.sort((a, b) => {
      const assetA = assets.assets.find(asset => asset.assetId === a.id);
      const assetB = assets.assets.find(asset => asset.assetId === b.id);
      return (assetA?.sortOrder || 0) - (assetB?.sortOrder || 0);
    });
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);
  return rootNodes;
}; 