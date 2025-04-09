import { IIHVariable } from './types';
import { sanitizeNameForVariable } from './helpers';

/**
 * Normalise une variable de type tag pour s'assurer qu'elle a tous les champs requis
 * @param variable Variable à normaliser
 * @param adapterId Identifiant de l'adapter à utiliser par défaut
 * @param tagMappings Mappings de configuration pour les noms de tags
 * @returns Variable normalisée
 */
export function normalizeTagVariable(
  variable: IIHVariable, 
  adapterId: string,
  tagMappings: Record<string, string>
): IIHVariable {
  console.log(`Normalisation de la variable Tag: ${variable.variableName}`);
  
  // Utiliser l'adapterId fourni ou celui de la variable
  const adapterIdToUse = variable.adapterId || adapterId;
  
  // Valeur par défaut pour connectionName (nom de l'asset si non défini)
  const connectionName = variable.connectionName || 
    sanitizeNameForVariable(variable.variableName);
  
  // Valeur par défaut pour tagName
  // Priorité: variable.topic > variableName > tag de consommation configuré
  const tagName = variable.topic || 
    variable.variableName || 
    tagMappings.consumption;
  
  // Vérifier si le dataType est valide, utiliser Float par défaut
  const dataType = variable.dataType === 'String' ? 'String' : 'Float';
  
  // Construction de l'objet tag complet
  const normalizedVariable = {
    ...variable,
    adapterId: adapterIdToUse,
    sourceType: 'Tag' as const,
    tag: {
      adapterId: adapterIdToUse,
      connectionName,
      tagName,
      dataType
    }
  };
  
  return normalizedVariable;
} 