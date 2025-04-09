# Plan de Développement - Import Personnalisé

Ce document suit les étapes de développement pour l'ajout de la fonctionnalité d'import personnalisé.

## Phases du Projet

**Phase 1 : Introduction du Choix d'Import (UI)** - ✅ **Terminée**
   - [x] Analyser `page.tsx` pour identifier le point d'entrée de l'import.
   - [x] Modifier `page.tsx` pour afficher une modale de sélection (Mantine).
   - [x] Gérer les actions "Import par Défaut" (vers modale existante) et "Import Personnalisé" (vers future config).
   - [x] Créer `performActualImport` pour gérer les appels backend conditionnels.
   - [x] Correction des problèmes de thème sombre et de visibilité des composants UI (MantineProvider, classes Tailwind).

**Phase 2 : Création de l'Interface de Configuration Personnalisée (UI)** - ✅ **Terminée**
   - [x] Créer le composant `CustomImportConfigurator.tsx`.
   - [x] Implémenter l'UI de base avec `Stepper` Mantine (Hiérarchie, Variables, Mappings placeholders).
   - [x] Définir l'interface `CustomImportConfig` dans l'UI.
   - [x] Intégrer `CustomImportConfigurator` dans `page.tsx` pour le flux "Import Personnalisé".
   - [x] Ajouter le callback `onConfigComplete`.
   - [x] Correction des problèmes de thème sombre dans le configurateur.

**Phase 3 : Création de la Logique d'Import Personnalisé (Backend/Module)** - ⏳ **En cours**
   - [x] Créer le dossier `src/modules/custom-importer`.
   - [x] Dupliquer les fichiers pertinents depuis `simple-importer`.
   - [x] Définir l'interface `CustomImportConfig` dans `custom-importer/types.ts`.
   - [ ] Adapter `custom-importer/importer.ts` :
       - [ ] Renommer la classe en `CustomImporter`.
       - [ ] Modifier le constructeur pour accepter `CustomImportConfig`.
       - [ ] Modifier `importFlexibleData` pour utiliser `this._config`.
       - [ ] **(En cours)** Remplacer la logique de création de hiérarchie IIH (ignorer `data.hierarchyData`, utiliser `data.rawData` et `config.hierarchy.levels`).
       - [ ] Adapter la logique de nommage des variables (`config.variables.namePattern`).
       - [ ] Adapter la logique des unités (`config.variables.unitSource`, `unitColumn`).
       - [ ] Adapter la logique de création des agrégations (`config.variables.createAggregations`).
       - [ ] Adapter la logique de rétention (si `dataRetentionYears` est ajouté à config).
   - [ ] Adapter les points d'entrée et exports du module (`custom-importer/index.ts`).

**Phase 4 : Intégration et Test** - ⬜ **À faire**
   - [ ] Remplacer les appels backend simulés dans `page.tsx` par les appels réels à `custom-importer`.
   - [ ] Tester de bout en bout le flux d'import personnalisé.
   - [ ] Tester que le flux d'import par défaut fonctionne toujours correctement.

**Phase 5 : Améliorations Futures** - ⬜ **À faire**
   - [ ] Implémenter l'UI et la logique pour les Mappings (renommage, connecteurs somme).
   - [ ] Implémenter la configuration de la rétention de données.
   - [ ] Ajouter la persistance des configurations personnalisées (sauvegarde/chargement).
   - [ ] Refactoriser potentiellement la logique commune entre `simple-importer` et `custom-importer`. 