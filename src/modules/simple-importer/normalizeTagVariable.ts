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
  
  // Utiliser l'adapterId fourni ou celui de la variable s'il existe déjà
  const adapterIdToUse = variable.adapterId || adapterId;
  
  // Utiliser connectionName s'il existe déjà sur la variable ou dans le tag, sinon le déduire
  const connectionName = variable.connectionName || variable.tag?.connectionName || 
    sanitizeNameForVariable(variable.variableName);
  
  // Déterminer le tagName
  // Priorité : tag existant > topic > variableName > tag par défaut
  let finalTagName = variable.tag?.tagName; // Priorité 1: Utiliser celui du tag s'il existe
  if (!finalTagName) {
    finalTagName = variable.topic || variable.variableName || tagMappings.consumption;
  }
  console.log(` - AdapterID: ${adapterIdToUse}, ConnectionName: ${connectionName}, TagName final: ${finalTagName}`);
  
  // Vérifier si le dataType est valide, utiliser Float par défaut (ou celui du tag existant)
  const dataType = variable.tag?.dataType === 'String' ? 'String' : 
                   (variable.dataType === 'String' ? 'String' : 'Float');
  
  // Construction de l'objet tag complet, en préservant les valeurs existantes si possible
  const normalizedVariable = {
    ...variable,
    adapterId: adapterIdToUse, // Mettre à jour l'adapterId de haut niveau aussi
    sourceType: 'Tag' as const,
    tag: {
      adapterId: adapterIdToUse,
      connectionName: connectionName,
      tagName: finalTagName, // Utiliser le tagName déterminé
      dataType: dataType
    }
  };
  
  // Optionnel: Nettoyer les propriétés topic/connectionName de haut niveau si elles sont maintenant dans tag
  // delete normalizedVariable.topic;
  // delete normalizedVariable.connectionName;
  
  return normalizedVariable;
} 