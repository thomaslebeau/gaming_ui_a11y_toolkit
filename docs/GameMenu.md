# GameMenu Component

## Vue d'ensemble

Le composant `GameMenu` est un menu de navigation entièrement accessible conçu pour les interfaces de jeux. Il prend en charge la navigation au clavier, au pad directionnel (D-Pad) et au joystick gauche de la manette de jeu.

## Caractéristiques

✅ **Navigation complète au gamepad** - D-Pad et joystick gauche
✅ **Navigation au clavier** - Touches fléchées, Entrée, Espace
✅ **Conforme WCAG 2.1 AA** - Accessible pour tous les utilisateurs
✅ **Retour haptique** - Vibration de la manette lors de la navigation
✅ **Gestion automatique du focus** - Focus visuel clair et intuitif
✅ **Support des lecteurs d'écran** - Attributs ARIA complets
✅ **Indicateur de connexion gamepad** - Feedback visuel en temps réel

## Installation

```tsx
import { GameMenu } from '../src/components/GameMenu';
import type { GameMenuItem } from '../src/types/menu.types';
```

## Utilisation de base

```tsx
import { GameMenu } from './components/GameMenu';
import type { GameMenuItem } from './types/menu.types';

function MyGame() {
  const menuItems: GameMenuItem[] = [
    {
      id: 'start',
      label: 'Démarrer',
      icon: '🎮',
      onSelect: () => console.log('Jeu démarré'),
    },
    {
      id: 'options',
      label: 'Options',
      icon: '⚙️',
      onSelect: () => console.log('Options ouvertes'),
    },
    {
      id: 'quit',
      label: 'Quitter',
      icon: '🚪',
      onSelect: () => console.log('Jeu quitté'),
    },
  ];

  return (
    <GameMenu
      title="Menu Principal"
      items={menuItems}
      initialSelectedIndex={0}
    />
  );
}
```

## Props

### `GameMenuProps`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `items` | `GameMenuItem[]` | **Requis** | Tableau d'éléments de menu |
| `title` | `string` | `undefined` | Titre du menu |
| `initialSelectedIndex` | `number` | `0` | Index initialement sélectionné |
| `enableHapticFeedback` | `boolean` | `true` | Active le retour haptique |
| `onSelectionChange` | `(index: number) => void` | `undefined` | Callback lors du changement de sélection |
| `className` | `string` | `''` | Classe CSS personnalisée |
| `joystickDeadzone` | `number` | `0.5` | Seuil de zone morte du joystick (0-1) |

### `GameMenuItem`

| Propriété | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `id` | `string` | **Requis** | Identifiant unique |
| `label` | `string` | **Requis** | Texte affiché |
| `onSelect` | `() => void` | **Requis** | Action à exécuter |
| `disabled` | `boolean` | `false` | État désactivé |
| `icon` | `string` | `undefined` | Icône ou emoji |

## Navigation

### Clavier
- **↑ / ↓** : Naviguer entre les éléments
- **Home** : Aller au premier élément
- **End** : Aller au dernier élément
- **Entrée / Espace** : Sélectionner l'élément actuel

### Gamepad
- **D-Pad Haut / Bas** : Naviguer entre les éléments
- **Joystick gauche (Haut / Bas)** : Naviguer entre les éléments
- **Bouton A** (Bouton du bas) : Sélectionner l'élément actuel

## Exemple avancé

```tsx
import { useState } from 'react';
import { GameMenu } from './components/GameMenu';
import type { GameMenuItem } from './types/menu.types';

function AdvancedGameMenu() {
  const [gameStarted, setGameStarted] = useState(false);

  const menuItems: GameMenuItem[] = [
    {
      id: 'new-game',
      label: 'Nouvelle Partie',
      icon: '🎮',
      onSelect: () => {
        setGameStarted(true);
        console.log('Nouvelle partie démarrée');
      },
    },
    {
      id: 'continue',
      label: 'Continuer',
      icon: '▶️',
      onSelect: () => console.log('Partie continuée'),
      disabled: !gameStarted, // Désactivé si aucune partie en cours
    },
    {
      id: 'options',
      label: 'Options',
      icon: '⚙️',
      onSelect: () => console.log('Menu options'),
    },
    {
      id: 'achievements',
      label: 'Succès',
      icon: '🏆',
      onSelect: () => console.log('Succès affichés'),
    },
  ];

  const handleSelectionChange = (index: number) => {
    console.log('Élément sélectionné:', index);
  };

  return (
    <GameMenu
      title="Menu Principal"
      items={menuItems}
      initialSelectedIndex={0}
      enableHapticFeedback={true}
      onSelectionChange={handleSelectionChange}
      joystickDeadzone={0.3} // Zone morte plus sensible
    />
  );
}
```

