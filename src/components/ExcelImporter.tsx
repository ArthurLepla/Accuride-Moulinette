import { useState } from 'react';
import * as XLSX from 'xlsx';
import { ExcelData } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

export function ExcelImporter() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Debug des données brutes
          console.log('Données Excel brutes:', jsonData);

          // Transformer les données en format attendu
          const processedData = new Map();
          
          jsonData.forEach((row: any) => {
            console.log('Traitement de la ligne Excel:', row);
            const key = `${row.Secteur}-${row.Atelier || ''}-${row.Machine}`;
            if (!processedData.has(key)) {
              processedData.set(key, {
                sector: row.Secteur,
                workshop: row.Atelier || null,
                machine: row.Machine,
                type: row.Type,
                variables: row.Variables ? JSON.parse(row.Variables) : undefined,
              });
            }
          });

          // Debug des données transformées
          console.log('Données transformées:', Array.from(processedData.values()));

          // Convertir la Map en tableau et éliminer les doublons
          const assets = Array.from(processedData.values());

          // Sauvegarder dans le localStorage
          localStorage.setItem('excelData', JSON.stringify(assets));

          toast({
            title: "Succès",
            description: "Fichier Excel importé avec succès",
            type: "success"
          });

          // Recharger la page pour mettre à jour l'interface
          window.location.reload();
        } catch (error) {
          console.error('Erreur lors du traitement du fichier:', error);
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors du traitement du fichier",
            type: "error"
          });
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload du fichier",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold text-white">Importer des assets depuis Excel</h2>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="excel-upload"
          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Chargement...' : 'Sélectionner un fichier Excel'}
        </label>
      </div>
      <p className="text-sm text-gray-400">
        Format attendu: fichier Excel avec les colonnes Secteur, Atelier, Machine, Type (Elec, Gaz, Air, Eau) et Variables (JSON)
      </p>
    </div>
  );
} 