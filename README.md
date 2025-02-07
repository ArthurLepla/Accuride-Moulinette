# Visualisateur de Données ARLEP

Application web de visualisation de données pour ARLEP, permettant d'explorer les relations entre secteurs, ateliers et machines à travers différentes visualisations interactives.

## Visualisations Disponibles

- **Diagramme de Sankey**: Visualisation des flux entre les différents niveaux
- **Treemap**: Représentation hiérarchique des données avec navigation interactive
- **Graphe d'Arbre**: Vue arborescente des relations
- **Graphe Réseau**: Visualisation des connexions sous forme de réseau

## Technologies

- **Framework**: Next.js 14
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Visualisations**: 
  - D3.js
  - ECharts
  - React Flow

## Installation

1. Installez les dépendances :

```bash
npm install
```

2. Lancez le serveur de développement :

```bash
npm run dev
```

3. Ouvrez [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
my-app/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── components/
│   │   └── charts/
│   │       ├── SankeyChart.tsx
│   │       ├── TreemapChart.tsx
│   │       ├── TreeGraph.tsx
│   │       ├── NetworkGraph.tsx
│   │       └── AlternativeCharts.tsx
│   ├── lib/
│   │   ├── excel-processor.ts
│   │   └── utils.ts
│   └── types/
│       └── sankey.ts
├── public/
├── tailwind.config.js
└── package.json
```

## Fonctionnalités

- Importation et traitement de données Excel
- Visualisations interactives multiples
- Navigation entre différents niveaux de données
- Interface utilisateur moderne et responsive
- Animations fluides
- Tooltips informatifs

## Scripts Disponibles

- `npm run dev`: Lance le serveur de développement
- `npm run build`: Crée une version de production
- `npm start`: Lance la version de production
- `npm run lint`: Vérifie le code avec ESLint
