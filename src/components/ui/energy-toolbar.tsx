'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  Droplets, 
  Wind, 
  Settings, 
  Calendar, 
  Download, 
  Filter, 
  Search,
  X,
  PlusCircle,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange as DayPickerDateRange } from "react-day-picker";

interface EnergyType {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

interface EnergyToolbarProps {
  onFilterChange?: (filters: any) => void;
  onDateChange?: (range: DateRange) => void;
  onEnergyTypeChange?: (types: string[]) => void;
  onSearch?: (query: string) => void;
  onExport?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

export function EnergyToolbar({
  onFilterChange,
  onDateChange,
  onEnergyTypeChange,
  onSearch,
  onExport,
  onSettingsClick,
  className
}: EnergyToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedView, setSelectedView] = useState('day');
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<string[]>(['elec', 'gaz', 'eau', 'air']);
  const [mounted, setMounted] = useState(false);
  
  // S'assurer que le composant est monté avant d'afficher des éléments interactifs
  // pour éviter des problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Définition des types d'énergie
  const energyTypes: EnergyType[] = [
    { key: 'elec', name: 'Électricité', icon: <Zap className="w-4 h-4" />, color: 'bg-energy-electric text-energy-electric' },
    { key: 'gaz', name: 'Gaz', icon: <Flame className="w-4 h-4" />, color: 'bg-energy-gas text-energy-gas' },
    { key: 'eau', name: 'Eau', icon: <Droplets className="w-4 h-4" />, color: 'bg-energy-water text-energy-water' },
    { key: 'air', name: 'Air', icon: <Wind className="w-4 h-4" />, color: 'bg-energy-air text-energy-air' },
  ];
  
  // Options de périodes
  const viewOptions = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'year', label: 'Année' },
    { value: 'custom', label: 'Personnalisé' },
  ];
  
  // Gérer les changements de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };
  
  // Gérer les changements de filtre
  const handleFilterToggle = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    
    setActiveFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };
  
  // Gérer les changements de type d'énergie
  const handleEnergyTypeToggle = (type: string) => {
    const newTypes = selectedEnergyTypes.includes(type)
      ? selectedEnergyTypes.filter(t => t !== type)
      : [...selectedEnergyTypes, type];
    
    setSelectedEnergyTypes(newTypes);
    if (onEnergyTypeChange) onEnergyTypeChange(newTypes);
  };
  
  // Gérer les changements de date
  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
    if (onDateChange) onDateChange(range);
  };
  
  // Gérer les changements de vue
  const handleViewChange = (view: string) => {
    setSelectedView(view);
    // Logique pour définir la plage de dates en fonction de la vue
    const now = new Date();
    let newRange: DateRange = {};
    
    if (view === 'day') {
      newRange = { from: now, to: now };
    } else if (view === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      newRange = { from: startOfWeek, to: endOfWeek };
    } else if (view === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      newRange = { from: startOfMonth, to: endOfMonth };
    } else if (view === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      newRange = { from: startOfYear, to: endOfYear };
    }
    
    if (view !== 'custom') {
      setDateRange(newRange);
      if (onDateChange) onDateChange(newRange);
    }
  };
  
  // Formater l'affichage de la plage de dates
  const formatDateDisplay = () => {
    if (!dateRange.from) return 'Sélectionner';
    
    if (dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime()) {
      return `${format(dateRange.from, 'dd/MM', { locale: fr })} - ${format(dateRange.to, 'dd/MM', { locale: fr })}`;
    }
    
    return format(dateRange.from, 'dd MMM', { locale: fr });
  };
  
  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveFilters([]);
    setSelectedEnergyTypes(['elec', 'gaz', 'eau', 'air']);
    
    if (onSearch) onSearch('');
    if (onFilterChange) onFilterChange([]);
    if (onEnergyTypeChange) onEnergyTypeChange(['elec', 'gaz', 'eau', 'air']);
  };
  
  if (!mounted) {
    return <div className="w-full h-12 bg-card border border-border rounded-lg animate-pulse"></div>;
  }
  
  return (
    <div className={cn("w-full bg-card border border-border rounded-lg p-3 shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Barre de recherche */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8 h-9"
          />
          {searchQuery && (
            <button 
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchQuery('');
                if (onSearch) onSearch('');
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Filtres */}
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <Filter className="w-4 h-4" />
                    Filtres
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 min-w-[20px] text-xs rounded-full">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <div>Filtrer les données</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end" className="w-[220px]">
            <div className="p-2 border-b">
              <h4 className="text-sm font-medium mb-2">Types d'énergie</h4>
              <div className="flex flex-wrap gap-1">
                {energyTypes.map(type => (
                  <Button
                    key={type.key}
                    variant={selectedEnergyTypes.includes(type.key) ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => handleEnergyTypeToggle(type.key)}
                  >
                    <div className={selectedEnergyTypes.includes(type.key) ? type.color : "text-muted-foreground"}>
                      {type.icon}
                    </div>
                    {type.name}
                  </Button>
                ))}
              </div>
            </div>
            <DropdownMenuItem onClick={() => handleFilterToggle('critical')}>
              <div className="flex items-center w-full justify-between">
                <span>Critique</span>
                {activeFilters.includes('critical') && <span className="text-primary">✓</span>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterToggle('warning')}>
              <div className="flex items-center w-full justify-between">
                <span>Avertissement</span>
                {activeFilters.includes('warning') && <span className="text-primary">✓</span>}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterToggle('anomaly')}>
              <div className="flex items-center w-full justify-between">
                <span>Anomalie</span>
                {activeFilters.includes('anomaly') && <span className="text-primary">✓</span>}
              </div>
            </DropdownMenuItem>
            {(activeFilters.length > 0 || selectedEnergyTypes.length < 4) && (
              <div className="p-2 border-t mt-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs h-7"
                  onClick={resetAllFilters}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sélection de la période */}
        <Select value={selectedView} onValueChange={handleViewChange}>
          <SelectTrigger className="h-9 w-[100px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            {viewOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Sélecteur de dates */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 md:min-w-[110px] max-w-[110px] truncate">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDateDisplay()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="range"
              selected={dateRange as DayPickerDateRange}
              onSelect={handleDateChange as any}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {/* Boutons d'action */}
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={onExport}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div>Exporter les données</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={onSettingsClick}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div>Paramètres</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Filtres actifs */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map(filter => (
            <Badge 
              key={filter} 
              variant="secondary"
              className="flex items-center gap-1 py-1"
            >
              {filter}
              <button 
                className="ml-1 rounded-full hover:bg-muted p-0.5"
                onClick={() => handleFilterToggle(filter)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {activeFilters.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs py-0 px-2"
              onClick={() => {
                setActiveFilters([]);
                if (onFilterChange) onFilterChange([]);
              }}
            >
              Effacer tout
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 