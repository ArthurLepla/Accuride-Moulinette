"use client";
import { useState } from "react";
import Link from "next/link";
import React from "react";
import { ClipboardCopy } from "lucide-react";

// === CONFIGURATION ===
const IIH_BASE_URL = "https://localhost:4203/iih-essentials"; // À adapter selon l'environnement

// Fonction utilitaire pour parser le code et extraire les objets IPE à corriger
function extractIpeObjectsFromMendixCode(code: string) {
  // Recherche du bloc MENDIX_SUMMARY = { ... } (on prend tout le JSON)
  const summaryMatch = code.match(/const\s+MENDIX_SUMMARY\s*=\s*({[\s\S]*?});/);
  if (!summaryMatch) return [];
  let summaryObj: any;
  try {
    summaryObj = eval('(' + summaryMatch[1] + ')'); // Utilisation de eval pour parser le JSON JS (attention, sécurisé car code local)
  } catch (e) {
    return [];
  }
  // On cherche toutes les clés de type aggregations_ipe_quantite_* et aggregations_ipe_kg_*
  const ipeKeys = Object.keys(summaryObj).filter(
    k => k.startsWith("aggregations_ipe_quantite_") || k.startsWith("aggregations_ipe_kg_")
  );
  // On extrait tous les objets de ces tableaux, pour toutes les énergies
  const objetsTrouves = new Set<string>();
  for (const key of ipeKeys) {
    const arr = summaryObj[key];
    if (Array.isArray(arr)) {
      for (const obj of arr) {
        if (obj && obj.attributes && obj.attributes.VariableName) {
          // Extraire le nom d'objet à partir de VariableName (ex: IPE_air_COMMUN, IPE_kg_eau_USINE_1)
          const match = obj.attributes.VariableName.match(/^IPE(?:_kg)?_[a-zA-Z]+_(.+)$/);
          if (match) {
            objetsTrouves.add(match[1]);
          }
        }
      }
    }
  }
  // Générer toutes les combinaisons de variables IPE pour chaque objet trouvé
  const energies = ["elec", "eau", "air", "gaz"];
  const combinaisons = [] as any[];
  for (const objet of Array.from(objetsTrouves)) {
    for (const energie of energies) {
      combinaisons.push({
        variableName: `IPE_${energie}_${objet}`,
        energie,
        objet,
        isKg: false
      });
      combinaisons.push({
        variableName: `IPE_kg_${energie}_${objet}`,
        energie,
        objet,
        isKg: true
      });
    }
  }
  return combinaisons;
}

// Fonction utilitaire pour normaliser les noms (casse, accents, underscores, espaces, tirets)
function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[_\s-]+/g, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Fonction utilitaire pour trouver une variable par nom (tolérant)
function findVariableByName(variables: any[], target: string) {
  const normTarget = normalizeName(target);
  console.log('[findVariableByName] Normalized Target:', normTarget);

  // Détecter l'énergie recherchée à partir du target (ex: IPE_kg_eau_USINE => eau)
  let energie = '';
  const match = target.match(/^IPE(_kg)?_([a-zA-Z]+)_/);
  if (match) {
    energie = match[2].toLowerCase();
    console.log(`[findVariableByName] Energie détectée pour le target: ${energie}`);
  }

  // Log toutes les variables de l'API contenant l'énergie recherchée
  if (energie) {
    const energyVars = variables.filter(v => (v.variableName || v.name || '').toLowerCase().includes(energie));
    console.log(`[findVariableByName] Variables API contenant '${energie}':`, energyVars.map(v => v.variableName || v.name));
  }

  // Log quelques exemples de variables de l'API pour comparer
  if (variables.length > 0) {
    console.log('[findVariableByName] API Variables (sample):');
    variables.slice(0, 5).forEach(v => {
      console.log(`  - Original: "${v.variableName || v.name}", Normalized: "${normalizeName(v.variableName || v.name)}"`);
    });
  }

  // 1. Match exact normalisé
  let found = variables.find(v => {
    const normApiVar = normalizeName(v.variableName || v.name);
    return normApiVar === normTarget;
  });
  if (found) {
    console.log('[findVariableByName] Found (exact match):', found);
    return found;
  }

  // 2. Match "includes"
  found = variables.find(v => {
    const normApiVar = normalizeName(v.variableName || v.name);
    return normApiVar.includes(normTarget);
  });

  if (found) {
    console.log('[findVariableByName] Found (includes match):', found);
  } else {
    console.warn(`[findVariableByName] Not found for target: ${normTarget} (énergie: ${energie})`);
  }
  return found || null;
}

