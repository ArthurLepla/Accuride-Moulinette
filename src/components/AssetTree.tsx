"use client";

import { useEffect, useState } from 'react';
import { getAuthConfig } from '@/lib/auth';
import { AssetNode } from '@/types/assets';

export function AssetTree() {
  const [assets, setAssets] = useState<AssetNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const authConfig = getAuthConfig();
        if (!authConfig) {
          setError('Non authentifié');
          return;
        }

        const response = await fetch('/api/assets', {
          headers: {
            'X-Auth-Config': JSON.stringify(authConfig)
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setAssets(data.assets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const fetchAssetDetails = async (assetId: string) => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) {
        throw new Error('Non authentifié');
      }

      const response = await fetch(`/api/assets/${assetId}`, {
        headers: {
          'X-Auth-Config': JSON.stringify(authConfig)
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
      throw error;
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Assets IIH</h2>
      <div className="space-y-2">
        {assets.map((asset) => (
          <div
            key={asset.assetId}
            className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-white"
            onClick={() => fetchAssetDetails(asset.assetId)}
          >
            {asset.name}
          </div>
        ))}
      </div>
    </div>
  );
} 