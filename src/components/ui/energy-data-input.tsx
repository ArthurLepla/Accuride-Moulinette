'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileSpreadsheet, 
  Trash2,
  Plus,
  X,
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
import { cn } from "@/lib/utils";

interface EnergyDataInputProps {
  title: string;
  description?: string;
  onDataSubmit: (data: any) => void;
  onFileImport: (file: File) => void;
  machines: { id: string; name: string }[];
  energyTypes: { key: string; name: string; unit: string }[];
}

export function EnergyDataInput({
  title,
  description,
  onDataSubmit,
  onFileImport,
  machines,
  energyTypes
}: EnergyDataInputProps) {
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [energyValues, setEnergyValues] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (key: string, value: string) => {
    setEnergyValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    if (!selectedMachine) {
      setError("Veuillez sélectionner une machine");
      return;
    }

    const hasEmptyValues = energyTypes.some(type => !energyValues[type.key]);
    if (hasEmptyValues) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    onDataSubmit({
      machineId: selectedMachine,
      values: energyValues
    });

    // Reset form
    setSelectedMachine('');
    setEnergyValues({});
    setError(null);
    setIsDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileImport(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
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
          {/* Import Section */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-import"
              />
              <Label
                htmlFor="file-import"
                className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-accent"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Importer un fichier</span>
              </Label>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Saisie manuelle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Saisie manuelle</DialogTitle>
                  <DialogDescription>
                    Entrez les valeurs de consommation pour la machine sélectionnée
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Machine</Label>
                    <Select
                      value={selectedMachine}
                      onValueChange={setSelectedMachine}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map(machine => (
                          <SelectItem key={machine.id} value={machine.id}>
                            {machine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {energyTypes.map(type => (
                    <div key={type.key} className="space-y-2">
                      <Label>{type.name}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={energyValues[type.key] || ''}
                          onChange={(e) => handleInputChange(type.key, e.target.value)}
                          placeholder={`Valeur en ${type.unit}`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {type.unit}
                        </span>
                      </div>
                    </div>
                  ))}
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

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  {energyTypes.map(type => (
                    <TableHead key={type.key}>{type.name}</TableHead>
                  ))}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Example data row */}
                <TableRow>
                  <TableCell>Machine 1</TableCell>
                  <TableCell>320 kWh</TableCell>
                  <TableCell>125 m³</TableCell>
                  <TableCell>75 L</TableCell>
                  <TableCell>40 PSI</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 