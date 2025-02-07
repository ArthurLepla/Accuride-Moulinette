"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExcelImporter } from '@/components/ExcelImporter';
import { ImportValidationModal } from '@/components/ImportValidationModal';
import { ExcelData } from '@/lib/types';

interface MendixGenerationStatus {
  isGenerated: boolean;
  timestamp: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [excelData, setExcelData] = useState<ExcelData[] | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [iihImportSuccess, setIihImportSuccess] = useState(false);
  const [mendixGenerated, setMendixGenerated] = useState(false);
  const [iihStructureExists, setIihStructureExists] = useState(false);

  useEffect(() => {
    // Récupérer les données du localStorage
    const storedData = localStorage.getItem('excelData');
    const iihStatus = localStorage.getItem('iihImportStatus');
    const mendixStatus = localStorage.getItem('mendixGenerationStatus');
    const iihStructure = localStorage.getItem('iihStructure');

    if (storedData) {
      setExcelData(JSON.parse(storedData));
    }
    
    if (iihStatus === 'success') {
      setIihImportSuccess(true);
    }

    if (mendixStatus) {
      setMendixGenerated(JSON.parse(mendixStatus).isGenerated);
    }

    // Vérifier si une structure IIH existe
    if (iihStructure) {
      setIihStructureExists(true);
    }
  }, []);

  const handleViewCharts = () => {
    router.push('/charts');
  };

  const handleShowValidation = () => {
    setShowValidationModal(true);
  };

  const handleGenerateMendixCode = () => {
    router.push('/mendix-generator');
  };

  const handleReset = () => {
    localStorage.removeItem('excelData');
    localStorage.removeItem('iihImportStatus');
    localStorage.removeItem('mendixGenerationStatus');
    localStorage.removeItem('iihAssetsData');
    setExcelData(null);
    setIihImportSuccess(false);
    setMendixGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 text-center">
        <h1 className="text-2xl font-bold text-white">
          IIH Asset Explorer
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        {!excelData ? (
          <div className="w-full max-w-2xl">
            <ExcelImporter />
            {iihStructureExists && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleGenerateMendixCode}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <span>Générer le code Mendix</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 w-full">
              <button
                onClick={handleViewCharts}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold min-w-[200px]"
              >
                Voir les graphiques
              </button>
              
              {!iihImportSuccess && (
                <button
                  onClick={handleShowValidation}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold min-w-[200px]"
                >
                  Valider et importer vers IIH
                </button>
              )}
              
              {iihImportSuccess && !mendixGenerated && (
                <button
                  onClick={handleGenerateMendixCode}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <span>Générer le code Mendix</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
              )}
              
              {mendixGenerated && (
                <button
                  onClick={handleGenerateMendixCode}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 min-w-[200px]"
                >
                  <span>Voir le code Mendix</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-gray-300 flex items-center gap-2 mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Importer un nouveau fichier</span>
            </button>
          </div>
        )}
      </main>

      {/* Import Validation Modal */}
      {showValidationModal && excelData && (
        <ImportValidationModal
          isOpen={showValidationModal}
          onClose={() => setShowValidationModal(false)}
          data={excelData}
          onImportSuccess={() => {
            setIihImportSuccess(true);
            setShowValidationModal(false);
          }}
        />
      )}
    </div>
  );
} 