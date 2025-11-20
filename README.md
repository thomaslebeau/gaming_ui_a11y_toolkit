# 🎮 Gaming UI A11y Toolkit

> Une bibliothèque React de composants accessibles pour créer des interfaces de jeu inclusives avec support du clavier, de la souris et de la manette de jeu.

[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/gaming-ui-a11y-toolkit)](https://www.npmjs.com/package/gaming-ui-a11y-toolkit)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Composants disponibles](#-composants-disponibles)
- [Hooks personnalisés](#-hooks-personnalisés)
- [Utilisation](#-utilisation)
- [API](#-api)
- [Développement](#-développement)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

## 🎯 À propos

**Gaming UI A11y Toolkit** est une bibliothèque de composants React spécialement conçue pour créer des interfaces de jeu accessibles. Elle combine les meilleures pratiques d'accessibilité (WCAG 2.1 AA) avec l'expérience de jeu moderne, offrant un support complet pour :

- ⌨️ **Navigation au clavier** (touches fléchées, Entrée, Espace, Échap)
- 🎮 **Support manette** (D-pad, boutons A/B via Gamepad API)
- 🕹️ **Navigation au joystick** (stick analogique gauche)
- 🔊 **Lecteurs d'écran** (annonces ARIA, rôles sémantiques)
- ♿ **Conformité WCAG 2.1 AA** (focus visible, gestion du focus)
- 📳 **Retour haptique** (vibrations sur manette)

Cette bibliothèque est idéale pour développer des jeux web inclusifs, des menus de jeu accessibles, ou toute interface nécessitant une navigation à la manette.

## ✨ Fonctionnalités

### Accessibilité complète
- Navigation fluide au clavier et à la manette
- Annonces vocales pour les lecteurs d'écran
- Gestion intelligente du focus
- Indicateurs de focus visuels avec effets gaming
- Support du retour haptique sur manette

### Composants spécialisés pour le gaming
- Bouton de jeu avec retour haptique
- Menu de jeu avec navigation verticale (D-pad et joystick)
- Support complet de la Gamepad API
- Détection automatique de connexion manette

### Architecture propre
- TypeScript strict pour la sécurité des types
- Composants réutilisables et composables
- Hooks personnalisés pour la logique métier
- Tests unitaires inclus

### Système de design cohérent
- Tokens CSS pour toute la palette visuelle
- Variables CSS personnalisables
- Thèmes clair et sombre
- Animations fluides et performantes

## 📦 Installation

```bash
npm install gaming-ui-a11y-toolkit
```

ou avec yarn :

```bash
yarn add gaming-ui-a11y-toolkit
```

ou avec pnpm :

```bash
pnpm add gaming-ui-a11y-toolkit
```

## 🧩 Composants disponibles

### GameButton

Bouton d'action de base avec support manette et retour haptique.

```tsx
import { GameButton } from 'gaming-ui-a11y-toolkit';

<GameButton
  label="Commencer"
  onClick={handleClick}
  variant="primary"
  size="large"
/>
```

**Fonctionnalités :**
- Conformité WCAG 2.1 AA
- Navigation clavier (Entrée et Espace)
- Support des lecteurs d'écran
- Retour haptique sur manette
- États visuels (pressé, désactivé, focus)

---

### GameMenu

Menu vertical avec navigation au clavier, D-pad et joystick analogique.

```tsx
import { GameMenu } from 'gaming-ui-a11y-toolkit';

const menuItems = [
  { id: 'start', label: 'Nouvelle partie', onSelect: startGame },
  { id: 'load', label: 'Charger une partie', onSelect: loadGame },
  { id: 'options', label: 'Options', onSelect: showOptions },
  { id: 'quit', label: 'Quitter', onSelect: quitGame }
];

<GameMenu
  title="Menu Principal"
  items={menuItems}
  enableHapticFeedback={true}
/>
```

**Navigation :**
- ⬆️⬇️ Touches fléchées pour naviguer
- 🎮 D-pad (boutons 12/13) pour naviguer
- 🕹️ Joystick gauche (axe Y) pour naviguer
- Entrée/Espace ou bouton A pour sélectionner
- Home/End pour aller au début/fin
- Indicateur visuel de manette connectée

## 🎣 Hooks personnalisés

### useGamepadNavigation

Gère la navigation au clavier et à la manette pour les menus.

```tsx
import { useGamepadNavigation } from 'gaming-ui-a11y-toolkit/hooks';

const { selectedIndex, isGamepadConnected, setSelectedIndex } = useGamepadNavigation({
  itemCount: items.length,
  initialIndex: 0,
  onSelectionChange: (index) => console.log('Sélectionné:', index),
  onActivate: (index) => console.log('Activé:', index),
  enableHapticFeedback: true,
  joystickDeadzone: 0.5
});
```

**Fonctionnalités :**
- Détection automatique de manette
- Support D-pad (boutons 12/13)
- Support joystick gauche avec zone morte configurable
- Retour haptique sur changement de sélection
- Activation avec bouton A (bouton 0)

## 💻 Utilisation

### Exemple complet : Menu de jeu

```tsx
import { useState } from 'react';
import { GameMenu } from 'gaming-ui-a11y-toolkit';

function GameApp() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');

  const menuItems = [
    {
      id: 'start',
      label: 'Nouvelle partie',
      icon: '🎮',
      onSelect: () => setGameState('playing')
    },
    {
      id: 'load',
      label: 'Charger une partie',
      icon: '💾',
      onSelect: () => console.log('Chargement...')
    },
    {
      id: 'options',
      label: 'Options',
      icon: '⚙️',
      onSelect: () => console.log('Options...')
    },
    {
      id: 'quit',
      label: 'Quitter',
      icon: '🚪',
      onSelect: () => window.close()
    }
  ];

  return (
    <div className="game-container">
      <h1>Mon jeu accessible</h1>

      {gameState === 'menu' && (
        <GameMenu
          title="Menu Principal"
          items={menuItems}
          enableHapticFeedback={true}
          onSelectionChange={(index) => {
            console.log('Navigation vers:', menuItems[index].label);
          }}
        />
      )}

      {gameState === 'playing' && (
        <div>
          <h2>Jeu en cours...</h2>
          <button onClick={() => setGameState('menu')}>
            Retour au menu
          </button>
        </div>
      )}
    </div>
  );
}

export default GameApp;
```

### Exemple : Boutons d'action

```tsx
import { GameButton } from 'gaming-ui-a11y-toolkit';

function ActionButtons() {
  return (
    <div className="button-group">
      <GameButton
        label="Attaquer"
        onClick={() => console.log('Attaque!')}
        variant="primary"
        size="large"
        enableHapticFeedback={true}
      />

      <GameButton
        label="Défendre"
        onClick={() => console.log('Défense!')}
        variant="secondary"
        size="medium"
      />

      <GameButton
        label="Action désactivée"
        onClick={() => {}}
        disabled={true}
      />
    </div>
  );
}
```

## 📚 API

### GameButton Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | **requis** | Texte du bouton (également utilisé pour aria-label) |
| `onClick` | `() => void` | **requis** | Fonction appelée au clic |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Variante visuelle du bouton |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Taille du bouton |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `enableHapticFeedback` | `boolean` | `true` | Active le retour haptique |
| `ariaDescribedBy` | `string` | - | ID de l'élément de description ARIA |

### GameMenu Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `items` | `GameMenuItem[]` | **requis** | Liste des éléments du menu |
| `title` | `string` | - | Titre du menu |
| `initialSelectedIndex` | `number` | `0` | Index initial sélectionné |
| `enableHapticFeedback` | `boolean` | `true` | Active le retour haptique |
| `onSelectionChange` | `(index: number) => void` | - | Callback lors du changement de sélection |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `joystickDeadzone` | `number` | `0.5` | Zone morte du joystick (0-1) |

### GameMenuItem Type

```typescript
interface GameMenuItem {
  id: string;              // Identifiant unique
  label: string;           // Texte affiché
  onSelect: () => void;    // Action à l'activation
  disabled?: boolean;      // Désactiver l'élément
  icon?: string;           // Icône optionnelle
}
```

### useGamepadNavigation Options

```typescript
interface UseGamepadNavigationOptions {
  itemCount: number;                          // Nombre total d'éléments
  initialIndex?: number;                      // Index initial (défaut: 0)
  onSelectionChange?: (index: number) => void; // Callback changement
  onActivate?: (index: number) => void;        // Callback activation
  enableHapticFeedback?: boolean;              // Retour haptique (défaut: true)
  joystickDeadzone?: number;                   // Zone morte (défaut: 0.5)
}
```

## 🛠️ Développement

### Prérequis

- Node.js 18+
- npm, yarn ou pnpm

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/thomaslebeau/gaming_ui_a11y_toolkit.git
cd gaming_ui_a11y_toolkit

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Builder pour la production
npm run build

# Lancer les tests
npm test

# Linter le code
npm run lint
```

### Structure du projet

```
gaming_ui_a11y_toolkit/
├── src/
│   ├── components/
│   │   ├── GameButton/
│   │   │   ├── GameButton.tsx
│   │   │   └── index.ts
│   │   └── GameMenu/
│   │       ├── GameMenu.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useGamepadNavigation.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── button.types.ts
│   │   ├── menu.types.ts
│   │   └── Gamepad.type.ts
│   └── styles/
│       └── components/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Stack technologique

- **React 19.2** - Bibliothèque UI avec React Compiler
- **TypeScript 5.9** - Typage statique strict
- **Vite (rolldown)** - Outil de build ultra-rapide
- **CSS Modules** - Styles scopés par composant
- **Gamepad API** - Support natif manette de jeu
- **ARIA** - Accessibilité sémantique

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

1. **Forkez** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/SuperFeature`)
3. **Committez** vos changements (`git commit -m 'Ajout SuperFeature'`)
4. **Pushez** vers la branche (`git push origin feature/SuperFeature`)
5. **Ouvrez** une Pull Request

### Directives de contribution

- Respectez les conventions TypeScript du projet
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez les composants avec JSDoc
- Assurez l'accessibilité (WCAG 2.1 AA minimum)
- Testez avec clavier ET manette
- Suivez les principes de Clean Code

## 🐛 Signaler un bug

Si vous trouvez un bug, veuillez [ouvrir une issue](https://github.com/thomaslebeau/gaming_ui_a11y_toolkit/issues) avec :

- Une description claire du problème
- Les étapes pour reproduire
- Le comportement attendu vs actuel
- Votre environnement (navigateur, OS, version)

## 🗺️ Roadmap

Fonctionnalités prévues pour les prochaines versions :

- [ ] HealthBar - Barre de vie avec zones colorées
- [ ] InventoryGrid - Grille d'inventaire 2D navigable
- [ ] DialogBox - Boîte de dialogue modale avec focus trap
- [ ] Tooltip - Info-bulles contextuelles accessibles
- [ ] useDialogFocus - Hook pour gestion du focus modal
- [ ] useInventoryGrid - Hook pour navigation 2D
- [ ] Support des thèmes personnalisables
- [ ] Plus de composants gaming accessibles

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

Ce projet a été développé dans le but de rendre les jeux web plus accessibles à tous les joueurs, quelles que soient leurs capacités. Merci à la communauté de l'accessibilité et aux développeurs de jeux pour leur inspiration.

## 📞 Contact

Thomas Lebeau - [@thomaslebeau](https://github.com/thomaslebeau)

Lien du projet : [https://github.com/thomaslebeau/gaming_ui_a11y_toolkit](https://github.com/thomaslebeau/gaming_ui_a11y_toolkit)

---

**Fait avec ❤️ pour l'inclusion et l'accessibilité dans le gaming**
