'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, Legend, Sector
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Zap, Flame, Droplets, Wind, TrendingUp, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface EnergyData {
  time: string;
  [key: string]: string | number;
}

interface EnergyField {
  key: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export interface EnergyChartProps {
  title: string;
  description?: string;
  data: EnergyData[];
  fields: EnergyField[];
  className?: string;
  height?: number;
  chartTypes?: ('area' | 'line' | 'bar' | 'pie')[];
  timeKey?: string;
  allowComparison?: boolean;
  valueFormatter?: (value: number, key: string) => string;
  onHighlight?: (key: string | null) => void;
}

// Composant d'infobulle personnalisée
const CustomTooltip = ({ active, payload, label, fields, valueFormatter }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="glass p-3 rounded-lg shadow-soft border border-border max-w-[250px]"
    >
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const field = fields.find((f: EnergyField) => f.key === entry.dataKey);
          if (!field) return null;
          
          const value = valueFormatter 
            ? valueFormatter(entry.value, entry.dataKey) 
            : `${entry.value}`;
            
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-sm font-medium">{field.name}:</span>
              <span className="text-sm">{value}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Secteur actif pour le graphique en camembert
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, name
  } = props;

  // Formater le pourcentage pour n'afficher qu'une décimale
  const formattedPercent = (percent * 100).toFixed(1);

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        strokeWidth={2}
        stroke="hsl(var(--background))"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="hsl(var(--foreground))">
        {name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="bold">
        {value}
      </text>
      <text x={cx} y={cy} dy={25} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
        {`${formattedPercent}%`}
      </text>
    </g>
  );
};

