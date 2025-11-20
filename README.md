# 🎮 Gaming UI A11y Toolkit

> An accessible React component library for building inclusive game interfaces with keyboard, mouse, and gamepad support.

[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/gaming-ui-a11y-toolkit)](https://www.npmjs.com/package/gaming-ui-a11y-toolkit)

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Installation](#-installation)
- [Available Components](#-available-components)
- [Custom Hooks](#-custom-hooks)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 About

**Gaming UI A11y Toolkit** is a React component library specifically designed to create accessible game interfaces. It combines accessibility best practices (WCAG 2.1 AA) with modern gaming experience, offering complete support for:

- ⌨️ **Keyboard navigation** (arrow keys, Enter, Space, Escape)
- 🎮 **Gamepad support** (D-pad, A/B buttons via Gamepad API)
- 🕹️ **Joystick navigation** (left analog stick)
- 🔊 **Screen readers** (ARIA announcements, semantic roles)
- ♿ **WCAG 2.1 AA compliance** (visible focus, focus management)
- 📳 **Haptic feedback** (gamepad vibration)

This library is ideal for developing inclusive web games, accessible game menus, or any interface requiring gamepad navigation.

## ✨ Features

### Complete Accessibility
- Smooth keyboard and gamepad navigation
- Voice announcements for screen readers
- Intelligent focus management
- Visual focus indicators with gaming effects
- Gamepad haptic feedback support

### Specialized Gaming Components
- Game button with haptic feedback
- Game menu with vertical navigation (D-pad and joystick)
- Full Gamepad API support
- Automatic gamepad connection detection

### Clean Architecture
- Strict TypeScript for type safety
- Reusable and composable components
- Custom hooks for business logic
- Unit tests included

### Consistent Design System
- CSS tokens for complete visual palette
- Customizable CSS variables
- Light and dark themes
- Smooth and performant animations

## 📦 Installation

```bash
npm install gaming-ui-a11y-toolkit
```

or with yarn:

```bash
yarn add gaming-ui-a11y-toolkit
```

or with pnpm:

```bash
pnpm add gaming-ui-a11y-toolkit
```

## 🧩 Available Components

### GameButton

Basic action button with gamepad support and haptic feedback.

```tsx
import { GameButton } from 'gaming-ui-a11y-toolkit';

<GameButton
  label="Start"
  onClick={handleClick}
  variant="primary"
  size="large"
/>
```

**Features:**
- WCAG 2.1 AA compliant
- Keyboard navigation (Enter and Space)
- Screen reader support
- Gamepad haptic feedback
- Visual states (pressed, disabled, focused)

---

### GameMenu

Vertical menu with keyboard, D-pad, and analog joystick navigation.

```tsx
import { GameMenu } from 'gaming-ui-a11y-toolkit';

const menuItems = [
  { id: 'start', label: 'New Game', onSelect: startGame },
  { id: 'load', label: 'Load Game', onSelect: loadGame },
  { id: 'options', label: 'Options', onSelect: showOptions },
  { id: 'quit', label: 'Quit', onSelect: quitGame }
];

<GameMenu
  title="Main Menu"
  items={menuItems}
  enableHapticFeedback={true}
/>
```

**Navigation:**
- ⬆️⬇️ Arrow keys to navigate
- 🎮 D-pad (buttons 12/13) to navigate
- 🕹️ Left joystick (Y axis) to navigate
- Enter/Space or A button to select
- Home/End to jump to start/end
- Visual gamepad connected indicator

## 🎣 Custom Hooks

### useGamepadNavigation

Manages keyboard and gamepad navigation for menus.

```tsx
import { useGamepadNavigation } from 'gaming-ui-a11y-toolkit';

const { selectedIndex, isGamepadConnected, setSelectedIndex } = useGamepadNavigation({
  itemCount: items.length,
  initialIndex: 0,
  onSelectionChange: (index) => console.log('Selected:', index),
  onActivate: (index) => console.log('Activated:', index),
  enableHapticFeedback: true,
  joystickDeadzone: 0.5
});
```

**Features:**
- Automatic gamepad detection
- D-pad support (buttons 12/13)
- Left joystick support with configurable deadzone
- Haptic feedback on selection change
- Activation with A button (button 0)

## 💻 Usage

### Complete Example: Game Menu

```tsx
import { useState } from 'react';
import { GameMenu } from 'gaming-ui-a11y-toolkit';

function GameApp() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');

  const menuItems = [
    {
      id: 'start',
      label: 'New Game',
      icon: '🎮',
      onSelect: () => setGameState('playing')
    },
    {
      id: 'load',
      label: 'Load Game',
      icon: '💾',
      onSelect: () => console.log('Loading...')
    },
    {
      id: 'options',
      label: 'Options',
      icon: '⚙️',
      onSelect: () => console.log('Options...')
    },
    {
      id: 'quit',
      label: 'Quit',
      icon: '🚪',
      onSelect: () => window.close()
    }
  ];

  return (
    <div className="game-container">
      <h1>My Accessible Game</h1>

      {gameState === 'menu' && (
        <GameMenu
          title="Main Menu"
          items={menuItems}
          enableHapticFeedback={true}
          onSelectionChange={(index) => {
            console.log('Navigating to:', menuItems[index].label);
          }}
        />
      )}

      {gameState === 'playing' && (
        <div>
          <h2>Game in progress...</h2>
          <button onClick={() => setGameState('menu')}>
            Back to menu
          </button>
        </div>
      )}
    </div>
  );
}

export default GameApp;
```

### Example: Action Buttons

```tsx
import { GameButton } from 'gaming-ui-a11y-toolkit';

function ActionButtons() {
  return (
    <div className="button-group">
      <GameButton
        label="Attack"
        onClick={() => console.log('Attack!')}
        variant="primary"
        size="large"
        enableHapticFeedback={true}
      />

      <GameButton
        label="Defend"
        onClick={() => console.log('Defend!')}
        variant="secondary"
        size="medium"
      />

      <GameButton
        label="Disabled Action"
        onClick={() => {}}
        disabled={true}
      />
    </div>
  );
}
```

### Importing Styles

Don't forget to import the CSS file in your application:

```tsx
// In your main entry file (e.g., main.tsx or App.tsx)
import 'gaming-ui-a11y-toolkit/dist/style.css';
```

## 📚 API Reference

### GameButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | **required** | Button text (also used for aria-label) |
| `onClick` | `() => void` | **required** | Click handler function |
| `disabled` | `boolean` | `false` | Disables the button |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual variant of the button |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `className` | `string` | `''` | Additional CSS class names |
| `enableHapticFeedback` | `boolean` | `true` | Enable haptic feedback on gamepad |
| `ariaDescribedBy` | `string` | - | ID of element that describes this button |

### GameMenu Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `GameMenuItem[]` | **required** | Array of menu items |
| `title` | `string` | - | Menu title |
| `initialSelectedIndex` | `number` | `0` | Initial selected index |
| `enableHapticFeedback` | `boolean` | `true` | Enable haptic feedback |
| `onSelectionChange` | `(index: number) => void` | - | Callback when selection changes |
| `className` | `string` | `''` | Additional CSS class names |
| `joystickDeadzone` | `number` | `0.5` | Joystick deadzone (0-1) |

### GameMenuItem Type

```typescript
interface GameMenuItem {
  id: string;              // Unique identifier
  label: string;           // Display text
  onSelect: () => void;    // Action on activation
  disabled?: boolean;      // Disable the item
  icon?: string;           // Optional icon
}
```

### useGamepadNavigation Options

```typescript
interface UseGamepadNavigationOptions {
  itemCount: number;                          // Total number of items
  initialIndex?: number;                      // Initial index (default: 0)
  onSelectionChange?: (index: number) => void; // Selection change callback
  onActivate?: (index: number) => void;        // Activation callback
  enableHapticFeedback?: boolean;              // Haptic feedback (default: true)
  joystickDeadzone?: number;                   // Deadzone (default: 0.5)
}
```

### useGamepadNavigation Return Value

```typescript
interface UseGamepadNavigationReturn {
  selectedIndex: number;           // Currently selected index
  isGamepadConnected: boolean;     // Gamepad connection status
  setSelectedIndex: (index: number) => void; // Manually set index
}
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Local Installation

```bash
# Clone the repository
git clone https://github.com/thomaslebeau/gaming_ui_a11y_toolkit.git
cd gaming_ui_a11y_toolkit

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Project Structure

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
│   ├── styles/
│   │   └── components/
│   └── index.ts
├── dist/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Tech Stack

- **React 19.2** - UI library with React Compiler
- **TypeScript 5.9** - Strict static typing
- **Vite (rolldown)** - Ultra-fast build tool
- **CSS Modules** - Scoped component styles
- **Gamepad API** - Native gamepad support
- **ARIA** - Semantic accessibility

## 🤝 Contributing

Contributions are welcome! Here's how to participate:

1. **Fork** the project
2. **Create** a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the project's TypeScript conventions
- Write tests for new features
- Document components with JSDoc
- Ensure accessibility (WCAG 2.1 AA minimum)
- Test with BOTH keyboard AND gamepad
- Follow Clean Code principles

## 🐛 Reporting Bugs

If you find a bug, please [open an issue](https://github.com/thomaslebeau/gaming_ui_a11y_toolkit/issues) with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (browser, OS, version)

## 🗺️ Roadmap

Features planned for future releases:

- [ ] HealthBar - Health bar with colored zones
- [ ] InventoryGrid - Navigable 2D inventory grid
- [ ] DialogBox - Modal dialog with focus trap
- [ ] Tooltip - Accessible contextual tooltips
- [ ] useDialogFocus - Hook for modal focus management
- [ ] useInventoryGrid - Hook for 2D navigation
- [ ] Customizable theme support
- [ ] More accessible gaming components

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project was developed with the goal of making web games more accessible to all players, regardless of their abilities. Thanks to the accessibility community and game developers for their inspiration.

## 📞 Contact

Thomas Lebeau - [@thomaslebeau](https://github.com/thomaslebeau)

Project Link: [https://github.com/thomaslebeau/gaming_ui_a11y_toolkit](https://github.com/thomaslebeau/gaming_ui_a11y_toolkit)

---

**Made with ❤️ for inclusion and accessibility in gaming**
