export interface IIHAsset {
  id: string;
  name: string;
  description?: string;
  assetType?: string;
}

export const getAssets = async (): Promise<IIHAsset[]> => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const response = await fetch('/api/assets', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error('Pas de données reçues de l\'API');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error: any) {
    console.error('Erreur détaillée:', error);
    throw new Error(`Erreur lors de la récupération des assets: ${error.message}`);
  }
}; 