// Fonction utilitaire pour récupérer une variable par nom (et asset optionnel)
async function fetchVariableByName(variableName: string, ip: string, setMigrationLogs: (cb: (logs: string[]) => string[]) => void) {
  const IIH_BASE_URL = `https://${ip}/iih-essentials`;
  const url = `${IIH_BASE_URL}/DataService/Variables`;
  console.log(`[fetchVariableByName] Fetching variables from: ${url} for target: ${variableName}`);
  let res;
  try {
    res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  } catch (error) {
    console.error(`[fetchVariableByName] Network error for ${variableName}:`, error);
    throw new Error("Erreur réseau lors de l'appel API Variables");
  }
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[fetchVariableByName] API Error for ${variableName}: ${res.status}`, errorText);
    throw new Error(`Erreur API Variables: ${res.status}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    console.error(`[fetchVariableByName] JSON parsing error for ${variableName}:`, error);
    throw new Error("Erreur de parsing JSON API Variables");
  }
  
  const variables: any[] = Array.isArray(data) ? data : (data.variables || []);

  // Log pour vérifier si toutes les énergies sont présentes dans la réponse de l'API
  console.log(`[fetchVariableByName] Received ${variables.length} variables from API for target: ${variableName}`);
  if (variables.length < 20 && variables.length > 0) { // Logger un échantillon si pas trop de variables
    console.log('[fetchVariableByName] API Response (sample/all):', variables.map(v => v.variableName || v.name));
  } else if (variables.length >= 20) {
    console.log('[fetchVariableByName] API Response (first 20):', variables.slice(0,20).map(v => v.variableName || v.name));
  } else {
    console.log('[fetchVariableByName] API Response: No variables received.');
  }
  
  const foundVariable = findVariableByName(variables, variableName);
  if (!foundVariable) {
    // Log debug: suggestions proches
    const suggestions = variables
      .map(v => v.variableName || v.name)
      .filter(n => n && normalizeName(n).includes(normalizeName(variableName)));
    setMigrationLogs(logs => [...logs, `Aucune variable trouvée pour "${variableName}". Suggestions proches: ${suggestions.join(', ')}`]);
  }
  return foundVariable || null;
}

// Fonction utilitaire pour récupérer les agrégations d'une variable
async function fetchAggregationsForVariable(variableId: string, ip: string) {
  const IIH_BASE_URL = `https://${ip}/iih-essentials`;
  const url = `${IIH_BASE_URL}/DataService/Aggregations?variableIds=["${variableId}"]`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error("Erreur API Aggregations");
  const data = await res.json();
  return Array.isArray(data) ? (data as any[]) : [];
}

// Fonction pour générer le code complet Mendix Action (prêt à copier/coller)
function generateMendixActionCode(ipeResults: any[]) {
  // Génération du bloc MENDIX_SUMMARY
  const summary: { [key: string]: any } = {};
  for (const obj of ipeResults) {
    if (!obj.success) continue;
    // Déterminer la clé d'entité
    const isKg = obj.isKg;
    const objet = obj.objet;
    const entityKey = isKg
      ? `Smart.Aggregation_IPE_kg_${objet}`
      : `Smart.Aggregation_IPE_quantite_${objet}`;
    if (!summary[entityKey]) summary[entityKey] = [];
    summary[entityKey].push({
      entity: entityKey,
      attributes: obj.attributes
    });
  }
  const mendixSummaryCode =
    '// Données pré-traitées à créer\nconst MENDIX_SUMMARY = ' + JSON.stringify(summary, null, 2) + ';';

  // Génération du squelette complet Mendix Action
  return `// BEGIN EXTRA CODE
// (Ajoutez ici des imports ou helpers si besoin)
// END EXTRA CODE

/**
 * Action JavaScript Mendix pour supprimer et recréer les objets IPE agrégés
 * Généré automatiquement
 * @returns {Promise<void>}
 */
export async function execute(params) {
  // BEGIN USER CODE

  // ${mendixSummaryCode}

  // Suppression des objets existants
  let deletedCount = 0;
  const entityPrefixes = [
    'Smart.Aggregation_IPE_quantite_',
    'Smart.Aggregation_IPE_kg_'
  ];
  for (const prefix of entityPrefixes) {
    // On suppose que les entités sont connues dans le modèle Mendix
    // Remplacez la logique ci-dessous si besoin pour filtrer par contexte
    const entities = Object.keys(MENDIX_SUMMARY).filter(k => k.startsWith(prefix));
    for (const key of entities) {
      const arr = MENDIX_SUMMARY[key];
      for (const obj of arr) {
        await new Promise((resolve, reject) => {
          mx.data.get({
            entity: obj.entity,
            callback: function(objs) {
              if (objs && objs.length > 0) {
                mx.data.remove({
                  guids: objs.map(o => o.getGuid()),
                  callback: function() {
                    deletedCount += objs.length;
                    resolve();
                  },
                  error: function() {
                    resolve(); // On continue même en cas d'erreur
                  }
                });
              } else {
                resolve();
              }
            },
            error: function() { resolve(); }
          });
        });
      }
    }
  }
  console.log('Objets supprimés :', deletedCount);

  // Création des nouveaux objets
  let createdCount = 0;
  for (const key of Object.keys(MENDIX_SUMMARY)) {
    const arr = MENDIX_SUMMARY[key];
    for (const obj of arr) {
      await new Promise((resolve, reject) => {
        mx.data.create({
          entity: obj.entity,
          callback: function(mxObj) {
            // On set tous les attributs
            for (const attr in obj.attributes) {
              mxObj.set(attr, obj.attributes[attr]);
            }
            mx.data.commit({
              mxobj: mxObj,
              callback: function() {
                createdCount++;
                resolve();
              },
              error: function() { resolve(); }
            });
          },
          error: function() { resolve(); }
        });
      });
    }
  }
  console.log('Objets créés :', createdCount);

  // Résumé final
  console.log('Résumé :', { deletedCount, createdCount });
  // END USER CODE
}
`;
}

