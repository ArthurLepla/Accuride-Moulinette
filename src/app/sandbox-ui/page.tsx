'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  Flame, 
  Droplets, 
  Wind, 
  LayoutDashboard,
  Settings,
  Palette,
  LayoutGrid,
  Move,
  TrendingUp,
  AlertCircle,
  Calendar,
  Gauge,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Check,
  X,
  Info,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { motion } from 'framer-motion';
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";
import { EnergyChart } from "@/components/ui/energy-chart";
import { EnergyStatCard } from "@/components/ui/energy-stat-card";
import { EnergyAlert } from "@/components/ui/energy-alert";
import { EnergyToolbar } from "@/components/ui/energy-toolbar";

// Import des composants Energy UI
import { EnergyLayout } from "@/components/ui/energy-layout";
import { EnergyFloating } from "@/components/ui/energy-floating";
import { EnergyResizable } from "@/components/ui/energy-resizable";
import { EnergyDraggable } from "@/components/ui/energy-draggable";
import { EnergySplitPane } from "@/components/ui/energy-split-pane";
import { EnergyCollapsible } from "@/components/ui/energy-collapsible";
import { EnergyProgress } from "@/components/ui/energy-progress";
import { EnergySkeleton } from "@/components/ui/energy-skeleton";
import { EnergyTooltip } from "@/components/ui/energy-tooltip";
import { EnergyPopover } from "@/components/ui/energy-popover";
import { EnergyPortal } from "@/components/ui/energy-portal";
import { EnergyBadge } from "@/components/ui/energy-badge";

// Données de test pour les graphiques
const energyData = [
  { time: '00:00', elec: 400, gaz: 240, eau: 100, air: 80 },
  { time: '04:00', elec: 300, gaz: 139, eau: 80, air: 60 },
  { time: '08:00', elec: 200, gaz: 980, eau: 120, air: 100 },
  { time: '12:00', elec: 278, gaz: 390, eau: 150, air: 120 },
  { time: '16:00', elec: 189, gaz: 480, eau: 130, air: 100 },
  { time: '20:00', elec: 239, gaz: 380, eau: 110, air: 90 },
  { time: '24:00', elec: 349, gaz: 430, eau: 140, air: 110 },
];

const pieData = [
  { name: 'Électricité', value: 400, color: '#22c55e' },
  { name: 'Gaz', value: 300, color: '#eab308' },
  { name: 'Eau', value: 200, color: '#3b82f6' },
  { name: 'Air', value: 100, color: '#60a5fa' },
];

// Couleurs pour les différents types d'énergie
const energyColors = {
  elec: 'hsl(var(--energy-electric))', // Vert pour l'électricité
  gaz: 'hsl(var(--energy-gas))',       // Jaune foncé pour le gaz
  eau: 'hsl(var(--energy-water))',     // Bleu foncé pour l'eau
  air: 'hsl(var(--energy-air))',       // Bleu clair pour l'air
};

// Classes Tailwind pour les différents types d'énergie
const energyClasses = {
  elec: {
    bg: 'bg-energy-electric',
    text: 'text-energy-electric',
    border: 'border-energy-electric',
    gradient: 'from-emerald-500 to-green-500',
    light: 'bg-emerald-50 dark:bg-emerald-900/20',
    muted: 'text-emerald-700 dark:text-emerald-300'
  },
  gaz: {
    bg: 'bg-energy-gas',
    text: 'text-energy-gas',
    border: 'border-energy-gas',
    gradient: 'from-amber-500 to-yellow-500',
    light: 'bg-amber-50 dark:bg-amber-900/20',
    muted: 'text-amber-700 dark:text-amber-300'
  },
  eau: {
    bg: 'bg-energy-water',
    text: 'text-energy-water',
    border: 'border-energy-water',
    gradient: 'from-blue-600 to-indigo-500',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    muted: 'text-blue-700 dark:text-blue-300'
  },
  air: {
    bg: 'bg-energy-air', 
    text: 'text-energy-air',
    border: 'border-energy-air',
    gradient: 'from-sky-400 to-blue-400',
    light: 'bg-sky-50 dark:bg-sky-900/20',
    muted: 'text-sky-700 dark:text-sky-300'
  }
};

