'use client';

import React, { useState } from 'react';
import { DateRange } from "react-day-picker";
import { TemplateHeader } from "@/components/layout/TemplateHeader";
import { EnergyDataInput } from "@/components/ui/energy-data-input";
import { EnergyPriceManager } from "@/components/ui/energy-price-manager";
import { EnergyLayout } from "@/components/ui/energy-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Flame, 
  Droplets, 
  Wind,
  Upload,
  FileSpreadsheet,
  Info,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Données de test
const machines = [
  { id: '1', name: 'Machine 1' },
  { id: '2', name: 'Machine 2' },
  { id: '3', name: 'Machine 3' },
  { id: '4', name: 'Machine 4' },
];

const energyTypes = [
  { id: 'elec', name: 'Électricité', unit: 'kWh', color: 'text-energy-electric', icon: Zap },
  { id: 'gaz', name: 'Gaz', unit: 'm³', color: 'text-energy-gas', icon: Flame },
  { id: 'eau', name: 'Eau', unit: 'm³', color: 'text-energy-water', icon: Droplets },
  { id: 'air', name: 'Air', unit: 'm³', color: 'text-energy-air', icon: Wind }
];

export default function ProductionEntryPage() {
  const [selectedEnergyTypes, setSelectedEnergyTypes] = useState<string[]>(['elec', 'gaz', 'eau', 'air']);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [activeTab, setActiveTab] = useState('production');

  const handleEnergyDataSubmit = (data: any) => {
    console.log('Données d\'énergie soumises:', data);
    // TODO: Implémenter la soumission des données
  };

  const handleFileImport = (file: File) => {
    console.log('Fichier importé:', file);
    // TODO: Implémenter l'import de fichier
  };

  const handlePriceSubmit = (data: any) => {
    console.log('Prix soumis:', data);
    // TODO: Implémenter la soumission des prix
  };

  return (
    <EnergyLayout>
      <div className="space-y-6">
        {/* En-tête amélioré */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Saisie Production</h1>
              <div className="text-blue-100 flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Enregistrez vos données de consommation d'énergie</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20">
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <Tabs defaultValue="production" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Production
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Prix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="production" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saisie des données</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Enregistrez les consommations d'énergie par machine
                </p>
              </CardHeader>
              <CardContent>
                <EnergyDataInput
                  title="Données de consommation"
                  description="Saisissez les valeurs de consommation pour chaque machine"
                  onSubmit={handleEnergyDataSubmit}
                  onFileImport={handleFileImport}
                  machines={machines}
                  energyTypes={energyTypes}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format CSV</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Structure du fichier pour l'import automatique
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <FileSpreadsheet className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Format attendu</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Le fichier CSV doit contenir les colonnes suivantes :
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• machine_id : Identifiant de la machine</li>
                        <li>• timestamp : Date et heure de la mesure</li>
                        <li>• energy_type : Type d'énergie (elec, gaz, eau, air)</li>
                        <li>• value : Valeur de consommation</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Points d'attention</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assurez-vous que :
                      </p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Les valeurs sont numériques et positives</li>
                        <li>• Les dates sont au format ISO 8601</li>
                        <li>• Les types d'énergie correspondent aux valeurs autorisées</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des prix</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Définissez les prix des différentes énergies
                </p>
              </CardHeader>
              <CardContent>
                <EnergyPriceManager
                  onSubmit={handlePriceSubmit}
                  energyTypes={energyTypes}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnergyLayout>
  );
} 