export default function MendixMigrationPage() {
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipeObjects, setIpeObjects] = useState<any[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [ipIed, setIpIed] = useState<string>("localhost");
  const [ipError, setIpError] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyTableSuccess, setCopyTableSuccess] = useState(false);

  // Quand le code change, on parse automatiquement pour debug
  React.useEffect(() => {
    if (oldCode.trim()) {
      setIpeObjects(extractIpeObjectsFromMendixCode(oldCode));
    } else {
      setIpeObjects([]);
    }
  }, [oldCode]);

  const handleMigrate = async () => {
    if (!ipIed.trim()) {
      setIpError("Veuillez saisir l'IP de l'IED.");
      return;
    }
    setIpError("");
    setLoading(true);
    setMigrationLogs([]);
    const results = [];
    for (const obj of ipeObjects) {
      let log = `Traitement: ${obj.variableName}`;
      try {
        // 1. Chercher la variable par nom
        const variable = await fetchVariableByName(obj.variableName, ipIed, setMigrationLogs);
        if (!variable || !variable.variableId) {
          log += ' ❌ Variable non trouvée';
          results.push({ ...obj, success: false, log });
          setMigrationLogs(logs => [...logs, log]);
          continue;
        }
        // 2. Chercher les agrégations pour cette variable
        const aggs = await fetchAggregationsForVariable(variable.variableId, ipIed);
        // On mappe les IDs d'agrégations par cycle (5min, 1h, etc.)
        const aggIds: { [key: string]: string } = {};
        for (const agg of aggs) {
          if (agg.cycle && agg.cycle.base && agg.cycle.factor) {
            let key = '';
            if (agg.cycle.base === 'minute' && agg.cycle.factor === 5) key = 'Identifiant5Min';
            else if (agg.cycle.base === 'hour' && agg.cycle.factor === 1) key = 'Identifiant1h';
            else if (agg.cycle.base === 'hour' && agg.cycle.factor === 4) key = 'Identifiant4h';
            else if (agg.cycle.base === 'hour' && agg.cycle.factor === 8) key = 'Identifiant8h';
            else if (agg.cycle.base === 'day' && agg.cycle.factor === 1) key = 'Identifiant1day';
            if (key) aggIds[key] = agg.id;
          }
        }
        // 3. Générer les nouveaux attributs
        const newAttrs = {
          VariableName: obj.variableName,
          VariableId: variable.variableId,
          ...aggIds
        };
        log += ' ✅ OK';
        results.push({ ...obj, success: true, attributes: newAttrs, log });
        setMigrationLogs(logs => [...logs, log]);
      } catch (e) {
        log += ' ❌ Erreur API';
        results.push({ ...obj, success: false, log });
        setMigrationLogs(logs => [...logs, log]);
      }
    }
    // Générer le code final
    const code = generateMendixActionCode(results);
    setNewCode(code);
    setLoading(false);
  };

  const handleCopy = () => {
    if (!newCode) return;
    navigator.clipboard.writeText(newCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Fonction pour copier le tableau des variables IPE générées
  const handleCopyTable = () => {
    if (!ipeObjects.length) return;
    // Générer le contenu tabulé (objet, énergie, type, variableName)
    const header = 'Objet\tÉnergie\tType\tNom variable';
    const rows = ipeObjects.map(obj => {
      let energie = '';
      let type = '';
      const match = obj.variableName.match(/^IPE(_kg)?_([a-zA-Z]+)_(.+)$/);
      if (match) {
        type = match[1] ? 'kg' : 'quantité';
        energie = match[2];
      } else {
        type = obj.isKg ? 'kg' : 'quantité';
        energie = obj.energie;
      }
      return `${obj.objet}\t${energie}\t${type}\t${obj.variableName}`;
    });
    const content = [header, ...rows].join('\n');
    navigator.clipboard.writeText(content);
    setCopyTableSuccess(true);
    setTimeout(() => setCopyTableSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-8 shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            &larr; Retour
          </Link>
          <h1 className="text-2xl font-bold text-white">Migration ancien code Mendix</h1>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">IP de l'IED :</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 192.168.1.100"
            value={ipIed}
            onChange={e => setIpIed(e.target.value)}
          />
          {ipError && <div className="text-red-400 text-sm mt-1">{ipError}</div>}
        </div>
        <p className="text-gray-300 mb-6">
          Collez ici votre ancien code de création Mendix. L'application analysera le code, retrouvera les bons IDs via l'API IIH, et générera un code compatible avec la nouvelle structure multi-énergie.
        </p>
        <textarea
          className="w-full h-48 p-3 rounded bg-gray-900 text-gray-200 mb-4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Collez ici votre ancien code..."
          value={oldCode}
          onChange={e => setOldCode(e.target.value)}
        />
        {/* Debug : Affichage des objets IPE extraits */}
        {ipeObjects.length > 0 && (
          <div className="bg-gray-700 rounded p-4 mb-4">
            <h3 className="text-white font-semibold mb-2">Variables IPE générées à traiter :</h3>
            <div className="flex items-center mb-2 gap-2">
              <button
                onClick={handleCopyTable}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs"
                title="Copier le tableau"
              >
                Copier le tableau
              </button>
              {copyTableSuccess && (
                <span className="text-green-400 text-xs ml-2">Tableau copié !</span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm text-gray-200">
                <thead>
                  <tr>
                    <th className="text-left">Objet</th>
                    <th className="text-left">Énergie</th>
                    <th className="text-left">Type</th>
                    <th className="text-left">Nom variable</th>
                  </tr>
                </thead>
                <tbody>
                  {ipeObjects.map((obj, idx) => {
                    let energie = '';
                    let type = '';
                    const match = obj.variableName.match(/^IPE(_kg)?_([a-zA-Z]+)_(.+)$/);
                    if (match) {
                      type = match[1] ? 'kg' : 'quantité';
                      energie = match[2];
                    } else {
                      type = obj.isKg ? 'kg' : 'quantité';
                      energie = obj.energie;
                    }
                    return (
                      <tr key={idx} className="border-b border-gray-600 last:border-0">
                        <td className="font-mono text-blue-300">{obj.objet}</td>
                        <td className="font-mono text-green-300">{energie}</td>
                        <td className="font-mono">{type}</td>
                        <td className="font-mono">{obj.variableName}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Affichage des logs de migration */}
        {migrationLogs.length > 0 && (
          <div className="bg-gray-800 rounded p-4 mb-4">
            <h3 className="text-white font-semibold mb-2">Logs de migration :</h3>
            <table className="w-full text-xs text-gray-300">
              <thead>
                <tr>
                  <th className="text-left">Variable</th>
                  <th className="text-left">Statut</th>
                  <th className="text-left">Détail</th>
                </tr>
              </thead>
              <tbody>
                {migrationLogs.map((log, idx) => {
                  const isOk = log.includes('✅');
                  const isError = log.includes('❌');
                  return (
                    <tr key={idx} className={isOk ? 'bg-green-900/30' : isError ? 'bg-red-900/30' : ''}>
                      <td className="font-mono">{log.split(':')[1]?.split(' ')[1] || ''}</td>
                      <td className={isOk ? 'text-green-400' : isError ? 'text-red-400' : ''}>
                        {isOk ? 'OK' : isError ? 'Erreur' : ''}
                      </td>
                      <td>{log}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <button
          onClick={handleMigrate}
          disabled={loading || !oldCode.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6"
        >
          {loading ? "Analyse et migration en cours..." : "Analyser & Mettre à jour"}
        </button>
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <h2 className="text-lg font-semibold text-white flex-1">Nouveau code généré :</h2>
            <button
              onClick={handleCopy}
              className="ml-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2"
              disabled={!newCode}
              title="Copier le code"
            >
              <ClipboardCopy className="w-4 h-4" />
              Copier le code
            </button>
            {copySuccess && (
              <span className="ml-3 text-green-400 text-sm">Code copié !</span>
            )}
          </div>
          <pre className="bg-gray-900 p-4 rounded-lg text-gray-300 overflow-x-auto min-h-[100px]">
            <code>{newCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
} 