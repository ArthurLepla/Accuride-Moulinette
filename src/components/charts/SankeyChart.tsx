'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { SankeyData } from '../../types/sankey';
import { getColorByCategory } from '../../lib/utils';

interface SankeyChartProps {
  data: SankeyData;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'detail'>('overview');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Observer pour la réactivité
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const processedData = useMemo(() => {
    if (view === 'overview') {
      // 1. Identifier les machines liées à des ateliers
      const machinesWithWorkshop = new Set(
        data.links
          .filter(link => {
            const sourceNode = data.nodes.find(n => n.id === link.source);
            return sourceNode?.category === 'workshop';
          })
          .map(link => link.target)
      );

      // 2. Identifier les secteurs qui ont des ateliers
      const sectorsWithWorkshops = new Set(
        data.links
          .filter(link => {
            const sourceNode = data.nodes.find(n => n.id === link.source);
            const targetNode = data.nodes.find(n => n.id === link.target);
            return sourceNode?.category === 'sector' && targetNode?.category === 'workshop';
          })
          .map(link => link.source)
      );

      // 3. Préparer les nœuds
      const nodes = data.nodes.filter(node => {
        // Toujours inclure les secteurs
        if (node.category === 'sector') return true;
        
        // Inclure les ateliers seulement pour les secteurs qui en ont
        if (node.category === 'workshop') {
          const sectorLink = data.links.find(link => 
            link.target === node.id && 
            data.nodes.find(n => n.id === link.source)?.category === 'sector'
          );
          return !!sectorLink;
        }
        
        // Pour les machines :
        if (node.category === 'machine') {
          // Si la machine est liée à un atelier, ne pas l'inclure dans la vue d'ensemble
          if (machinesWithWorkshop.has(node.id)) return false;
          
          // Sinon, inclure la machine si elle est directement liée à un secteur
          const sectorLink = data.links.find(link => 
            link.target === node.id && 
            data.nodes.find(n => n.id === link.source)?.category === 'sector'
          );
          return !!sectorLink;
        }
        
        return false;
      }).map(node => ({
        ...node,
        value: 1
      }));

      // 4. Créer le map des indices
      const nodeIndexMap = new Map(nodes.map((node, index) => [node.id, index]));

      // 5. Préparer les liens
      const links = data.links
        .filter(link => {
          const sourceNode = data.nodes.find(n => n.id === link.source);
          const targetNode = data.nodes.find(n => n.id === link.target);
          
          // Vérifier si les deux nœuds existent dans notre ensemble filtré
          const sourceExists = nodeIndexMap.has(link.source);
          const targetExists = nodeIndexMap.has(link.target);

          if (!sourceExists || !targetExists) return false;

          // Cas 1: Lien Secteur -> Atelier
          if (sourceNode?.category === 'sector' && targetNode?.category === 'workshop') {
            return true;
          }

          // Cas 2: Lien Secteur -> Machine (seulement pour les machines sans atelier)
          if (sourceNode?.category === 'sector' && targetNode?.category === 'machine') {
            return !machinesWithWorkshop.has(targetNode.id);
          }

          return false;
        })
        .map(link => ({
          source: nodeIndexMap.get(link.source),
          target: nodeIndexMap.get(link.target),
          value: 1
        }));

      return { nodes, links };
    } else if (selectedWorkshop) {
      // Vue détaillée : atelier sélectionné et ses machines
      const workshop = data.nodes.find(n => n.id === selectedWorkshop);
      if (!workshop) return { nodes: [], links: [] };

      const relatedMachines = data.links
        .filter(link => link.source === selectedWorkshop)
        .map(link => data.nodes.find(n => n.id === link.target))
        .filter(Boolean);

      const nodes = [workshop, ...relatedMachines];
      const nodeIndexMap = new Map(nodes.map((node, index) => [node.id, index]));

      const links = data.links
        .filter(link => link.source === selectedWorkshop)
        .map(link => ({
          source: nodeIndexMap.get(link.source),
          target: nodeIndexMap.get(link.target),
          value: 1
        }));

      return { nodes, links };
    }

    return { nodes: [], links: [] };
  }, [data, view, selectedWorkshop]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tooltipRef.current || dimensions.width === 0) return;

    const { width, height } = dimensions;
    
    // Calculer les marges responsives
    const margin = {
      top: Math.max(height * 0.05, 40),
      right: Math.max(width * 0.18, 180),
      bottom: Math.max(height * 0.05, 40),
      left: Math.max(width * 0.22, 220)
    };

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();

    // Définir les gradients avec des couleurs Apple 2024
    const defs = svg.append('defs');

    // Gradient pour les liens
    const linkGradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');

    linkGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#94a3b8')
      .attr('stop-opacity', '0.4');

    linkGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#64748b')
      .attr('stop-opacity', '0.4');

    // Gradient pour le bouton style Apple
    const buttonGradient = defs.append('linearGradient')
      .attr('id', 'button-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    buttonGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0ea5e9');

    buttonGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0284c7');

