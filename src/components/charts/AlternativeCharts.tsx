'use client';

import React from 'react';
import { SankeyData } from '../../types/sankey';
import { SankeyChart } from './SankeyChart';
import { NetworkGraph } from './NetworkGraph';
import { TreeGraph } from './TreeGraph';
import { TreemapChart } from './TreemapChart';
import './AlternativeCharts.css';

interface AlternativeChartsProps {
  data: SankeyData;
  onNodeClick?: (nodeId: string) => void;
}

export const AlternativeCharts: React.FC<AlternativeChartsProps> = ({ data, onNodeClick }) => {
  return (
    <div className="alternative-charts">
      <div className="visualization-section">
        <h3 className="visualization-title">Diagramme de Sankey</h3>
        <p className="visualization-description">
          Visualisation des flux entre les différents niveaux de la hiérarchie
        </p>
        <SankeyChart data={data} />
      </div>

      <div className="visualization-section">
        <h3 className="visualization-title">Graphe de Relations</h3>
        <p className="visualization-description">
          Visualisation interactive des relations entre les éléments
        </p>
        <NetworkGraph data={data} />
      </div>

      <div className="visualization-section">
        <h3 className="visualization-title">Arbre Hiérarchique</h3>
        <p className="visualization-description">
          Représentation hiérarchique de la structure organisationnelle
        </p>
        <TreeGraph data={data} />
      </div>

      <div className="visualization-section">
        <h3 className="visualization-title">Carte Proportionnelle</h3>
        <p className="visualization-description">
          Visualisation de la répartition et des proportions
        </p>
        <TreemapChart data={data} />
      </div>
    </div>
  );
};

export default AlternativeCharts; 