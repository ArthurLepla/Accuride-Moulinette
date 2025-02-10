"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileInput, GitBranch, Code2 } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';

export default function DashboardPage() {
  const router = useRouter();
  const [iihStructureExists, setIihStructureExists] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  useEffect(() => {
    const iihStructure = localStorage.getItem('iihStructure');
    const iihStatus = localStorage.getItem('iihImportStatus');
    const mendixStatus = localStorage.getItem('mendixGenerationStatus');

    if (iihStructure) {
      setIihStructureExists(true);
    }

    // Déterminer l'étape actuelle
    if (!iihStatus) {
      setCurrentStep('import');
    } else if (iihStatus === 'success' && !mendixStatus) {
      setCurrentStep('mendix');
    } else if (mendixStatus) {
      setCurrentStep('complete');
    }
  }, []);

  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-white mb-8">Tableau de bord</h2>
      
      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-6">Progression</h3>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className={`flex flex-col items-center ${currentStep === 'import' ? 'text-blue-400' : currentStep ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'import' ? 'bg-blue-500' : currentStep ? 'bg-green-500' : 'bg-gray-600'}`}>
              <FileInput className="w-5 h-5 text-white" />
            </div>
            <span className="mt-2 text-sm">Import</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${currentStep === 'import' ? 'bg-gray-600' : currentStep ? 'bg-green-500' : 'bg-gray-600'}`} />
          <div className={`flex flex-col items-center ${currentStep === 'mendix' ? 'text-blue-400' : currentStep === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'mendix' ? 'bg-blue-500' : currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-600'}`}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="mt-2 text-sm">Mendix</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-600'}`} />
          <div className={`flex flex-col items-center ${currentStep === 'complete' ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-green-500' : 'bg-gray-600'}`}>
              <GitBranch className="w-5 h-5 text-white" />
            </div>
            <span className="mt-2 text-sm">Visualisation</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Import Hiérarchique</h3>
          <p className="text-gray-400 mb-4">Importez votre structure hiérarchique depuis un fichier Excel.</p>
          <Link
            href="/flexible-import"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FileInput className="w-4 h-4 mr-2" />
            Commencer l'import
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Générateur Mendix</h3>
          <p className="text-gray-400 mb-4">Générez le code Mendix pour votre structure.</p>
          <button
            onClick={() => router.push('/mendix-generator')}
            disabled={!iihStructureExists}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              iihStructureExists 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Code2 className="w-4 h-4 mr-2" />
            Générer le code
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Visualisation</h3>
          <p className="text-gray-400 mb-4">Visualisez votre structure hiérarchique.</p>
          <button
            onClick={() => router.push('/charts')}
            disabled={!iihStructureExists}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              iihStructureExists 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Voir les graphiques
          </button>
        </div>
      </div>
    </AppLayout>
  );
} 