/**
 * Sanitize un nom pour qu'il soit utilisable comme nom de variable
 * @param name Nom à sanitizer
 * @returns Nom sanitizé
 */
export function sanitizeNameForVariable(name: string): string {
  if (!name) return 'unknown';
  
  // Remplacer les caractères spéciaux par des underscores
  let sanitized = name
    .trim()
    .replace(/[^\w\s]/gi, '_')   // Remplacer tous les caractères non alphanumériques par _
    .replace(/\s+/g, '_')        // Remplacer les espaces par _
    .replace(/__+/g, '_')        // Remplacer plusieurs _ consécutifs par un seul
    .replace(/^_+|_+$/g, '');    // Enlever les _ au début et à la fin
  
  // La vérification du chiffre au début est maintenant commentée
  // if (/^\d/.test(sanitized)) {
  //   sanitized = 'var_' + sanitized;
  // }
  
  return sanitized;
}

/**
 * Extrait le type d'énergie à partir du nom et des métadonnées d'un asset
 * @param asset Asset à analyser
 * @returns Type d'énergie (elec, gaz, eau, air) ou undefined si non détecté
 */
export function extractEnergyTypeFromAsset(asset: any): string | undefined {
  // Vérifier les données Excel originales si disponibles (prioritaire)
  if (asset.originalData && asset.originalData.type_energie) {
    return normalizeEnergyType(asset.originalData.type_energie);
  }
  
  // Vérifier d'abord dans les métadonnées
  if (asset.metadata?.energyType) {
    return normalizeEnergyType(asset.metadata.energyType);
  }
  
  // Rechercher des mots complets ou des patterns spécifiques pour éviter les confusions
  const nameToCheck = (asset.name || '').toLowerCase();
  const descToCheck = (asset.description || '').toLowerCase();
  
  // Vérification prioritaire pour l'eau - recherche plus spécifique
  // Règles améliorées pour l'eau
  if (nameToCheck.match(/\beau\b/) || nameToCheck.match(/\bwater\b/) || 
      descToCheck.match(/\beau\b/) || descToCheck.match(/\bwater\b/)) {
    return 'eau';
  }
  
  // Inclut maintenant les signes liés à l'eau chaude, chauffage, calories
  if (nameToCheck.includes('calor') || 
       nameToCheck.match(/\bch\b/) || 
      nameToCheck.includes('chauff') || nameToCheck.includes('heat') ||
       descToCheck.includes('calor') || 
      descToCheck.includes('chauff') || descToCheck.includes('heat')) {
    return 'eau';
  }
  
  // Vérification pour le gaz
  if (nameToCheck.match(/\bgaz\b/) || nameToCheck.match(/\bgas\b/) || 
      descToCheck.match(/\bgaz\b/) || descToCheck.match(/\bgas\b/)) {
    return 'gaz';
  }
  
  if (nameToCheck.includes('_gaz_') || nameToCheck.includes('-gaz-') ||
      descToCheck.includes('_gaz_') || descToCheck.includes('-gaz-')) {
    return 'gaz';
  }
  
  // Vérification pour l'air comprimé
  if (nameToCheck.match(/\bair\b/) || nameToCheck.includes('compr') || 
      descToCheck.match(/\bair\b/) || descToCheck.includes('compr')) {
    return 'air';
  }
  
  if (nameToCheck.includes('_air_') || nameToCheck.includes('-air-') ||
      descToCheck.includes('_air_') || descToCheck.includes('-air-')) {
    return 'air';
  }
  
  // Vérification pour l'électricité (après les autres pour éviter les confusions)
  if (nameToCheck.match(/\belec\b/) || nameToCheck.includes('electr') || nameToCheck.includes('élect') || 
      descToCheck.match(/\belec\b/) || descToCheck.includes('electr') || descToCheck.includes('élect')) {
    return 'elec';
  }
  
  if (nameToCheck.includes('_elec_') || nameToCheck.includes('-elec-') ||
      descToCheck.includes('_elec_') || descToCheck.includes('-elec-')) {
    return 'elec';
  }
  
  // Si toujours pas trouvé, rechercher des sous-chaînes, mais de manière plus prudente
  if (nameToCheck.includes('eau') || descToCheck.includes('eau')) {
    return 'eau';
  }
  
  if (nameToCheck.includes('gaz') || descToCheck.includes('gaz')) {
    return 'gaz';
  }
  
  if (nameToCheck.includes('air') || descToCheck.includes('air')) {
    return 'air';
  }
  
  if (nameToCheck.includes('elec') || descToCheck.includes('elec')) {
    return 'elec';
  }
  
  // Si aucun type n'est détecté, retourner undefined
  return undefined;
}

