'use client';

import React, { useState } from 'react';
import { DateRange } from "react-day-picker";
import { TemplateHeader } from "@/components/layout/TemplateHeader";
import { EnergyChart } from "@/components/ui/energy-chart";
import { EnergyStatCard } from "@/components/ui/energy-stat-card";
import { EnergyLayout } from "@/components/ui/energy-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Flame, 
  Droplets, 
  Wind,
  TrendingUp,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

// Configuration des champs d'énergie pour les graphiques
const energyFields = [
  { key: 'elec', name: 'Électricité', color: 'hsl(var(--energy-electric))', Icon: Zap },
  { key: 'gaz', name: 'Gaz', color: 'hsl(var(--energy-gas))', Icon: Flame },
  { key: 'eau', name: 'Eau', color: 'hsl(var(--energy-water))', Icon: Droplets },
  { key: 'air', name: 'Air', color: 'hsl(var(--energy-air))', Icon: Wind }
];

export default function GlobalViewPage() {
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<string[]>(['elec', 'gaz', 'eau', 'air']);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [activeTab, setActiveTab] = useState('realtime');

  // Données pour les stats rapides
  const quickStats = [
    { 
      title: 'Consommation Totale', 
      value: '2,450 kWh', 
      change: '+12.5%', 
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Par rapport à la semaine dernière'
    },
    { 
      title: 'Coût Total', 
      value: '3,250 €', 
      change: '+8.2%', 
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Sur la période sélectionnée'
    },
    { 
      title: 'Efficacité', 
      value: '92%', 
      change: '+2.1%', 
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Performance énergétique'
    },
    { 
      title: 'Alertes', 
      value: '3', 
      change: 'Nouveau', 
      trend: 'warning',
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Points d\'attention'
    },
  ];

  return (
    <EnergyLayout>
      <div className="space-y-6">
        {/* En-tête amélioré */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Vue Globale</h1>
              <div className="text-blue-100 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, "d MMMM yyyy", { locale: fr })} - ${format(
                        dateRange.to,
                        "d MMMM yyyy",
                        { locale: fr }
                      )}`
                    : "Sélectionnez une période"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className={cn(
                    "text-sm flex items-center gap-1",
                    stat.trend === "up" ? "text-green-400" : "text-yellow-400"
                  )}>
                    {stat.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-sm text-blue-100 mb-1">{stat.title}</h3>
                <p className="text-xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-blue-200">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Consommation d'énergie</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Évolution de la consommation par type d'énergie
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Tabs defaultValue="realtime" className="w-auto" onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="realtime" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Temps réel
                      </TabsTrigger>
                      <TabsTrigger value="history" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Historique
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <EnergyChart
                  data={energyData}
                  fields={energyFields}
                  selectedFields={selectedEnergyTypes}
                  onFieldToggle={(field) => {
                    setSelectedEnergyTypes((prev) =>
                      prev.includes(field)
                        ? prev.filter((f) => f !== field)
                        : [...prev, field]
                    );
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Métriques d'efficacité */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribution d'énergie</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Répartition par type d'énergie
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques d'efficacité</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Performance par type d'énergie
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {energyFields.map((field) => (
                    <div key={field.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <field.Icon className={`h-4 w-4 ${field.color}`} />
                        <span className="text-sm font-medium">{field.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">92%</p>
                        <p className="text-xs text-muted-foreground">+2.1% vs semaine dernière</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section des alertes et recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertes récentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Points d'attention sur votre consommation
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((alert) => (
                  <div key={alert} className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Pic de consommation détecté</h4>
                      <p className="text-sm text-muted-foreground">
                        La consommation d'électricité a dépassé le seuil de 200 kWh
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600">
                        <Clock className="h-3 w-3" />
                        <span>Il y a 2 heures</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Optimisez votre consommation d'énergie
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((rec) => (
                  <div key={rec} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Optimisation possible</h4>
                      <p className="text-sm text-muted-foreground">
                        Réduisez la consommation de 15% en ajustant les paramètres de production
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Voir les détails
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnergyLayout>
  );
} 