// Fonction pour nettoyer les caractères spéciaux
const cleanString = (str: string): string => {
  return str
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ïî]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùû]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[']/g, '')
    .replace(/\s+/g, '_');
};

export interface MendixEntity {
  name: string;
  totalConso: number;
  secteur?: string;
  atelier?: string;
  identifiant?: string;
  variableId?: string;
  variableName?: string;
  etatCapteur?: {
    nomCapteur: string;
    etat: boolean;
    derniereMaj: string;
    variableIdEtat?: string;
    variableIdMaj?: string;
  };
}

export const transformDataForMendix = (data: any) => {
  const entities: MendixEntity[] = [];

  // Traiter les secteurs
  Object.entries(data.sectors || {}).forEach(([sectorName, sector]: [string, any]) => {
    entities.push({
      name: cleanString(sectorName),
      totalConso: 0, // À calculer si nécessaire
    });

    // Traiter les ateliers
    Object.entries(sector.workshops || {}).forEach(([workshopName, workshop]: [string, any]) => {
      entities.push({
        name: cleanString(workshopName),
        totalConso: 0, // À calculer si nécessaire
        secteur: cleanString(sectorName)
      });

      // Traiter les machines
      Object.entries(workshop.machines || {}).forEach(([machineName, machine]: [string, any]) => {
        entities.push({
          name: cleanString(machineName),
          totalConso: 0, // À calculer si nécessaire
          secteur: cleanString(sectorName),
          atelier: cleanString(workshopName),
          identifiant: machine.assetId,
          variableId: machine.variable?.id,
          variableName: cleanString(machine.variable?.name || ''),
          etatCapteur: machine.mendixEntity ? {
            nomCapteur: cleanString(machineName),
            etat: false, // Valeur par défaut
            derniereMaj: new Date().toISOString(),
            variableIdEtat: machine.mendixEntity.attributes.find((attr: any) => attr.name === 'Etat')?.variableId,
            variableIdMaj: machine.mendixEntity.attributes.find((attr: any) => attr.name === 'DerniereMaj')?.variableId
          } : undefined
        });
      });
    });
  });

  return entities;
}; 