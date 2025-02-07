"use client";

import React from 'react';
import { AssetNode } from '../types/assets';

interface AssetDetailsProps {
  asset: AssetNode | null;
}

export const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  if (!asset) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Sélectionnez un asset pour voir ses détails
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">{asset.name || 'Sans nom'}</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Informations</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-400">ID:</div>
          <div>{asset.id || 'N/A'}</div>
          <div className="text-gray-400">Type:</div>
          <div>{asset.type || 'N/A'}</div>
          <div className="text-gray-400">Parent ID:</div>
          <div>{asset.parentId || 'Aucun'}</div>
        </div>
      </div>

      {asset.variables && asset.variables.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Variables</h3>
          <div className="space-y-4">
            {asset.variables.map((variable) => (
              <div key={variable.id || Math.random()} className="bg-gray-800 p-3 rounded">
                <div className="font-medium mb-2">{variable.name || 'Sans nom'}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">Type:</div>
                  <div>{variable.dataType || 'N/A'}</div>
                  {variable.unit && (
                    <>
                      <div className="text-gray-400">Unité:</div>
                      <div>{variable.unit}</div>
                    </>
                  )}
                  {variable.aggregations && variable.aggregations.length > 0 && (
                    <>
                      <div className="text-gray-400 col-span-2 mt-2">Agrégations:</div>
                      <div className="col-span-2">
                        <ul className="list-disc list-inside pl-4">
                          {variable.aggregations.map((agg) => (
                            <li key={agg.id || Math.random()}>
                              {agg.aggregation} ({agg.cycle?.base || 'N/A'} / {agg.cycle?.factor || 'N/A'})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-400">Aucune variable disponible</div>
      )}
    </div>
  );
};

export default AssetDetails; 