    // Configuration du diagramme Sankey avec des dimensions responsives
    const sankeyGenerator = sankey()
      .nodeWidth(Math.max(width * 0.02, 35))
      .nodePadding(Math.max(height * 0.03, 25))
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom]
      ]);

    // Générer le layout
    const { nodes, links } = sankeyGenerator({
      nodes: processedData.nodes.map(d => ({ ...d })),
      links: processedData.links.map(d => ({ ...d }))
    });

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left * 0.15},${margin.top})`);

    // Dessiner les liens avec style amélioré
    const link = g.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', 'url(#link-gradient)')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', d => Math.max(3, d.width))
      .style('mix-blend-mode', 'multiply')
      .style('transition', 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)');

    // Effet de survol des liens amélioré
    link.on('mouseover', function() {
      d3.select(this)
        .attr('stroke-opacity', 0.8)
        .attr('stroke-width', d => Math.max(6, d.width))
        .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', d => Math.max(3, d.width))
        .style('filter', 'none');
    });

    // Dessiner les nœuds avec tooltips
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Rectangle des nœuds avec style moderne
    const nodeRect = node.append('rect')
      .attr('height', d => Math.max(d.y1 - d.y0, Math.min(height * 0.06, 45)))
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => getColorByCategory(d.category || ''))
      .attr('opacity', 0.85)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('cursor', d => d.category === 'workshop' ? 'pointer' : 'default')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.03))')
      .style('transition', 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)');

    // Gestion des tooltips et effets de survol
    const showTooltip = (event: MouseEvent, d: any) => {
      const tooltipContent = `
        <div class="font-medium text-gray-900">${d.name}</div>
        <div class="text-sm text-gray-600">${d.category}</div>
      `;
      
      tooltip
        .style('opacity', 1)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 28}px`)
        .html(tooltipContent);
    };

    const hideTooltip = () => {
      tooltip.style('opacity', 0);
    };

    nodeRect
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.95)
          .style('filter', 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))');
        showTooltip(event, d);
      })
      .on('mousemove', function(event, d) {
        showTooltip(event, d);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.85)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.03))');
        hideTooltip();
      })
      .on('click', (event, d) => {
        if (view === 'overview' && d.category === 'workshop') {
          setSelectedWorkshop(d.id);
          setView('detail');
        }
      });

    // Texte des nœuds avec style amélioré
    const fontSize = Math.max(Math.min(width * 0.014, 16), 13); // Taille de police augmentée
    node.append('text')
      .attr('x', d => d.x0 < width / 2 ? (d.x1 - d.x0 + 16) : -16) // Plus d'espace pour le texte
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.name)
      .style('font-size', `${fontSize}px`)
      .style('font-weight', '500')
      .style('fill', '#1a202c') // Couleur plus foncée pour un meilleur contraste
      .style('font-family', '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif')
      .style('letter-spacing', '0.01em') // Meilleur espacement des lettres
      .style('text-rendering', 'optimizeLegibility') // Amélioration du rendu du texte
      .style('text-shadow', '0 1px 2px rgba(255, 255, 255, 0.8)'); // Ombre légère pour améliorer la lisibilité

  }, [processedData, view, selectedWorkshop, dimensions]);

  // Composant Breadcrumb amélioré
  const Breadcrumb = () => {
    const selectedNode = data.nodes.find(n => n.id === selectedWorkshop);
    const parentNode = selectedNode ? data.nodes.find(n => 
      data.links.some(l => l.source === n.id && l.target === selectedNode.id)
    ) : null;

    const handleNavigation = (nodeId: string | null) => {
      setSelectedWorkshop(nodeId);
      setView(nodeId ? 'detail' : 'overview');
    };

    const BreadcrumbItem = ({ 
      node, 
      isActive = false, 
      isClickable = true,
      showArrow = true 
    }) => (
      <>
        <button
          onClick={() => isClickable && handleNavigation(node?.id || null)}
          className={`
            flex items-center px-3 py-1.5 rounded-lg transition-all duration-200
            ${isClickable ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'}
            ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'}
          `}
        >
          {node?.name || 'Vue générale'}
        </button>
        {showArrow && (
          <svg 
            className="w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        )}
      </>
    );

    return (
      <div className="absolute top-4 left-6 flex items-center space-x-2 font-medium z-10">
        <BreadcrumbItem 
          node={null}
          isActive={view === 'overview'}
          showArrow={!!selectedNode}
        />
        
        {parentNode && (
          <BreadcrumbItem 
            node={parentNode}
            isActive={false}
            showArrow={true}
          />
        )}
        
        {selectedNode && (
          <BreadcrumbItem 
            node={selectedNode}
            isActive={true}
            isClickable={false}
            showArrow={false}
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="relative w-full h-[800px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.03)] flex items-center justify-center overflow-hidden"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <Breadcrumb />
        <svg ref={svgRef} className="w-full h-full" style={{ maxHeight: '100%', maxWidth: '100%' }} />
      </div>
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-200 opacity-0 z-50"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      />
    </div>
  );
}; 