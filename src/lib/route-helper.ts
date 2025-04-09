/**
 * Utilitaire pour gérer les paramètres dans les routes dynamiques de Next.js
 * 
 * Cette fonction aide à éviter l'erreur "params are being enumerated" en accédant directement
 * aux valeurs des paramètres sans les traiter comme des promesses.
 */

/**
 * Extrait les paramètres de route de manière sûre
 * @param params Objet de paramètres de la route
 * @returns Objet contenant les mêmes paramètres
 */
export function extractRouteParams<T>(params: T): T {
  // Simplement retourner les paramètres tels quels, sans traitement asynchrone
  return params;
} 