// Icônes pour les différents types d'énergie
const energyIcons = {
  elec: <Zap className="w-5 h-5" />,
  gaz: <Flame className="w-5 h-5" />,
  eau: <Droplets className="w-5 h-5" />,
  air: <Wind className="w-5 h-5" />,
};

export default function SandboxUIPage() {
  const [activeTab, setActiveTab] = useState('mantine');
  const [date, setDate] = useState<Date>();
  const [selectedEnergy, setSelectedEnergy] = useState<string>("elec");
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [highlightedEnergy, setHighlightedEnergy] = useState<string | null>(null);

  // Données pour les stats rapides
  const quickStats = [
    { 
      name: 'Électricité', 
      value: '320 kWh', 
      change: '+8%', 
      isIncrease: true,
      icon: <Zap />,
      color: 'elec'
    },
    { 
      name: 'Gaz', 
      value: '125 m³', 
      change: '-3%', 
      isIncrease: false,
      icon: <Flame />,
      color: 'gaz'
    },
    { 
      name: 'Eau', 
      value: '75 m³', 
      change: '+2%', 
      isIncrease: true, 
      icon: <Droplets />,
      color: 'eau'
    },
    { 
      name: 'Air comprimé', 
      value: '40 PSI', 
      change: '+0%', 
      isIncrease: false,
      icon: <Wind />,
      color: 'air'
    }
  ];

  // Fonction pour mettre en évidence un type d'énergie sur les graphiques
  const handleEnergyHover = (type: string | null) => {
    setHighlightedEnergy(type);
  };

  // Formater les valeurs des graphiques avec les unités appropriées
  const formatEnergyValue = (value: number, key: string) => {
    if (key === 'elec') return `${value} kWh`;
    if (key === 'gaz') return `${value} m³`;
    if (key === 'eau') return `${value} L`;
    if (key === 'air') return `${value} PSI`;
    return `${value}`;
  };

  // Configuration des champs d'énergie pour les graphiques
  const energyFields = [
    { key: 'elec', name: 'Électricité', color: energyColors.elec, icon: energyIcons.elec },
    { key: 'gaz', name: 'Gaz', color: energyColors.gaz, icon: energyIcons.gaz },
    { key: 'eau', name: 'Eau', color: energyColors.eau, icon: energyIcons.eau },
    { key: 'air', name: 'Air', color: energyColors.air, icon: energyIcons.air }
  ];

  // Tendances pour les cartes stats
  const energyTrends = {
    elec: [15, 18, 12, 22, 27, 32],
    gaz: [32, 28, 25, 20, 18, 12],
    eau: [10, 12, 14, 16, 15, 18],
    air: [20, 20, 22, 20, 18, 21]
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sandbox UX UI</h1>
          <p className="text-muted-foreground max-w-2xl">
            Testez et expérimentez différentes librairies UI pour votre application Mendix. Cette interface démontre des solutions modernes pour le monitoring énergétique industriel.
            <InteractiveTooltip 
              content="Ce sandbox présente des composants réutilisables optimisés pour l'intégration dans des widgets Mendix." 
              position="right"
            >
              <span className="inline-flex items-center ml-1 text-primary cursor-help">
                <Info className="w-4 h-4" />
              </span>
            </InteractiveTooltip>
          </p>
        </div>

        <Tabs defaultValue="mantine" className="space-y-6">
          <TabsList className="bg-background border shadow-sm mb-2">
            <TabsTrigger value="mantine" className="data-[state=active]:bg-primary/10">
              <Palette className="w-4 h-4 mr-2" />
              Mantine
            </TabsTrigger>
            <TabsTrigger value="shadcn" className="data-[state=active]:bg-primary/10">
              <LayoutGrid className="w-4 h-4 mr-2" />
              ShadCN & Extensions
            </TabsTrigger>
            <TabsTrigger value="floating" className="data-[state=active]:bg-primary/10">
              <Move className="w-4 h-4 mr-2" />
              Floating UI & Layout
            </TabsTrigger>
            <TabsTrigger value="others" className="data-[state=active]:bg-primary/10">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Autres Librairies
            </TabsTrigger>
            <TabsTrigger value="energy" className="data-[state=active]:bg-primary/10">
              <Sparkles className="w-4 h-4 mr-2" />
              Energy UI
            </TabsTrigger>
          </TabsList>

          {/* Section Mantine */}
          <TabsContent value="mantine" className="space-y-6 animate-fadeIn">
            {/* Barre d'outils énergétique */}
            <EnergyToolbar 
              onFilterChange={(filters) => console.log('Filtres:', filters)}
              onDateChange={(range) => console.log('Dates:', range)}
              onEnergyTypeChange={(types) => {
                console.log('Types d\'énergie:', types);
                // Filtre les types d'énergie à afficher
                if (types.length > 0) {
                  handleEnergyHover(types[0]);
                } else {
                  handleEnergyHover(null);
                }
              }}
              onSearch={(query) => console.log('Recherche:', query)}
              onExport={() => console.log('Exporter les données')}
              onSettingsClick={() => console.log('Paramètres')}
              className="animate-slide-in-bottom"
            />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {quickStats.map((stat, index) => (
                <EnergyStatCard
                  key={index}
                  title={stat.name}
                  value={stat.value}
                  change={stat.change}
                  isPositiveChange={stat.isIncrease}
                  icon={stat.icon}
                  color={stat.color === 'elec' ? 'electric' : 
                          stat.color === 'gaz' ? 'gas' : 
                          stat.color === 'eau' ? 'water' : 'air'}
                  trend={energyTrends[stat.color as keyof typeof energyTrends]}
                  className="animate-fadeIn"
                  onMouseEnter={() => handleEnergyHover(stat.color)}
                  onMouseLeave={() => handleEnergyHover(null)}
                />
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Main Content Area */}
              <div className="md:w-8/12 space-y-6">
                {/* Graphique de consommation */}
                <EnergyChart
                  title="Consommation Énergétique"
                  description="Visualisation des consommations par type d'énergie"
                  data={energyData}
                  fields={energyFields}
                  height={350}
                  chartTypes={['area', 'line', 'bar', 'pie']}
                  valueFormatter={formatEnergyValue}
                  onHighlight={handleEnergyHover}
                  className="shadow-soft border-border animate-fadeIn"
                />

                {/* Alertes et Notifications */}
                <Card className="shadow-soft overflow-hidden border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-primary" />
                          Alertes Énergétiques
                        </CardTitle>
                        <CardDescription>
                          Système de notifications pour les anomalies
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        Tout marquer comme lu
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <EnergyAlert
                        id="alert-1"
                        title="Surconsommation détectée"
                        description="Consommation électrique 20% supérieure à la moyenne des 30 derniers jours. Vérifiez les équipements du secteur 3."
                        severity="critical"
                        status="active"
                        time="il y a 14 min"
                        affectedArea="Secteur 3"
                        onDismiss={() => console.log("Alerte ignorée")}
                        onResolve={() => console.log("Alerte résolue")}
                        details={
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Consommation actuelle:</span>
                              <span className="text-sm">450 kWh</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Consommation normale:</span>
                              <span className="text-sm">375 kWh</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Date de début:</span>
                              <span className="text-sm">05/06/2023 - 10:45</span>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <Button size="sm" variant="outline" className="text-xs">Voir graphique</Button>
                            </div>
                          </div>
                        }
                      />
                      
                      <EnergyAlert
                        id="alert-2"
                        title="Anomalie de pression"
                        description="Pression d'air anormale dans le circuit principal. Vérifiez les compresseurs et les éventuelles fuites."
                        severity="warning"
                        status="active"
                        time="il y a 35 min"
                        affectedArea="Circuit principal"
                        onDismiss={() => console.log("Alerte ignorée")}
                        onResolve={() => console.log("Alerte résolue")}
                      />
                      
                      <EnergyAlert
                        id="alert-3"
                        title="Fuite d'eau détectée"
                        description="Consommation d'eau anormale dans le secteur 2. Possible fuite au niveau de la vanne principale."
                        severity="info"
                        status="resolved"
                        time="Hier"
                        userName="Jean Dupont"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="md:w-4/12 space-y-6">
                {/* Répartition des énergies */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <EnergyChart
                    title="Répartition des Énergies"
                    description="Distribution des consommations"
                    data={energyData}
                    fields={energyFields}
                    height={300}
                    chartTypes={['pie']}
                    valueFormatter={formatEnergyValue}
                    onHighlight={handleEnergyHover}
                    className="shadow-soft border-border h-full"
                  />
                </motion.div>

                {/* Calendrier et Planification */}
                <Card className="shadow-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Planification
                    </CardTitle>
                    <CardDescription>
                      Planning des maintenances
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">Prochaine maintenance</h4>
                            <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                              3 jours
                            </Badge>
                          </div>
                          <p className="text-base font-medium mt-1">Filtres à air</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
                              <span className="text-amber-700 text-xs font-bold">JD</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Assigné à Jean Dupont</span>
                          </div>
                        </div>
                        
                        <div className="bg-card border border-border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground">Dernière maintenance</h4>
                            <Badge variant="outline" className="bg-background text-muted-foreground border-border">
                              2 semaines
                            </Badge>
                          </div>
                          <p className="text-base font-medium text-foreground mt-1">Vérification gaz</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-xs font-bold">ML</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Réalisé par Marie Lambert</span>
                          </div>
                        </div>
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Button className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Planifier une maintenance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Section ShadCN & Extensions */}
          <TabsContent value="shadcn" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formulaire de Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration des Alertes
                  </CardTitle>
                  <CardDescription>
                    Personnalisez les seuils d'alerte pour chaque type d'énergie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Type d'énergie</Label>
                    <Select value={selectedEnergy} onValueChange={setSelectedEnergy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type d'énergie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elec">Électricité</SelectItem>
                        <SelectItem value="gaz">Gaz</SelectItem>
                        <SelectItem value="eau">Eau</SelectItem>
                        <SelectItem value="air">Air</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'alerte (%)</Label>
                    <Slider 
                      defaultValue={[20]} 
                      max={100} 
                      step={5}
                      className="py-4"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">
                      Activer les notifications
                    </Label>
                  </div>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une règle
                  </Button>
                </CardContent>
              </Card>

              {/* Filtres et Recherche */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtres et Recherche
                  </CardTitle>
                  <CardDescription>
                    Recherchez et filtrez vos données énergétiques
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher..." 
                        className="pl-8"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <SlidersHorizontal className="w-4 h-4 mr-2" />
                          Filtres
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Options de filtrage</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Par date
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Zap className="w-4 h-4 mr-2" />
                          Par type d'énergie
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Électricité
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                    <Badge variant="secondary">
                      Dernière semaine
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Calendrier de Sélection */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sélection de Date
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Choisissez une période pour l'analyse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>

              {/* Dialog de Confirmation */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Actions Confirmation
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Exemples de dialogues de confirmation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Supprimer les données
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmation de suppression</DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr de vouloir supprimer ces données ? Cette action est irréversible.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">
                          Annuler
                        </Button>
                        <Button variant="destructive">
                          Supprimer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Section Floating UI & Layout */}
          <TabsContent value="floating" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tooltips Avancés */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Move className="w-5 h-5" />
                    Tooltips Avancés
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Exemples de tooltips contextuels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          Hover pour info
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium text-foreground">Information détaillée</h4>
                          <p className="text-sm text-muted-foreground">
                            Ce tooltip peut contenir des informations détaillées sur un élément.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Flottant */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    Menu Flottant
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Exemple de menu contextuel flottant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions disponibles</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Check className="w-4 h-4 mr-2" />
                        Exporter les données
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Paramètres
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Section Autres Librairies */}
          <TabsContent value="others" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* React Grid Layout */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    React Grid Layout
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Dashboard personnalisable avec grille responsive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    <div className="mb-2">Fonctionnalités :</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Grille responsive et redimensionnable</li>
                      <li>Drag & drop des widgets</li>
                      <li>Layouts sauvegardables</li>
                      <li>Optimisé pour les performances</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* React Flow */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" />
                    React Flow
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Visualisation de flux d'énergie interactif
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    <div className="mb-2">Fonctionnalités :</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Graphes de flux d'énergie</li>
                      <li>Nœuds personnalisables</li>
                      <li>Connexions dynamiques</li>
                      <li>Zoom et pan fluides</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* React Query */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    React Query
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Gestion optimisée des données et du cache
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    <div className="mb-2">Fonctionnalités :</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Mise en cache intelligente</li>
                      <li>Revalidation automatique</li>
                      <li>Gestion des états de chargement</li>
                      <li>Optimistic updates</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* React Virtualized */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <ScrollArea className="w-5 h-5" />
                    React Virtualized
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Gestion efficace des grandes listes de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground">
                    <div className="mb-2">Fonctionnalités :</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Rendu virtuel des listes</li>
                      <li>Performance optimale</li>
                      <li>Support des grilles</li>
                      <li>Gestion de la mémoire</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Section Energy UI */}
          <TabsContent value="energy" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Energy UI</h2>
              <p className="text-muted-foreground">
                Une librairie de composants UI avancés avec animations fluides, effets visuels modernes et interactions riches.
              </p>
            </div>

            {/* Floating Components */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Composants Flottants
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Des composants interactifs avec positionnement dynamique et animations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-lg font-medium">Energy Floating</h3>
                    <EnergyFloating 
                      content={
                        <div className="p-2">
                          <h4 className="font-medium mb-1">Tooltip avancé</h4>
                          <div className="text-sm">Avec contenu riche et animations</div>
                        </div>
                      }
                      position="top"
                      variant="glass"
                    >
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
                        Survolez-moi
                      </button>
                    </EnergyFloating>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-lg font-medium">Energy Tooltip</h3>
                    <EnergyTooltip
                      content="Tooltip simple avec style Energy"
                      variant="gradient"
                      color="blue"
                    >
                      <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">
                        Info rapide
                      </button>
                    </EnergyTooltip>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-lg font-medium">Energy Popover</h3>
                    <EnergyPopover
                      content={
                        <div className="p-2 w-64">
                          <h4 className="font-medium mb-1">Popover avancé</h4>
                          <div className="text-sm mb-2">Avec contenu interactif et positionnement intelligent</div>
                          <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors">
                            Action
                          </button>
                        </div>
                      }
                      variant="glass"
                    >
                      <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors">
                        Cliquez-moi
                      </button>
                    </EnergyPopover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Components */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  Composants de Layout
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Des layouts flexibles avec animations et interactions riches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Energy Layout</h3>
                    <EnergyLayout
                      variant="default"
                      background="glass"
                      padding="md"
                      gap="md"
                      animation={true}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg"
                    >
                      <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-soft">
                        <h4 className="font-medium">Panel 1</h4>
                        <p className="text-sm text-muted-foreground">Contenu avec animation d'entrée</p>
                      </div>
                      <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-soft">
                        <h4 className="font-medium">Panel 2</h4>
                        <p className="text-sm text-muted-foreground">Contenu avec animation d'entrée</p>
                      </div>
                      <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-soft">
                        <h4 className="font-medium">Panel 3</h4>
                        <p className="text-sm text-muted-foreground">Contenu avec animation d'entrée</p>
                      </div>
                    </EnergyLayout>
                  </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Energy Resizable</h3>
                      <EnergyResizable
                        defaultWidth={300}
                        defaultHeight={200}
                        minWidth={200}
                        maxWidth={500}
                        className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-soft"
                      >
                        <div className="p-4 h-full">
                          <h4 className="font-medium">Resizable Content</h4>
                          <p className="text-sm text-muted-foreground">Redimensionnez-moi en utilisant la poignée</p>
                        </div>
                      </EnergyResizable>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Energy Split Pane</h3>
                      <EnergySplitPane 
                        direction="horizontal"
                        defaultSize={150}
                        minSize={100}
                        maxSize={300}
                        className="h-[200px] rounded-lg overflow-hidden shadow-soft"
                      >
                        <div className="bg-blue-100/80 dark:bg-blue-900/30 p-4 h-full">
                          <h4 className="font-medium">Panel Gauche</h4>
                          <p className="text-sm">Redimensionnable</p>
                        </div>
                        <div className="bg-green-100/80 dark:bg-green-900/30 p-4 h-full">
                          <h4 className="font-medium">Panel Droit</h4>
                          <p className="text-sm">Contenu flexible</p>
                        </div>
                      </EnergySplitPane>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Components */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Composants de Feedback
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Des composants pour afficher le statut, les alertes et la progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Energy Progress</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Progress Bar Standard</p>
                        <EnergyProgress 
                          value={65} 
                          max={100} 
                          variant="glass"
                          color="blue"
                          animation={true}
                          showValue={true}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Progress Bar Gradient</p>
                        <EnergyProgress 
                          value={85} 
                          max={100} 
                          variant="gradient"
                          color="green"
                          animation={true}
                          size="lg"
                          showValue={true}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Energy Alerts</h3>
                    <div className="space-y-3">
                      <EnergyAlert
                        type="info"
                        variant="glass"
                        title="Information"
                        description="Système mis à jour avec succès"
                        closable={true}
                        onClose={() => console.log('Alert closed')}
                      />
                      <EnergyAlert
                        type="warning"
                        variant="solid"
                        title="Attention"
                        description="Performance réduite détectée"
                        closable={true}
                        onClose={() => console.log('Alert closed')}
                      />
                      <EnergyAlert
                        type="error"
                        variant="glass"
                        title="Erreur Critique"
                        description="Panne détectée dans le circuit 5"
                        closable={true}
                        onClose={() => console.log('Alert closed')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Energy Skeletons</h3>
                    <EnergySkeleton className="w-full h-12 mb-2" />
                    <div className="flex gap-2">
                      <EnergySkeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <EnergySkeleton className="h-4 w-3/4" />
                        <EnergySkeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Energy Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      <EnergyBadge variant="default" color="blue">Default</EnergyBadge>
                      <EnergyBadge variant="glass" color="green">Glass</EnergyBadge>
                      <EnergyBadge variant="solid" color="red" dot={true}>Alert</EnergyBadge>
                      <EnergyBadge variant="gradient" color="purple" count={5}>Notifications</EnergyBadge>
                      <EnergyBadge variant="glass" color="yellow" pulse={true}>En cours</EnergyBadge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclosure Components */}
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <ChevronDown className="w-5 h-5 text-primary" />
                  Composants de Divulgation
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Des composants pour afficher et masquer du contenu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Energy Collapsible</h3>
                    <EnergyCollapsible
                      title="Informations sur la consommation"
                      subtitle="Détails sur les tendances récentes"
                      variant="glass"
                    >
                      <div className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg">
                        <div className="mb-2">La consommation d'énergie a diminué de 15% ce mois-ci comparé au mois précédent.</div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Mois précédent: 342 kWh</span>
                          <span>Mois actuel: 290 kWh</span>
                        </div>
                      </div>
                    </EnergyCollapsible>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Energy Draggable</h3>
                    <div className="h-[200px] bg-blue-50/50 dark:bg-blue-950/30 rounded-lg relative overflow-hidden">
                      <EnergyDraggable
                        bounds="parent"
                        className="absolute"
                      >
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg cursor-move">
                          <h4 className="font-medium">Élément Déplaçable</h4>
                          <p className="text-sm text-muted-foreground">Déplacez-moi librement</p>
                        </div>
                      </EnergyDraggable>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
} 