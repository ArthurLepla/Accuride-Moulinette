'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp,
  History,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EnergyPrice {
  id: string;
  type: string;
  price: number;
  unit: string;
  startDate: Date;
  endDate?: Date;
}

interface EnergyPriceManagerProps {
  title: string;
  description?: string;
  onPriceSubmit: (price: Omit<EnergyPrice, 'id'>) => void;
  onPriceDelete: (id: string) => void;
  energyTypes: { key: string; name: string; unit: string }[];
}

export function EnergyPriceManager({
  title,
  description,
  onPriceSubmit,
  onPriceDelete,
  energyTypes
}: EnergyPriceManagerProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  const handleSubmit = () => {
    if (!selectedType) {
      setError("Veuillez sélectionner un type d'énergie");
      return;
    }

    if (!price || isNaN(Number(price))) {
      setError("Veuillez entrer un prix valide");
      return;
    }

    const energyType = energyTypes.find(type => type.key === selectedType);
    if (!energyType) return;

    onPriceSubmit({
      type: selectedType,
      price: Number(price),
      unit: energyType.unit,
      startDate,
      endDate
    });

    // Reset form
    setSelectedType('');
    setPrice('');
    setStartDate(new Date());
    setEndDate(undefined);
    setError(null);
    setIsDialogOpen(false);
  };

  // Example data - replace with real data from props
  const currentPrices: EnergyPrice[] = [
    {
      id: '1',
      type: 'elec',
      price: 0.174,
      unit: 'kWh',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    },
    {
      id: '2',
      type: 'gaz',
      price: 0.085,
      unit: 'm³',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    }
  ];

  const historicalPrices: EnergyPrice[] = [
    {
      id: '3',
      type: 'elec',
      price: 0.165,
      unit: 'kWh',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Price Button */}
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un prix
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau prix</DialogTitle>
                  <DialogDescription>
                    Définissez un nouveau prix pour un type d'énergie
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type d'énergie</Label>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type d'énergie" />
                      </SelectTrigger>
                      <SelectContent>
                        {energyTypes.map(type => (
                          <SelectItem key={type.key} value={type.key}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prix</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        step="0.001"
                      />
                      <span className="text-sm text-muted-foreground">
                        € / {energyTypes.find(type => type.key === selectedType)?.unit || 'unité'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Input
                      type="date"
                      value={startDate.toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin (optionnelle)</Label>
                    <Input
                      type="date"
                      value={endDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit}>
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Price Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="current">
                <TrendingUp className="w-4 h-4 mr-2" />
                Prix actuels
              </TabsTrigger>
              <TabsTrigger value="historical">
                <History className="w-4 h-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type d'énergie</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPrices.map(price => (
                      <TableRow key={price.id}>
                        <TableCell>
                          {energyTypes.find(type => type.key === price.type)?.name}
                        </TableCell>
                        <TableCell>
                          {price.price.toFixed(3)} € / {price.unit}
                        </TableCell>
                        <TableCell>
                          {price.startDate.toLocaleDateString()} - {price.endDate?.toLocaleDateString() || 'Indéfini'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onPriceDelete(price.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="historical">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type d'énergie</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Période</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalPrices.map(price => (
                      <TableRow key={price.id}>
                        <TableCell>
                          {energyTypes.find(type => type.key === price.type)?.name}
                        </TableCell>
                        <TableCell>
                          {price.price.toFixed(3)} € / {price.unit}
                        </TableCell>
                        <TableCell>
                          {price.startDate.toLocaleDateString()} - {price.endDate?.toLocaleDateString() || 'Indéfini'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
} 