## Hook personnalisé : `useGamepadNavigation`

Le composant utilise le hook `useGamepadNavigation` qui peut également être utilisé séparément pour d'autres composants.

```tsx
import { useGamepadNavigation } from './hooks/useGamepadNavigation';

function MyCustomComponent() {
  const { selectedIndex, isGamepadConnected, setSelectedIndex } = useGamepadNavigation({
    itemCount: 5,
    initialIndex: 0,
    onSelectionChange: (index) => console.log('Index:', index),
    onActivate: (index) => console.log('Activé:', index),
  });

  return (
    <div>
      <p>Index sélectionné : {selectedIndex}</p>
      <p>Gamepad connecté : {isGamepadConnected ? 'Oui' : 'Non'}</p>
    </div>
  );
}
```

## Personnalisation des styles

Le composant utilise des CSS Modules. Vous pouvez le personnaliser en :

1. **Utilisant la prop `className`** :
```tsx
<GameMenu className="mon-menu-personnalise" items={items} />
```

2. **Surchargeant les variables CSS** :
```css
.mon-menu-personnalise {
  --color-focus-gaming: #ff00ff;
  --spacing-24: 2rem;
}
```

## Accessibilité

### Attributs ARIA
- `role="menu"` sur le conteneur
- `aria-label` sur le menu
- `aria-describedby` sur l'élément sélectionné
- `aria-live="polite"` sur l'indicateur de gamepad

### Conformité WCAG 2.1 AA
- ✅ Indicateurs de focus visibles (4:1 contraste minimum)
- ✅ Navigation au clavier complète
- ✅ Cibles tactiles de 44x44px minimum
- ✅ Support des lecteurs d'écran
- ✅ Support du mode contraste élevé
- ✅ Support du mode mouvement réduit

## Compatibilité des navigateurs

- Chrome 89+
- Firefox 88+
- Safari 14+
- Edge 89+

**Note** : L'API Gamepad est supportée par tous les navigateurs modernes. Le retour haptique nécessite un navigateur compatible avec l'API Vibration.

## Compatibilité des manettes

✅ Xbox One / Series X|S
✅ PlayStation 4 / 5 (DualShock / DualSense)
✅ Nintendo Switch Pro Controller
✅ Manettes génériques USB/Bluetooth

## Mappings des boutons standard

| Bouton | Xbox | PlayStation | Index |
|--------|------|-------------|-------|
| A (Bas) | A | ✕ (Cross) | 0 |
| B (Droite) | B | ○ (Circle) | 1 |
| X (Gauche) | X | □ (Square) | 2 |
| Y (Haut) | Y | △ (Triangle) | 3 |
| D-Pad Haut | ↑ | ↑ | 12 |
| D-Pad Bas | ↓ | ↓ | 13 |

## Axes du joystick

| Axe | Description | Index |
|-----|-------------|-------|
| Joystick gauche X | Horizontal | 0 |
| Joystick gauche Y | Vertical | 1 |
| Joystick droit X | Horizontal | 2 |
| Joystick droit Y | Vertical | 3 |

## Dépannage

### Le gamepad n'est pas détecté
1. Appuyez sur n'importe quel bouton de la manette pour l'activer
2. Vérifiez que votre navigateur supporte l'API Gamepad
3. Consultez la console pour les erreurs

### Le retour haptique ne fonctionne pas
1. Vérifiez que `enableHapticFeedback={true}`
2. Tous les navigateurs ne supportent pas l'API Vibration
3. Certaines manettes ne supportent pas la vibration

### Navigation trop sensible
Ajustez la zone morte du joystick :
```tsx
<GameMenu joystickDeadzone={0.7} items={items} />
```

## License

MIT
