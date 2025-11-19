# 🎮 Gaming UI A11y Toolkit

> An accessible React component library for building inclusive game interfaces with keyboard, mouse, and gamepad support.

[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Installation](#-installation)
- [Available Components](#-available-components)
- [Custom Hooks](#-custom-hooks)
- [Architecture](#-architecture)
- [Design Tokens System](#-design-tokens-system)
- [Usage](#-usage)
- [Development](#-development)
- [Contributing](#-contributing)

## 🎯 About

**Gaming UI A11y Toolkit** is a React component library specifically designed to create accessible game interfaces. It combines accessibility best practices (WCAG) with modern gaming experience, offering complete support for:

- ⌨️ **Keyboard navigation** (arrow keys, Enter, Space, Escape)
- 🎮 **Gamepad support** (D-pad, A/B buttons via Gamepad API)
- 🔊 **Screen readers** (ARIA announcements, semantic roles)
- 🎨 **Accessible themes** (high contrast mode, color blindness)
- ♿ **WCAG compliance** (visible focus, target sizes, focus management)

This library is ideal for developing inclusive web games, accessible game menus, or any interface requiring gamepad navigation.

## ✨ Features

### Complete accessibility
- Smooth keyboard and gamepad navigation
- Voice announcements for screen readers
- Smart focus management with focus trap
- Visual focus indicators with gaming effects
- High contrast mode support

### Specialized gaming components
- Game menu with vertical navigation
- 2D inventory grid with item movement
- Health bar with color zones (healthy/warning/critical)
- Modal dialog boxes with focus trap
- Intelligently positioned tooltips
- Stylized gaming buttons

### Clean architecture
- **Clean Architecture** pattern (Domain/Application/Infrastructure/Presentation)
- Immutable and self-validating business entities
- Dependency injection for maximum testability
- Clear separation of concerns
- Strict TypeScript for type safety

### Consistent design system
- CSS design tokens for the entire visual palette
- Customizable CSS variables
- Dark and light themes
- Smooth and performant animations

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/thomaslebeau/gaming_ui_a11y_toolkit.git

# Install dependencies
cd gaming_ui_a11y_toolkit
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## 🧩 Available Components

### GameButton
Basic action button with gamepad support.

```tsx
import { GameButton } from './presentation/components/GameButton';

<GameButton onClick={handleClick} ariaLabel="Confirm">
  Confirm
</GameButton>
```

**Props:**
- `onClick`: Function called on click
- `disabled`: Disables the button
- `ariaLabel`: Accessible label
- `children`: Button content

---

### HealthBar
Visual health indicator with color-coded zones.

```tsx
import { HealthBar } from './presentation/components/HealthBar';

<HealthBar
  current={75}
  max={100}
  label="Player health"
  showValue={true}
  showPercentage={true}
/>
```

**Props:**
- `current`: Current health value
- `max`: Maximum value
- `label`: Label for accessibility
- `showValue`: Display numeric value
- `showPercentage`: Display percentage

**Color zones:**
- 🟢 **Healthy**: > 50%
- 🟡 **Warning**: 20-50%
- 🔴 **Critical**: < 20%

---

### GameMenu
Vertical menu with gamepad and keyboard navigation.

```tsx
import { GameMenu } from './presentation/components/GameMenu';

const menuItems = [
  { id: 'start', label: 'New Game', onClick: startGame },
  { id: 'load', label: 'Load Game', onClick: loadGame },
  { id: 'options', label: 'Options', onClick: showOptions },
  { id: 'quit', label: 'Quit', onClick: quitGame }
];

<GameMenu items={menuItems} ariaLabel="Main menu" />
```

**Navigation:**
- ⬆️⬇️ Arrow keys or D-pad (buttons 12/13)
- Circular navigation (wrap-around)
- Enter/Space or A button to select

---

### InventoryGrid
Sophisticated 2D inventory grid system.

```tsx
import { InventoryGrid } from './presentation/components/InventoryGrid';

const items = [
  { id: '1', name: 'Sword', icon: '⚔️', x: 0, y: 0 },
  { id: '2', name: 'Potion', icon: '🧪', x: 1, y: 0 }
];

<InventoryGrid
  columns={4}
  rows={3}
  items={items}
  onItemSelect={(item) => console.log('Selected:', item)}
  onItemMove={(item, newX, newY) => moveItem(item, newX, newY)}
  wrapNavigation={true}
/>
```

**Navigation:**
- ⬆️⬇️⬅️➡️ Arrow keys or D-pad (buttons 12-15)
- Enter/Space or A button: select/place item
- Escape or B button: cancel movement
- Voice announcements for positions and items

---

### DialogBox
Modal dialog box with focus trap.

```tsx
import { DialogBox } from './presentation/components/DialogBox';

<DialogBox
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirmation"
  content="Are you sure you want to quit?"
  characterName="System"
  actions={[
    { label: 'Yes', onClick: confirmQuit },
    { label: 'No', onClick: handleClose }
  ]}
/>
```

**Features:**
- Focus trapped within dialog
- Close with B button or Escape
- Focus restoration on close
- Body scroll prevention

---

### Tooltip
Accessible contextual tooltip.

```tsx
import { Tooltip } from './presentation/components/Tooltip';

<Tooltip content="This restores 50 health points" placement="top" delay={200}>
  <button>Potion 🧪</button>
</Tooltip>
```

**Props:**
- `content`: Tooltip content
- `placement`: Position (`top`, `bottom`, `left`, `right`)
- `delay`: Display delay in ms
- `ariaLabel`: Accessible label

## 🎣 Custom Hooks

### useGamepad
Detects and manages connected gamepads.

```tsx
import { useGamepad } from './presentation/hooks/useGamepad';

const gamepad = useGamepad((button) => {
  console.log('Button pressed:', button);
});

// gamepad.isConnected, gamepad.buttons, gamepad.axes
```

---

### useMenuNavigation
Vertical navigation for menus.

```tsx
import { useMenuNavigation } from './presentation/hooks/useMenuNavigation';

const { focusedIndex, isFocused } = useMenuNavigation(items.length);
```

---

### useInventoryGrid
Complex 2D navigation for inventory grids.

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
Focus management for modal dialogs.

```tsx
import { useDialogFocus } from './presentation/hooks/useDialogFocus';

const dialogRef = useDialogFocus(isOpen, onClose);

<div ref={dialogRef} role="dialog">...</div>
```

## 🏗️ Architecture

The project follows the **Clean Architecture** pattern with clear separation of concerns:

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

### Folder Structure

```
src/
├── domain/                     # Pure business logic
│   ├── entities/               # Immutable business objects
│   │   ├── HealthState.ts      # Health calculations
│   │   ├── MenuState.ts        # Menu navigation state
│   │   ├── InventoryState.ts   # 2D grid state
│   │   ├── GamepadState.ts     # Gamepad state
│   │   └── DialogState.ts      # Dialog state
│   └── ports/                  # Interfaces (contracts)
│       ├── IGamepadRepository.ts
│       └── IFocusRepository.ts
│
├── application/
│   └── useCases/               # Orchestrating use cases
│       ├── DetectGamepadConnection.ts
│       ├── NavigateMenu.ts
│       ├── NavigateInventoryGrid.ts
│       └── ManageDialogFocus.ts
│
├── infrastructure/
│   └── adapters/               # Concrete implementations
│       ├── BrowserGamepadAdapter.ts
│       ├── BrowserFocusAdapter.ts
│       └── BrowserInventoryAdapter.ts
│
└── presentation/               # React layer
    ├── components/             # UI components
    │   ├── GameButton/
    │   ├── HealthBar/
    │   ├── GameMenu/
    │   ├── InventoryGrid/
    │   ├── DialogBox/
    │   └── Tooltip/
    ├── hooks/                  # Custom hooks
    └── utils/                  # UI utilities
```

### Architecture Benefits

✅ **Testability**: Each layer can be tested in isolation
✅ **Maintainability**: Localized changes, low coupling
✅ **Scalability**: Easy to add new components
✅ **Independence**: Domain doesn't depend on any framework

## 🎨 Design Tokens System

The project uses a complete **CSS design tokens** system to ensure visual consistency.

### File: `src/styles/tokens.css`

```css
/* Primary colors */
--color-primary-base: #4a90e2;
--color-primary-hover: #357abd;

/* Health statuses */
--color-health-healthy: #4caf50;
--color-health-warning: #ff9800;
--color-health-critical: #f44336;

/* Typography */
--font-size-base: 16px;
--font-size-lg: 20px;
--font-weight-normal: 400;
--font-weight-bold: 700;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* Borders and focus */
--border-radius-md: 8px;
--focus-outline-width: 3px;
--focus-outline-color: var(--color-primary-base);

/* Animations */
--animation-duration-fast: 150ms;
--animation-duration-normal: 200ms;
--animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
```

### Token Categories

- **Colors**: Primary palette, statuses, neutrals, dark theme
- **Typography**: Sizes, weights, line heights, letter spacing
- **Spacing**: Scale from 0 to 40px, component presets
- **Borders**: Widths, radii, focus styles
- **Shadows**: Elevations, gaming glow effects
- **Animations**: Durations, easing functions
- **Layout**: Z-index, max widths, heights, breakpoints

## 💻 Usage

### Complete Example: Game Menu

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
      label: 'New Game',
      onClick: () => console.log('Starting...')
    },
    {
      id: 'load',
      label: 'Load Game',
      onClick: () => console.log('Loading...')
    },
    {
      id: 'options',
      label: 'Options',
      onClick: () => console.log('Options...')
    },
    {
      id: 'quit',
      label: 'Quit',
      onClick: () => setShowQuitDialog(true)
    }
  ];

  return (
    <div className="game-container">
      <h1>My Accessible Game</h1>

      {gamepad.isConnected && (
        <p>🎮 Gamepad connected</p>
      )}

      <GameMenu
        items={menuItems}
        ariaLabel="Main game menu"
      />

      <DialogBox
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        title="Quit Game"
        content="Are you sure you want to quit?"
        actions={[
          {
            label: 'Yes',
            onClick: () => window.close()
          },
          {
            label: 'No',
            onClick: () => setShowQuitDialog(false)
          }
        ]}
      />
    </div>
  );
}

export default GameApp;
```

### Example: Health System

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
        label="Player health"
        showValue={true}
        showPercentage={true}
      />

      <button onClick={() => takeDamage(20)}>
        Take damage (-20)
      </button>
      <button onClick={() => heal(30)}>
        Heal (+30)
      </button>
    </div>
  );
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Build preview
npm run preview

# Linting
npm run lint
```

### Tech Stack

- **React 19.2** - UI library with React Compiler
- **TypeScript 5.9** - Strict static typing
- **Vite (rolldown)** - Ultra-fast build tool
- **CSS Custom Properties** - Design tokens system
- **Gamepad API** - Native gamepad support
- **ARIA** - Semantic accessibility

### Tests

Components include test files:
- `HealthBar.test.tsx` - Health bar unit tests
- `Tooltip.test.tsx` - Tooltip unit tests

```bash
# Run tests (to be configured)
npm test
```

## 🤝 Contributing

Contributions are welcome! Here's how to participate:

1. **Fork** the project
2. **Create** a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Guidelines

- Respect the Clean Architecture pattern
- Write tests for new features
- Document components with JSDoc
- Follow the project's TypeScript conventions
- Ensure accessibility (WCAG 2.1 Level AA minimum)
- Test with BOTH keyboard AND gamepad

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🙏 Acknowledgments

This project was developed with the goal of making web games more accessible to all players, regardless of their abilities. Thanks to the accessibility community and game developers for their inspiration.

**Made with ❤️ for inclusion and accessibility in gaming**
