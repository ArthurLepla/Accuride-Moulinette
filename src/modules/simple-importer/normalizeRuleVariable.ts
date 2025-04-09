import { IIHVariable } from './types';

/**
 * Normalise une variable de type rule pour s'assurer qu'elle a tous les champs requis
 * @param variable Variable à normaliser
 * @returns Variable normalisée
 */
export function normalizeRuleVariable(variable: IIHVariable): IIHVariable {
  console.log(`Normalisation de la variable Rule: ${variable.variableName}`);
  
  // S'assurer que la formule est définie
  const formula = variable.formula || variable.rule?.formula || "0";
  
  // Récupérer ou créer l'objet rule
  const normalizedVariable = {
    ...variable,
    sourceType: 'Rule' as const,
    formula,
    rule: {
      formula,
      tags: variable.rule?.tags || []
    }
  };
  
  // Logging pour s'assurer que la formule est correcte
  if (formula === "0") {
    console.warn(`⚠️ La variable ${variable.variableName} a une formule par défaut "0"`);
  } else {
    console.log(`✓ La variable ${variable.variableName} a une formule valide: "${formula}"`);
  }
  
  return normalizedVariable;
} 