export function EnergyChart({
  title,
  description,
  data,
  fields,
  className,
  height = 350,
  chartTypes = ['area', 'bar', 'pie'],
  timeKey = 'time',
  allowComparison = false,
  valueFormatter = (value, key) => `${Number(value).toFixed(1)}`,
  onHighlight,
}: EnergyChartProps) {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar' | 'pie'>(chartTypes[0]);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  
  // Préparer les données pour le graphique en camembert
  const pieData = fields.map(field => ({
    name: field.name,
    value: data.reduce((acc, curr) => acc + (Number(curr[field.key]) || 0), 0) / data.length,
    color: field.color
  }));
  
  // Gérer la mise en évidence
  const handleHighlight = useCallback((key: string | null) => {
    setHighlightedField(key);
    if (onHighlight) {
      onHighlight(key);
    }
  }, [onHighlight]);
  
  // Animation pour passer d'un secteur du camembert à l'autre
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimationPlaying && chartType === 'pie') {
      timer = setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % fields.length);
      }, 1500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAnimationPlaying, activeIndex, fields.length, chartType]);
  
  // Gestion du clic sur un secteur du camembert
  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
    setIsAnimationPlaying(false);
    
    // Mettre en évidence le champ correspondant
    const field = fields[index];
    if (field) handleHighlight(field.key);
  }, [fields, handleHighlight]);
  
  // S'assurer que l'état est réinitialisé lorsque le type de graphique change
  useEffect(() => {
    setHighlightedField(null);
    setIsAnimationPlaying(false);
  }, [chartType]);
  
  return (
    <Card className={cn("overflow-hidden border-border", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {title}
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-6 h-6 ml-1 rounded-full"
                onClick={() => setIsInfoVisible(!isInfoVisible)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
            <AnimatePresence>
              {isInfoVisible && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 p-2 bg-background/50 border border-border rounded-md text-xs text-muted-foreground"
                >
                  <div>Ce graphique montre la consommation énergétique par type. Survolez les éléments pour plus de détails ou cliquez sur les légendes pour filtrer.</div>
                  <div className="mt-1">Données mises à jour toutes les 15 minutes.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <TabsList className="bg-background border shadow-sm">
                {chartTypes.includes('area') && (
                  <TabsTrigger value="area" className="text-xs data-[state=active]:bg-primary/10">
                    Aire
                  </TabsTrigger>
                )}
                {chartTypes.includes('line') && (
                  <TabsTrigger value="line" className="text-xs data-[state=active]:bg-primary/10">
                    Ligne
                  </TabsTrigger>
                )}
                {chartTypes.includes('bar') && (
                  <TabsTrigger value="bar" className="text-xs data-[state=active]:bg-primary/10">
                    Barres
                  </TabsTrigger>
                )}
                {chartTypes.includes('pie') && (
                  <TabsTrigger value="pie" className="text-xs data-[state=active]:bg-primary/10">
                    Camembert
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
            
            {chartType === 'pie' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
              >
                {isAnimationPlaying ? 'Pause' : 'Animer'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {fields.map((field) => (
            <motion.div 
              key={field.key} 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all",
                highlightedField === field.key ? "bg-accent" : "hover:bg-accent/50",
                highlightedField && highlightedField !== field.key ? "opacity-50" : "opacity-100"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleHighlight(highlightedField === field.key ? null : field.key)}
              onMouseEnter={() => handleHighlight(field.key)}
              onMouseLeave={() => handleHighlight(null)}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: field.color }}></div>
              <span className="text-sm font-medium">{field.name}</span>
            </motion.div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div style={{ height: `${height}px` }}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={chartType} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {(chartType === 'area' || chartType === 'line') && (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                      <defs>
                        {fields.map((field) => (
                          <linearGradient key={field.key} id={`gradient-${field.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={field.color} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={field.color} stopOpacity={0}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                      <XAxis 
                        dataKey={timeKey} 
                        className="text-muted-foreground text-xs"
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                      />
                      <YAxis 
                        className="text-muted-foreground text-xs" 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                        tickFormatter={(value) => valueFormatter(value, '')}
                      />
                      <Tooltip 
                        content={<CustomTooltip fields={fields} valueFormatter={valueFormatter} />}
                        cursor={{ stroke: 'hsl(var(--muted))' }}
                      />
                      {fields.map((field) => (
                        <Area
                          key={field.key}
                          type="monotone"
                          dataKey={field.key}
                          stroke={field.color}
                          fill={`url(#gradient-${field.key})`}
                          strokeWidth={highlightedField === field.key ? 3 : 2}
                          style={{
                            opacity: highlightedField === null || highlightedField === field.key ? 1 : 0.3,
                            transition: 'opacity 0.2s, stroke-width 0.2s'
                          }}
                        />
                      ))}
                    </AreaChart>
                  ) : (
                    <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                      <XAxis 
                        dataKey={timeKey} 
                        className="text-muted-foreground text-xs"
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                      />
                      <YAxis 
                        className="text-muted-foreground text-xs" 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                        tickFormatter={(value) => valueFormatter(value, '')}
                      />
                      <Tooltip 
                        content={<CustomTooltip fields={fields} valueFormatter={valueFormatter} />}
                        cursor={{ stroke: 'hsl(var(--muted))' }}
                      />
                      {fields.map((field) => (
                        <Line
                          key={field.key}
                          type="monotone"
                          dataKey={field.key}
                          stroke={field.color}
                          strokeWidth={highlightedField === field.key ? 3 : 2}
                          dot={{ fill: field.color, r: 4, strokeWidth: 0 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          style={{
                            opacity: highlightedField === null || highlightedField === field.key ? 1 : 0.3,
                            transition: 'opacity 0.2s, stroke-width 0.2s'
                          }}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
              
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-30" />
                    <XAxis 
                      dataKey={timeKey} 
                      className="text-muted-foreground text-xs"
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      className="text-muted-foreground text-xs" 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                      tickFormatter={(value) => valueFormatter(value, '')}
                    />
                    <Tooltip 
                      content={<CustomTooltip fields={fields} valueFormatter={valueFormatter} />}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    />
                    {fields.map((field) => (
                      <Bar
                        key={field.key}
                        dataKey={field.key}
                        fill={field.color}
                        radius={[4, 4, 0, 0]}
                        style={{
                          opacity: highlightedField === null || highlightedField === field.key ? 1 : 0.3,
                          transition: 'opacity 0.2s'
                        }}
                      >
                        {data.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={field.color} 
                            fillOpacity={highlightedField === field.key ? 1 : 0.8} 
                          />
                        ))}
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={() => {
                        // Réinitialiser l'état lorsque la souris quitte le graphique
                        if (!isAnimationPlaying) {
                          handleHighlight(null);
                        }
                      }}
                      className="cursor-pointer"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                      animationBegin={0}
                      animationDuration={600}
                      animationEasing="ease-out"
                      isAnimationActive={true}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          style={{
                            filter: index === activeIndex ? 'drop-shadow(0 0 3px rgba(0,0,0,0.2))' : 'none',
                            transition: 'filter 0.2s, opacity 0.2s',
                            opacity: highlightedField === null || 
                                    (highlightedField === fields[index]?.key) ? 1 : 0.4,
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={
                        <div className="glass p-3 rounded-lg shadow-soft border border-border">
                          <div className="text-sm font-medium mb-1">
                            {pieData[activeIndex]?.name}
                          </div>
                          <div className="text-base font-bold">
                            {valueFormatter(pieData[activeIndex]?.value || 0, fields[activeIndex]?.key || '')}
                          </div>
                        </div>
                      } 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {fields.map((field) => (
              <div 
                key={field.key} 
                className={cn(
                  "flex items-center gap-1.5 cursor-pointer",
                  highlightedField && highlightedField !== field.key ? "opacity-50" : "opacity-100"
                )}
                onClick={() => handleHighlight(highlightedField === field.key ? null : field.key)}
                onMouseEnter={() => handleHighlight(field.key)}
                onMouseLeave={() => handleHighlight(null)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: field.color }}></div>
                <span className="text-sm">{field.name}</span>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Dernière mise à jour: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 