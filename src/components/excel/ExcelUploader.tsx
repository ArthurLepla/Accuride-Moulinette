"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Card } from "flowbite-react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { processExcelData, validateExcelData, previewImportStructure } from "@/lib/excel-processor";

interface ExcelUploaderProps {
  onDataLoaded: (data: ProcessedData, rawData: any[]) => void;
  onError?: (errors: string[]) => void;
}

export function ExcelUploader({ onDataLoaded, onError }: ExcelUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          console.log("Lecture de la feuille Excel:", sheetName);
          console.log("Structure de la feuille:", worksheet);

          // Convertir en JSON en gardant les en-têtes originaux
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true, // Changé à true pour conserver les types de données
            defval: "",
          });

          console.log("Données JSON brutes:", jsonData);
          resolve(jsonData);
        } catch (error) {
          console.error("Erreur lors de la lecture:", error);
          reject(new Error("Erreur lors de la lecture du fichier Excel. Vérifiez le format du fichier."));
        }
      };

      reader.onerror = (error) => {
        console.error("Erreur FileReader:", error);
        reject(new Error("Erreur lors de la lecture du fichier."));
      };

      reader.readAsBinaryString(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setFileName(file.name);

      try {
        const rawData = await readExcelFile(file);
        console.log("Données brutes lues:", rawData);
        
        // Valider les données
        const validationErrors = validateExcelData(rawData);
        if (validationErrors.length > 0) {
          console.log("Erreurs de validation:", validationErrors);
        }
        
        // Traiter les données même s'il y a des erreurs de validation
        try {
          const processedData = processExcelData(rawData);
          console.log("Données traitées:", processedData);
          
          // Afficher la prévisualisation de la structure IIH
          previewImportStructure(rawData);
          
          // Si on a des données valides, on continue même s'il y a des erreurs
          if (processedData.summary.totalRows > 0) {
            // Afficher les avertissements s'il y en a
            if (validationErrors.length > 0) {
              onError?.(validationErrors);
            }
            
            onDataLoaded(processedData, rawData);
          } else {
            onError?.(["Aucune donnée valide n'a pu être extraite du fichier."]);
          }
        } catch (error) {
          console.error("Erreur lors du traitement:", error);
          onError?.([`Erreur lors du traitement : ${(error as Error).message}`]);
        }
      } catch (error) {
        console.error("Erreur lors de la lecture:", error);
        onError?.([`Erreur : ${(error as Error).message}`]);
      } finally {
        setIsLoading(false);
      }
    },
    [onDataLoaded, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? "border-slate-500 bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
          <p className="text-slate-600">Traitement du fichier...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <ArrowUpTrayIcon className="w-12 h-12 text-slate-400" />
            {fileName ? (
              <p className="text-sm text-slate-600">Fichier sélectionné : {fileName}</p>
            ) : (
              <>
                <p className="text-slate-600">
                  Glissez-déposez votre fichier Excel ici, ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-slate-500">
                  Formats acceptés : .xlsx, .xls
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 