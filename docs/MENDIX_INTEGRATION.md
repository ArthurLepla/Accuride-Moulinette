# Documentation Modèle de Données Mendix

## Introduction

Ce document détaille la structure du modèle de données utilisé pour l'intégration avec Mendix. Il décrit les entités attendues à chaque niveau hiérarchique, leurs attributs, et fournit des exemples concrets d'implémentation.

## Architecture Générale

Le modèle de données Mendix est conçu selon une structure hiérarchique à plusieurs niveaux (jusqu'à 5 niveaux) représentant différentes granularités dans l'organisation industrielle :

1. **Secteur** - Niveau 1 (le plus haut)
2. **Atelier** - Niveau 2
3. **Ligne** - Niveau 3
4. **Poste** - Niveau 4
5. **Machine** - Niveau 5 (le plus bas)

Chaque niveau comprend :
- Une entité principale représentant le niveau (ex: `Smart.Secteur`)
- Des entités d'agrégation associées à ce niveau (ex: `Smart.Aggregation_Conso_SECTEUR`)

> **Note importante**: Le dernier niveau (Machine) ne comporte que des agrégations de consommation et l'état capteur, sans les autres types d'agrégations.

## Règles de Structuration

1. **Préfixe des entités**: Toutes les entités sont préfixées par `Smart.`
2. **Références hiérarchiques**: Chaque niveau fait référence à ses niveaux parents par leur nom
3. **Types d'énergie**: Quatre types d'énergie sont supportés : Elec, Gaz, Air, Eau
4. **Consommation par type d'énergie**: Chaque niveau (sauf Machine) possède un attribut de consommation totale et un attribut par type d'énergie
5. **Agrégations**: Les périodes d'agrégation standard sont 5min, 1h, 4h, 8h et 1jour
6. **Au niveau Machine**: Seules les agrégations de consommation et les états capteurs sont gérés (pas d'agrégation de production ou d'IPE)

## Spécification des Entités par Niveau

### Niveau 1 : Secteur

#### Entité principale : `Smart.Secteur`
| Attribut | Type | Description | Valeur par défaut |
|----------|------|-------------|-------------------|
| Nom | String | Nom du secteur | - |
| TotalConso | String | Consommation totale | "0" |
| TotalConsoElec | String | Consommation électricité | "0" |
| TotalConsoGaz | String | Consommation gaz | "0" |
| TotalConsoAir | String | Consommation air comprimé | "0" |
| TotalConsoEau | String | Consommation eau | "0" |

#### Entités d'agrégation associées au Secteur

##### `Smart.Aggregation_Conso_SECTEUR`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| VariableId | String | ID de la variable | Oui |
| VariableName | String | Nom de la variable | Oui |
| AssetName | String | Nom de l'asset | Oui |
| Secteur | String | Nom du secteur | Oui |
| TypeEnergie | String | Type d'énergie (Elec, Gaz, Air, Eau) | Oui |
| Identifiant5Min | String | ID de l'agrégation 5min | Non |
| Identifiant1h | String | ID de l'agrégation 1h | Non |
| Identifiant4h | String | ID de l'agrégation 4h | Non |
| Identifiant8h | String | ID de l'agrégation 8h | Non |
| Identifiant1day | String | ID de l'agrégation 1 jour | Non |

##### `Smart.Aggregation_Production_Quantite_SECTEUR`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| VariableId | String | ID de la variable | Oui |
| VariableName | String | Nom de la variable | Oui |
| AssetName | String | Nom de l'asset | Oui |
| Secteur | String | Nom du secteur | Oui |
| Identifiant5Min | String | ID de l'agrégation 5min | Non |
| Identifiant1h | String | ID de l'agrégation 1h | Non |
| Identifiant4h | String | ID de l'agrégation 4h | Non |
| Identifiant8h | String | ID de l'agrégation 8h | Non |
| Identifiant1day | String | ID de l'agrégation 1 jour | Non |

##### `Smart.Aggregation_Production_Kg_SECTEUR`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| VariableId | String | ID de la variable | Oui |
| VariableName | String | Nom de la variable | Oui |
| AssetName | String | Nom de l'asset | Oui |
| Secteur | String | Nom du secteur | Oui |
| Identifiant5Min | String | ID de l'agrégation 5min | Non |
| Identifiant1h | String | ID de l'agrégation 1h | Non |
| Identifiant4h | String | ID de l'agrégation 4h | Non |
| Identifiant8h | String | ID de l'agrégation 8h | Non |
| Identifiant1day | String | ID de l'agrégation 1 jour | Non |

##### `Smart.Aggregation_IPE_Quantite_SECTEUR`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| VariableId | String | ID de la variable | Oui |
| VariableName | String | Nom de la variable | Oui |
| AssetName | String | Nom de l'asset | Oui |
| Secteur | String | Nom du secteur | Oui |
| TypeEnergie | String | Type d'énergie (Elec, Gaz, Air, Eau) | Oui |
| Identifiant5Min | String | ID de l'agrégation 5min | Non |
| Identifiant1h | String | ID de l'agrégation 1h | Non |
| Identifiant4h | String | ID de l'agrégation 4h | Non |
| Identifiant8h | String | ID de l'agrégation 8h | Non |
| Identifiant1day | String | ID de l'agrégation 1 jour | Non |

##### `Smart.Aggregation_IPE_Kg_SECTEUR`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| VariableId | String | ID de la variable | Oui |
| VariableName | String | Nom de la variable | Oui |
| AssetName | String | Nom de l'asset | Oui |
| Secteur | String | Nom du secteur | Oui |
| TypeEnergie | String | Type d'énergie (Elec, Gaz, Air, Eau) | Oui |
| Identifiant5Min | String | ID de l'agrégation 5min | Non |
| Identifiant1h | String | ID de l'agrégation 1h | Non |
| Identifiant4h | String | ID de l'agrégation 4h | Non |
| Identifiant8h | String | ID de l'agrégation 8h | Non |
| Identifiant1day | String | ID de l'agrégation 1 jour | Non |

### Niveau 2 : Atelier

#### Entité principale : `Smart.Atelier`
| Attribut | Type | Description | Valeur par défaut |
|----------|------|-------------|-------------------|
| Nom | String | Nom de l'atelier | - |
| TotalConso | String | Consommation totale | "0" |
| TotalConsoElec | String | Consommation électricité | "0" |
| TotalConsoGaz | String | Consommation gaz | "0" |
| TotalConsoAir | String | Consommation air comprimé | "0" |
| TotalConsoEau | String | Consommation eau | "0" |
| Secteur | String | Référence au secteur parent | - |

#### Entités d'agrégation associées à l'Atelier
*(Structure identique aux agrégations du Secteur, avec l'attribut "Atelier" supplémentaire)*

### Niveau 3 : Ligne

#### Entité principale : `Smart.Ligne`
| Attribut | Type | Description | Valeur par défaut |
|----------|------|-------------|-------------------|
| Nom | String | Nom de la ligne | - |
| TotalConso | String | Consommation totale | "0" |
| TotalConsoElec | String | Consommation électricité | "0" |
| TotalConsoGaz | String | Consommation gaz | "0" |
| TotalConsoAir | String | Consommation air comprimé | "0" |
| TotalConsoEau | String | Consommation eau | "0" |
| Secteur | String | Référence au secteur parent | - |
| Atelier | String | Référence à l'atelier parent | - |

#### Entités d'agrégation associées à la Ligne
*(Structure identique aux précédentes, avec les attributs "Atelier" et "Ligne")*

### Niveau 4 : Poste

#### Entité principale : `Smart.Poste`
| Attribut | Type | Description | Valeur par défaut |
|----------|------|-------------|-------------------|
| Nom | String | Nom du poste | - |
| TotalConso | String | Consommation totale | "0" |
| TotalConsoElec | String | Consommation électricité | "0" |
| TotalConsoGaz | String | Consommation gaz | "0" |
| TotalConsoAir | String | Consommation air comprimé | "0" |
| TotalConsoEau | String | Consommation eau | "0" |
| Secteur | String | Référence au secteur parent | - |
| Atelier | String | Référence à l'atelier parent | - |
| Ligne | String | Référence à la ligne parent | - |

#### Entités d'agrégation associées au Poste
*(Structure identique aux précédentes, avec tous les niveaux parents comme attributs)*

### Niveau 5 : Machine

#### Entité principale : `Smart.Machine`
| Attribut | Type | Description | Valeur par défaut |
|----------|------|-------------|-------------------|
| Identifiant | String | Identifiant unique de la machine | - |
| Nom | String | Nom de la machine | - |
| IPE | String | Indicateur de performance énergétique | "0" |
| TotalConso | String | Consommation totale | "0" |
| Secteur | String | Référence au secteur parent | - |
| Atelier | String | Référence à l'atelier parent | - |
| Ligne | String | Référence à la ligne parent | - |
| Poste | String | Référence au poste parent | - |
| TypeEnergie | String | Type d'énergie consommée | - |

#### Entités d'agrégation et de capteur au niveau Machine

##### `Smart.Aggregation_Conso_MACHINE`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| VariableId | String | ID de la variable | Oui |
| VariableName | String | Nom de la variable | Oui |
| AssetName | String | Nom de l'asset | Oui |
| Machine | String | Nom de la machine | Oui |
| Poste | String | Nom du poste parent | Non |
| Ligne | String | Nom de la ligne parent | Non |
| Atelier | String | Nom de l'atelier parent | Non |
| Secteur | String | Nom du secteur parent | Non |
| TypeEnergie | String | Type d'énergie | Oui |
| Identifiant5Min | String | ID de l'agrégation 5min | Non |
| Identifiant1h | String | ID de l'agrégation 1h | Non |
| Identifiant4h | String | ID de l'agrégation 4h | Non |
| Identifiant8h | String | ID de l'agrégation 8h | Non |
| Identifiant1day | String | ID de l'agrégation 1 jour | Non |

##### `Smart.EtatCapteur`
| Attribut | Type | Description | Obligatoire |
|----------|------|-------------|-------------|
| NomCapteur | String | Nom du capteur (généralement le nom de la machine) | Oui |
| Etat | String | État du capteur (true/false) | Oui |
| DerniereMaj | String | Date de dernière mise à jour (ISO) | Oui |
| IdEtatCapteur | String | ID de la variable d'état | Oui |

## Exemple Complet d'Implémentation

Voici un exemple concret illustrant la création d'objets Mendix pour une structure à 3 niveaux :

### Hiérarchie d'exemple
- Secteur: "Automobile"
  - Atelier: "Emboutissage"
    - Machine: "Presse_01" (Type d'énergie: Elec)
    - Machine: "Presse_02" (Type d'énergie: Elec)
  - Atelier: "Peinture"
    - Machine: "Cabine_Peinture_01" (Type d'énergie: Gaz)

### Code JavaScript Mendix pour créer les entités

```javascript
// Fonction utilitaire pour créer et commit un objet
function createAndCommitObject(entity, attributes) {
  return new Promise((resolve, reject) => {
    mx.data.create({
      entity: entity,
      callback: function(obj) {
        // Définir les attributs
        for (var key in attributes) {
          if (attributes.hasOwnProperty(key)) {
            obj.set(key, attributes[key]);
          }
        }
        // Sauvegarder l'objet
        mx.data.commit({
          mxobj: obj,
          callback: function() {
            console.log("Objet créé avec succès:", entity, attributes);
            resolve(obj);
          },
          error: function(e) {
            console.error("Erreur lors de la sauvegarde:", e);
            reject(e);
          }
        });
      },
      error: function(e) {
        console.error("Erreur lors de la création:", e);
        reject(e);
      }
    });
  });
}

// Créer les entités de notre exemple
async function createEntities() {
  try {
    // 1. Créer le Secteur
    const secteurAttributes = {
      "Nom": "Automobile",
      "TotalConso": "0",
      "TotalConsoElec": "0",
      "TotalConsoGaz": "0",
      "TotalConsoAir": "0",
      "TotalConsoEau": "0"
    };
    await createAndCommitObject("Smart.Secteur", secteurAttributes);
    
    // 2. Créer l'Atelier Emboutissage
    const atelierEmboutissageAttributes = {
      "Nom": "Emboutissage",
      "TotalConso": "0",
      "TotalConsoElec": "0",
      "TotalConsoGaz": "0",
      "TotalConsoAir": "0",
      "TotalConsoEau": "0",
      "Secteur": "Automobile"
    };
    await createAndCommitObject("Smart.Atelier", atelierEmboutissageAttributes);
    
    // 3. Créer l'Atelier Peinture
    const atelierPeintureAttributes = {
      "Nom": "Peinture",
      "TotalConso": "0",
      "TotalConsoElec": "0",
      "TotalConsoGaz": "0",
      "TotalConsoAir": "0",
      "TotalConsoEau": "0",
      "Secteur": "Automobile"
    };
    await createAndCommitObject("Smart.Atelier", atelierPeintureAttributes);
    
    // 4. Créer la Machine Presse_01
    const presse01Attributes = {
      "Identifiant": "PRESS-001",
      "Nom": "Presse_01",
      "IPE": "0",
      "TotalConso": "0",
      "Secteur": "Automobile",
      "Atelier": "Emboutissage",
      "TypeEnergie": "Elec"
    };
    await createAndCommitObject("Smart.Machine", presse01Attributes);
    
    // 5. Créer la Machine Presse_02
    const presse02Attributes = {
      "Identifiant": "PRESS-002",
      "Nom": "Presse_02",
      "IPE": "0",
      "TotalConso": "0",
      "Secteur": "Automobile",
      "Atelier": "Emboutissage",
      "TypeEnergie": "Elec"
    };
    await createAndCommitObject("Smart.Machine", presse02Attributes);
    
    // 6. Créer la Machine Cabine_Peinture_01
    const cabinePeintureAttributes = {
      "Identifiant": "PAINT-001",
      "Nom": "Cabine_Peinture_01",
      "IPE": "0",
      "TotalConso": "0",
      "Secteur": "Automobile",
      "Atelier": "Peinture",
      "TypeEnergie": "Gaz"
    };
    await createAndCommitObject("Smart.Machine", cabinePeintureAttributes);
    
    // 7. Créer une agrégation de consommation pour Presse_01
    const aggConsoPresse01 = {
      "VariableId": "var-conso-press-001",
      "VariableName": "Conso_Elec_Presse_01",
      "AssetName": "Presse_01",
      "Machine": "Presse_01",
      "Atelier": "Emboutissage",
      "Secteur": "Automobile",
      "TypeEnergie": "Elec",
      "Identifiant5Min": "agg-5m-press-001",
      "Identifiant1h": "agg-1h-press-001",
      "Identifiant4h": "agg-4h-press-001",
      "Identifiant8h": "agg-8h-press-001",
      "Identifiant1day": "agg-1d-press-001"
    };
    await createAndCommitObject("Smart.Aggregation_Conso_MACHINE", aggConsoPresse01);
    
    // 8. Créer une agrégation de consommation pour la Cabine de Peinture
    const agConsCabine = {
      "VariableId": "var-conso-paint-001",
      "VariableName": "Conso_Gaz_Cabine_Peinture",
      "AssetName": "Cabine_Peinture_01",
      "Machine": "Cabine_Peinture_01",
      "Atelier": "Peinture",
      "Secteur": "Automobile",
      "TypeEnergie": "Gaz",
      "Identifiant5Min": "agg-5m-paint-001",
      "Identifiant1h": "agg-1h-paint-001",
      "Identifiant4h": "agg-4h-paint-001",
      "Identifiant8h": "agg-8h-paint-001",
      "Identifiant1day": "agg-1d-paint-001"
    };
    await createAndCommitObject("Smart.Aggregation_Conso_MACHINE", agConsCabine);
    
    // 9. Créer un état capteur pour Presse_01
    const etatCapteurPresse01 = {
      "NomCapteur": "Presse_01",
      "Etat": "false",
      "DerniereMaj": new Date().toISOString(),
      "IdEtatCapteur": "state-press-001"
    };
    await createAndCommitObject("Smart.EtatCapteur", etatCapteurPresse01);
    
    // 10. Créer une agrégation conso au niveau atelier
    const aggConsoEmboutissage = {
      "VariableId": "var-conso-embout",
      "VariableName": "Conso_Totale_Emboutissage",
      "AssetName": "Emboutissage",
      "Atelier": "Emboutissage",
      "Secteur": "Automobile",
      "TypeEnergie": "Elec",
      "Identifiant1h": "agg-1h-embout",
      "Identifiant1day": "agg-1d-embout"
    };
    await createAndCommitObject("Smart.Aggregation_Conso_ATELIER", aggConsoEmboutissage);
    
    // 11. Créer une agrégation IPE au niveau secteur
    const aggIPESecteur = {
      "VariableId": "var-ipe-auto",
      "VariableName": "IPE_Global_Automobile",
      "AssetName": "Automobile",
      "Secteur": "Automobile",
      "TypeEnergie": "Elec",
      "Identifiant1day": "agg-1d-ipe-auto"
    };
    await createAndCommitObject("Smart.Aggregation_IPE_Quantite_SECTEUR", aggIPESecteur);
    
    console.log("Toutes les entités ont été créées avec succès");
  } catch (error) {
    console.error("Erreur lors de la création des entités:", error);
    throw error;
  }
}
```

## Optimisation pour les Grandes Quantités d'Entités

Lorsque le nombre d'entités à créer est très important (par exemple, 6000 agrégations), il est recommandé d'utiliser une approche par lots (batching) pour éviter les problèmes de performance :

```javascript
async function createEntitiesInBatches(entities, batchSize = 100) {
  const totalBatches = Math.ceil(entities.length / batchSize);
  console.log(`Création de ${entities.length} entités en ${totalBatches} lots...`);
  
  for (let i = 0; i < totalBatches; i++) {
    const startIdx = i * batchSize;
    const endIdx = Math.min(startIdx + batchSize, entities.length);
    const batch = entities.slice(startIdx, endIdx);
    
    console.log(`Traitement du lot ${i+1}/${totalBatches} (${batch.length} entités)...`);
    
    const promises = batch.map(entity => 
      createAndCommitObject(entity.entityType, entity.attributes)
    );
    
    await Promise.all(promises);
    console.log(`Lot ${i+1} terminé.`);
  }
  
  console.log("Création par lots terminée avec succès");
}

// Exemple d'utilisation pour un grand nombre d'agrégations
const allEntities = [];

// Préparer toutes les entités en mémoire d'abord
for (let i = 1; i <= 100; i++) {
  const machineId = `M${i.toString().padStart(3, '0')}`;
  
  // Ajouter l'entité Machine
  allEntities.push({
    entityType: "Smart.Machine",
    attributes: {
      "Identifiant": machineId,
      "Nom": `Machine_${i}`,
      "IPE": "0",
      "TotalConso": "0",
      "Secteur": "Automobile",
      "Atelier": "Production",
      "TypeEnergie": "Elec"
    }
  });
  
  // Ajouter l'agrégation de consommation
  allEntities.push({
    entityType: "Smart.Aggregation_Conso_MACHINE",
    attributes: {
      "VariableId": `var-${machineId}`,
      "VariableName": `Conso_Machine_${i}`,
      "AssetName": `Machine_${i}`,
      "Machine": `Machine_${i}`,
      "Atelier": "Production",
      "Secteur": "Automobile",
      "TypeEnergie": "Elec"
    }
  });
}

// Créer les entités par lots de 50
createEntitiesInBatches(allEntities, 50);
```

## Bonnes Pratiques

1. **Nommage cohérent**: Utiliser une nomenclature cohérente pour tous les noms d'assets
2. **Traitement par lots**: Pour les grands volumes, toujours utiliser des méthodes de création par lots
3. **Gestion des erreurs**: Implémenter une gestion d'erreurs robuste avec journalisation
4. **Validation préalable**: Valider la structure des données avant de lancer les créations d'entités
5. **Idempotence**: Vérifier si les entités existent déjà avant de tenter de les créer
6. **Journalisation**: Toujours logger les étapes importantes pour faciliter le débogage

## Limitations connues

1. Le nombre d'attributs d'une entité est limité en fonction de la configuration de Mendix
2. Les performances peuvent se dégrader avec un grand nombre d'entités ou d'attributs
3. Les références entre entités sont par nom et non par ID, ce qui peut être sensible aux renommages 