/**
 * Normalise un type d'énergie pour qu'il corresponde à un des types reconnus
 * @param type Type d'énergie à normaliser
 * @returns Type d'énergie normalisé
 */
export function normalizeEnergyType(type: string): string {
  if (!type) return 'elec'; // Type par défaut si non spécifié
  
  console.log(`Normalisation du type d'énergie: "${type}"`);
  
  // Vérifier d'abord les correspondances exactes (avec casse)
  if (type === 'Eau' || type === 'eau' || type === 'EAU' || type === 'WATER' || type === 'Water' || type === 'water') {
    console.log(`  ✓ Type d'énergie 'eau' détecté par correspondance exacte: "${type}"`);
    return 'eau';
  }
  
  if (type === 'Gaz' || type === 'gaz' || type === 'GAZ' || type === 'GAS' || type === 'Gas' || type === 'gas') {
    console.log(`  ✓ Type d'énergie 'gaz' détecté par correspondance exacte: "${type}"`);
    return 'gaz';
  }
  
  if (type === 'Air' || type === 'air' || type === 'AIR') {
    console.log(`  ✓ Type d'énergie 'air' détecté par correspondance exacte: "${type}"`);
    return 'air';
  }
  
  if (type === 'Elec' || type === 'elec' || type === 'ELEC' || type === 'Électricité' || type === 'électricité' || 
      type === 'Electricité' || type === 'electricité' || type === 'ELECTRICITY' || type === 'Electricity' || type === 'electricity') {
    console.log(`  ✓ Type d'énergie 'elec' détecté par correspondance exacte: "${type}"`);
    return 'elec';
  }
  
  // Si pas de correspondance exacte, vérifier avec toLowerCase pour les inclusions
  const typeLower = type.toLowerCase();
  
  // Vérifier d'abord pour l'eau (inclure les mots liés au chauffage et calories)
  if (typeLower.includes('eau') || typeLower.includes('water') ||
       typeLower.includes('chauff') || typeLower.includes('heat')) {
    console.log(`  ✓ Type d'énergie 'eau' détecté par inclusion: "${type}"`);
    return 'eau';
  }
  
  // Gaz (après eau pour éviter les confusions)
  if (typeLower.includes('gaz') || typeLower.includes('gas')) {
    console.log(`  ✓ Type d'énergie 'gaz' détecté par inclusion: "${type}"`);
    return 'gaz';
  }
  
  // Air (après gaz pour éviter les confusions)
  if (typeLower.includes('air') || typeLower.includes('compr')) {
    console.log(`  ✓ Type d'énergie 'air' détecté par inclusion: "${type}"`);
    return 'air';
  }
  
  // Électricité en dernier pour éviter les confusions
  if (typeLower.includes('electr') || typeLower.includes('élect') || typeLower.includes('elec')) {
    console.log(`  ✓ Type d'énergie 'elec' détecté par inclusion: "${type}"`);
    return 'elec';
  }
  
  // Si le type n'est pas reconnu, retourner électricité par défaut
  console.log(`  ⚠️ Type d'énergie non reconnu: "${type}". Utilisation du type par défaut: 'elec'`);
  return 'elec';
} 