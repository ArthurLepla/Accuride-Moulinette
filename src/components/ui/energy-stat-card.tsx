'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnergyStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositiveChange?: boolean;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number[];
  compareValue?: string; 
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function EnergyStatCard({
  title,
  value,
  change,
  isPositiveChange,
  icon,
  color,
  subtitle,
  trend = [],
  compareValue,
  className,
  onMouseEnter,
  onMouseLeave,
}: EnergyStatCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter();
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave();
  };
  
  // Mapping des noms de couleur aux classes CSS
  const colorMap: Record<string, {bg: string, text: string, light: string, border: string}> = {
    electric: {
      bg: 'bg-energy-electric',
      text: 'text-energy-electric',
      light: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-energy-electric',
    },
    gas: {
      bg: 'bg-energy-gas',
      text: 'text-energy-gas',
      light: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-energy-gas',
    },
    water: {
      bg: 'bg-energy-water',
      text: 'text-energy-water',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-energy-water',
    },
    air: {
      bg: 'bg-energy-air',
      text: 'text-energy-air',
      light: 'bg-sky-50 dark:bg-sky-900/20',
      border: 'border-energy-air',
    },
  };
  
  // Obtenir les classes de couleur correspondantes ou utiliser des valeurs par défaut
  const colorClasses = colorMap[color] || colorMap.electric;
  
  // Générer un mini-graphique de tendance si des données sont fournies
  const renderTrendMiniChart = () => {
    if (!trend || trend.length < 2) return null;
    
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    return (
      <div className="h-8 flex items-end gap-[2px] mt-2">
        {trend.map((value, i) => {
          const height = ((value - min) / range) * 100;
          const isLast = i === trend.length - 1;
          return (
            <div 
              key={i} 
              className={cn(
                "w-1 rounded-sm transition-all duration-300",
                colorClasses.bg,
                isLast ? "opacity-100" : "opacity-60",
                isHovered ? "h-full" : ""
              )}
              style={!isHovered ? { height: `${Math.max(15, height)}%` } : {}}
            />
          );
        })}
      </div>
    );
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 h-full", 
        isHovered ? `border-2 ${colorClasses.border}` : "border",
        colorClasses.light,
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="flex items-end gap-2 mt-1">
              <p className={cn("text-2xl font-bold", colorClasses.text)}>
                {value}
              </p>
              {compareValue && (
                <p className="text-sm text-muted-foreground mb-1">
                  sur {compareValue}
                </p>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-full", colorClasses.light)}>
            <div className={cn("p-2 rounded-full text-white", colorClasses.bg)}>
              {icon}
            </div>
          </div>
        </div>
        
        {renderTrendMiniChart()}
        
        {change && (
          <div className="mt-4 flex items-center">
            <span className={cn(
              "text-xs font-medium",
              isPositiveChange ? "text-green-500" : "text-red-500"
            )}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">
              vs période précédente
            </span>
          </div>
        )}
      </div>
    </Card>
  );
} 