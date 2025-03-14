# Accuride UI Components

Bibliothèque de composants UI réutilisables pour les widgets Mendix React.

## Installation

```bash
npm install @accuride/ui-components
```

## Utilisation

```tsx
import { Button, Card, EnergyChart } from '@accuride/ui-components';

// Dans votre widget Mendix React
export function MyWidget() {
  return (
    <Card>
      <EnergyChart data={data} />
      <Button>Action</Button>
    </Card>
  );
}
```

## Composants disponibles

### Layout
- `TemplateHeader` - En-tête de template standardisé
- `EnergyLayout` - Layout spécifique pour les vues énergétiques

### UI Components
- `Button` - Bouton personnalisable
- `Card` - Carte avec header et content
- `Tabs` - Système d'onglets
- `EnergyChart` - Graphique de données énergétiques
- `EnergyStatCard` - Carte de statistiques énergétiques

## Styles

La bibliothèque utilise Tailwind CSS pour le styling. Assurez-vous d'avoir les styles Tailwind configurés dans votre projet Mendix.

## Thème

Les composants suivent le thème Accuride. Vous pouvez personnaliser les couleurs et styles en utilisant les variables CSS définies dans le thème.

## Contribution

Pour contribuer à la bibliothèque :

1. Fork le repository
2. Créez une branche pour votre feature
3. Committez vos changements
4. Poussez vers la branche
5. Créez une Pull Request 