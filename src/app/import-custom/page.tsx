"use client";

import { useState } from "react";
import HierarchyStep from "./HierarchyStep";
import VariablesStep from "./VariablesStep";
import AggregationsStep from "./AggregationsStep";
import ReviewStep from "./ReviewStep";
import ResultStep from "./ResultStep";
import { importCustomData, saveCustomImportConfig } from "@/modules/custom-importer";
import type { CustomImportConfig } from "@/modules/custom-importer/configSchema";

type Step = 0 | 1 | 2 | 3 | 4;

export default function ImportCustomPage() {
  const [step, setStep] = useState<Step>(0);
  const [excelData, setExcelData] = useState<Record<string, any>[]>([]);
  const [config, setConfig] = useState<CustomImportConfig | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard navigation
  const next = () => setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  const prev = () => setStep((s) => (s > 0 ? ((s - 1) as Step) : s));

  // Lancement de l'import
  async function handleImport() {
    if (!config || excelData.length === 0) {
      setError("Configuration ou données Excel manquantes");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      saveCustomImportConfig(config);
      const result = await importCustomData(config, excelData);
      setImportResult(result);
      setStep(4);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import personnalisé IIH</h1>
      {step === 0 && (
        <HierarchyStep
          excelData={excelData}
          setExcelData={setExcelData}
          config={config}
          setConfig={setConfig}
          onNext={next}
        />
      )}
      {step === 1 && config && (
        <VariablesStep
          excelData={excelData}
          config={config}
          setConfig={setConfig}
          onNext={next}
          onPrev={prev}
        />
      )}
      {step === 2 && config && (
        <AggregationsStep
          config={config}
          setConfig={setConfig}
          onNext={next}
          onPrev={prev}
        />
      )}
      {step === 3 && config && (
        <ReviewStep
          config={config}
          excelData={excelData}
          onImport={handleImport}
          loading={loading}
          onPrev={prev}
        />
      )}
      {step === 4 && (
        <ResultStep
          result={importResult}
          onRestart={() => {
            setStep(0);
            setConfig(null);
            setImportResult(null);
            setError(null);
          }}
        />
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
} 