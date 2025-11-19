# 🎮 Gaming UI A11y Toolkit

> Une bibliothèque de composants React accessible pour créer des interfaces de jeu inclusives avec support clavier, souris et manette.

[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Composants disponibles](#-composants-disponibles)
- [Hooks personnalisés](#-hooks-personnalisés)
- [Architecture](#-architecture)
- [Système de design tokens](#-système-de-design-tokens)
- [Utilisation](#-utilisation)
- [Développement](#-développement)
- [Contribuer](#-contribuer)

## 🎯 À propos

**Gaming UI A11y Toolkit** est une bibliothèque de composants React spécialement conçue pour créer des interfaces de jeu accessibles. Elle combine les meilleures pratiques d'accessibilité (WCAG) avec une expérience de jeu moderne, offrant un support complet pour :

- ⌨️ **Navigation au clavier** (touches directionnelles, Enter, Espace, Échap)
- 🎮 **Support manette de jeu** (D-pad, boutons A/B via Gamepad API)
- 🔊 **Lecteurs d'écran** (annonces ARIA, rôles sémantiques)
- 🎨 **Thèmes accessibles** (mode contraste élevé, daltonisme)
- ♿ **Conformité WCAG** (focus visible, tailles de cibles, gestion du focus)

Cette bibliothèque est idéale pour développer des jeux web inclusifs, des menus de jeu accessibles, ou toute interface nécessitant une navigation gamepad.

## ✨ Fonctionnalités

### Accessibilité complète
- Navigation fluide au clavier et à la manette
- Annonces vocales pour les lecteurs d'écran
- Gestion intelligente du focus avec focus trap
- Indicateurs visuels de focus avec effets gaming
- Support du mode contraste élevé

### Composants gaming spécialisés
- Menu de jeu avec navigation verticale
- Grille d'inventaire 2D avec déplacement d'objets
- Barre de vie avec zones de couleur (sain/attention/critique)
- Boîtes de dialogue modales avec piège de focus
- Tooltips positionnés intelligemment
- Boutons gaming stylisés

### Architecture propre
- Pattern **Clean Architecture** (Domain/Application/Infrastructure/Presentation)
- Entités métier immuables et auto-validantes
- Injection de dépendances pour testabilité maximale
- Séparation claire des responsabilités
- TypeScript strict pour la sûreté du typage

### Système de design cohérent
- Design tokens CSS pour toute la palette visuelle
- Variables CSS personnalisables
- Thème sombre et clair
- Animations fluides et performantes

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/thomaslebeau/gaming_ui_a11y_toolkit.git

# Installer les dépendances
cd gaming_ui_a11y_toolkit
npm install

# Lancer en mode développement
npm run dev

# Build pour la production
npm run build
```

## 🧩 Composants disponibles

### GameButton
Bouton d'action basique avec support gamepad.

```tsx
import { GameButton } from './presentation/components/GameButton';

<GameButton onClick={handleClick} ariaLabel="Confirmer">
  Confirmer
</GameButton>
```

**Props :**
- `onClick`: Fonction appelée au clic
- `disabled`: Désactive le bouton
- `ariaLabel`: Label accessible
- `children`: Contenu du bouton

---

### HealthBar
Indicateur visuel de santé avec zones de couleur.

```tsx
import { HealthBar } from './presentation/components/HealthBar';

<HealthBar
  current={75}
  max={100}
  label="Santé du joueur"
  showValue={true}
  showPercentage={true}
/>
```

**Props :**
- `current`: Valeur actuelle de santé
- `max`: Valeur maximale
- `label`: Label pour l'accessibilité
- `showValue`: Afficher la valeur numérique
- `showPercentage`: Afficher le pourcentage

**Zones de couleur :**
- 🟢 **Sain** : > 50%
- 🟡 **Attention** : 20-50%
- 🔴 **Critique** : < 20%

---

### GameMenu
Menu vertical avec navigation gamepad et clavier.

```tsx
import { GameMenu } from './presentation/components/GameMenu';

const menuItems = [
  { id: 'start', label: 'Nouvelle partie', onClick: startGame },
  { id: 'load', label: 'Charger', onClick: loadGame },
  { id: 'options', label: 'Options', onClick: showOptions },
  { id: 'quit', label: 'Quitter', onClick: quitGame }
];

<GameMenu items={menuItems} ariaLabel="Menu principal" />
```

**Navigation :**
- ⬆️⬇️ Touches directionnelles ou D-pad (boutons 12/13)
- Navigation circulaire (wrap-around)
- Enter/Espace ou bouton A pour sélectionner

---

### InventoryGrid
Système de grille d'inventaire 2D sophistiqué.

```tsx
import { InventoryGrid } from './presentation/components/InventoryGrid';

const items = [
  { id: '1', name: 'Épée', icon: '⚔️', x: 0, y: 0 },
  { id: '2', name: 'Potion', icon: '🧪', x: 1, y: 0 }
];

<InventoryGrid
  columns={4}
  rows={3}
  items={items}
  onItemSelect={(item) => console.log('Sélectionné:', item)}
  onItemMove={(item, newX, newY) => moveItem(item, newX, newY)}
  wrapNavigation={true}
/>
```

**Navigation :**
- ⬆️⬇️⬅️➡️ Touches directionnelles ou D-pad (boutons 12-15)
- Enter/Espace ou bouton A : sélectionner/placer un objet
- Échap ou bouton B : annuler le déplacement
- Annonces vocales des positions et objets

---

### DialogBox
Boîte de dialogue modale avec piège de focus.

```tsx
import { DialogBox } from './presentation/components/DialogBox';

<DialogBox
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirmation"
  content="Voulez-vous vraiment quitter ?"
  characterName="Système"
  actions={[
    { label: 'Oui', onClick: confirmQuit },
    { label: 'Non', onClick: handleClose }
  ]}
/>
```

**Fonctionnalités :**
- Focus piégé dans la dialogue
- Fermeture par bouton B ou Échap
- Restauration du focus à la fermeture
- Prévention du scroll du body

---

### Tooltip
Info-bulle contextuelle accessible.

```tsx
import { Tooltip } from './presentation/components/Tooltip';

<Tooltip content="Ceci restaure 50 points de vie" placement="top" delay={200}>
  <button>Potion 🧪</button>
</Tooltip>
```

**Props :**
- `content`: Contenu du tooltip
- `placement`: Position (`top`, `bottom`, `left`, `right`)
- `delay`: Délai d'affichage en ms
- `ariaLabel`: Label accessible

## 🎣 Hooks personnalisés

### useGamepad
Détecte et gère les manettes de jeu connectées.

```tsx
import { useGamepad } from './presentation/hooks/useGamepad';

const gamepad = useGamepad((button) => {
  console.log('Bouton pressé:', button);
});

// gamepad.isConnected, gamepad.buttons, gamepad.axes
```

---

### useMenuNavigation
Navigation verticale pour les menus.

```tsx
import { useMenuNavigation } from './presentation/hooks/useMenuNavigation';

const { focusedIndex, isFocused } = useMenuNavigation(items.length);
```

---

### useInventoryGrid
Navigation 2D complexe pour grilles d'inventaire.

```tsx
import { useInventoryGrid } from './presentation/hooks/useInventoryGrid';

const {
  focusedIndex,
  focusedPosition,
  isFocused,
  isMovingItem,
  isMoveSource,
  getItemAt
} = useInventoryGrid({
  columns: 4,
  rows: 3,
  items,
  onItemSelect,
  onItemMove,
  wrapNavigation: true
});
```

---

### useDialogFocus
Gestion du focus pour dialogues modales.

```tsx
import { useDialogFocus } from './presentation/hooks/useDialogFocus';

const dialogRef = useDialogFocus(isOpen, onClose);

<div ref={dialogRef} role="dialog">...</div>
```

## 🏗️ Architecture

Le projet suit le pattern **Clean Architecture** avec une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (React)          │
│  Components │ Hooks │ UI Logic              │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────┴────────────────────────┐
│      Infrastructure Layer (Adapters)        │
│  Browser APIs │ Gamepad │ Focus Management  │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────┴────────────────────────┐
│      Application Layer (Use Cases)          │
│  Orchestration │ Business Workflows         │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────┴────────────────────────┐
│         Domain Layer (Entities)             │
│  Business Logic │ Pure Functions │ No deps  │
└─────────────────────────────────────────────┘
```

### Structure des dossiers

```
src/
├── domain/                     # Logique métier pure
│   ├── entities/               # Objets métier immuables
│   │   ├── HealthState.ts      # Calculs de santé
│   │   ├── MenuState.ts        # État de navigation menu
│   │   ├── InventoryState.ts   # État de grille 2D
│   │   ├── GamepadState.ts     # État de la manette
│   │   └── DialogState.ts      # État de dialogue
│   └── ports/                  # Interfaces (contrats)
│       ├── IGamepadRepository.ts
│       └── IFocusRepository.ts
│
├── application/
│   └── useCases/               # Cas d'usage orchestrateurs
│       ├── DetectGamepadConnection.ts
│       ├── NavigateMenu.ts
│       ├── NavigateInventoryGrid.ts
│       └── ManageDialogFocus.ts
│
├── infrastructure/
│   └── adapters/               # Implémentations concrètes
│       ├── BrowserGamepadAdapter.ts
│       ├── BrowserFocusAdapter.ts
│       └── BrowserInventoryAdapter.ts
│
└── presentation/               # Couche React
    ├── components/             # Composants UI
    │   ├── GameButton/
    │   ├── HealthBar/
    │   ├── GameMenu/
    │   ├── InventoryGrid/
    │   ├── DialogBox/
    │   └── Tooltip/
    ├── hooks/                  # Hooks personnalisés
    └── utils/                  # Utilitaires UI
```

### Avantages de cette architecture

✅ **Testabilité** : Chaque couche peut être testée isolément
✅ **Maintenabilité** : Changements localisés, faible couplage
✅ **Évolutivité** : Facile d'ajouter de nouveaux composants
✅ **Indépendance** : Le domaine ne dépend d'aucun framework

## 🎨 Système de design tokens

Le projet utilise un système complet de **design tokens** CSS pour garantir la cohérence visuelle.

### Fichier : `src/styles/tokens.css`

```css
/* Couleurs principales */
--color-primary-base: #4a90e2;
--color-primary-hover: #357abd;

/* Statuts de santé */
--color-health-healthy: #4caf50;
--color-health-warning: #ff9800;
--color-health-critical: #f44336;

/* Typographie */
--font-size-base: 16px;
--font-size-lg: 20px;
--font-weight-normal: 400;
--font-weight-bold: 700;

/* Espacement */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* Bordures et focus */
--border-radius-md: 8px;
--focus-outline-width: 3px;
--focus-outline-color: var(--color-primary-base);

/* Animations */
--animation-duration-fast: 150ms;
--animation-duration-normal: 200ms;
--animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
```

### Catégories de tokens

- **Couleurs** : Palette primaire, statuts, neutres, thème sombre
- **Typographie** : Tailles, poids, hauteurs de ligne, espacement de lettres
- **Espacement** : Échelle de 0 à 40px, presets pour composants
- **Bordures** : Largeurs, rayons, styles de focus
- **Ombres** : Élévations, effets de lueur gaming
- **Animations** : Durées, fonctions d'easing
- **Layout** : Z-index, largeurs max, hauteurs, breakpoints

## 💻 Utilisation

### Exemple complet : Menu de jeu

```tsx
import { useState } from 'react';
import { GameMenu } from './presentation/components/GameMenu';
import { DialogBox } from './presentation/components/DialogBox';
import { useGamepad } from './presentation/hooks/useGamepad';

function GameApp() {
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const gamepad = useGamepad();

  const menuItems = [
    {
      id: 'start',
      label: 'Nouvelle partie',
      onClick: () => console.log('Démarrage...')
    },
    {
      id: 'load',
      label: 'Charger une partie',
      onClick: () => console.log('Chargement...')
    },
    {
      id: 'options',
      label: 'Options',
      onClick: () => console.log('Options...')
    },
    {
      id: 'quit',
      label: 'Quitter',
      onClick: () => setShowQuitDialog(true)
    }
  ];

  return (
    <div className="game-container">
      <h1>Mon Jeu Accessible</h1>

      {gamepad.isConnected && (
        <p>🎮 Manette connectée</p>
      )}

      <GameMenu
        items={menuItems}
        ariaLabel="Menu principal du jeu"
      />

      <DialogBox
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        title="Quitter le jeu"
        content="Êtes-vous sûr de vouloir quitter ?"
        actions={[
          {
            label: 'Oui',
            onClick: () => window.close()
          },
          {
            label: 'Non',
            onClick: () => setShowQuitDialog(false)
          }
        ]}
      />
    </div>
  );
}

export default GameApp;
```

### Exemple : Système de santé

```tsx
import { useState, useEffect } from 'react';
import { HealthBar } from './presentation/components/HealthBar';

function PlayerHealth() {
  const [health, setHealth] = useState(100);

  const takeDamage = (amount: number) => {
    setHealth(prev => Math.max(0, prev - amount));
  };

  const heal = (amount: number) => {
    setHealth(prev => Math.min(100, prev + amount));
  };

  return (
    <div>
      <HealthBar
        current={health}
        max={100}
        label="Santé du joueur"
        showValue={true}
        showPercentage={true}
      />

      <button onClick={() => takeDamage(20)}>
        Recevoir des dégâts (-20)
      </button>
      <button onClick={() => heal(30)}>
        Se soigner (+30)
      </button>
    </div>
  );
}
```

## 🛠️ Développement

### Scripts disponibles

```bash
# Développement avec hot reload
npm run dev

# Build de production
npm run build

# Aperçu du build
npm run preview

# Linting
npm run lint
```

### Stack technique

- **React 19.2** - Bibliothèque UI avec React Compiler
- **TypeScript 5.9** - Typage statique strict
- **Vite (rolldown)** - Build tool ultra-rapide
- **CSS Custom Properties** - Système de design tokens
- **Gamepad API** - Support natif des manettes
- **ARIA** - Accessibilité sémantique

### Tests

Les composants incluent des fichiers de test :
- `HealthBar.test.tsx` - Tests unitaires de la barre de vie
- `Tooltip.test.tsx` - Tests unitaires du tooltip

```bash
# Lancer les tests (à configurer)
npm test
```

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### Lignes directrices

- Respecter l'architecture Clean Architecture
- Écrire des tests pour les nouvelles fonctionnalités
- Documenter les composants avec JSDoc
- Suivre les conventions TypeScript du projet
- Garantir l'accessibilité (WCAG 2.1 niveau AA minimum)
- Tester avec clavier ET manette

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 🙏 Remerciements

Ce projet a été développé avec l'objectif de rendre les jeux web plus accessibles à tous les joueurs, quelles que soient leurs capacités. Merci à la communauté de l'accessibilité et aux développeurs de jeux pour leur inspiration.

**Fait avec ❤️ pour l'inclusion et l'accessibilité dans le gaming**
