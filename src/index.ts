/**
 * Gaming UI A11y Toolkit - Main entry point
 *
 * A React component library for building accessible gaming interfaces
 * with keyboard, mouse, and gamepad support.
 *
 * @packageDocumentation
 */

// Import styles
import './styles/index.css';

// Components
export { GameButton } from './components/GameButton';
export { GameMenu } from './components/GameMenu';

// Context & Providers
export { FocusProvider } from './context/FocusProvider';
export { FocusContext } from './context/FocusContext';

// Hooks
export { useGamepadNavigation } from './hooks/useGamepadNavigation';
export { useFocusable } from './hooks/useFocusable';
export { useFocusContext } from './hooks/useFocusContext';

// Types
export type { GameButtonProps } from './types/button.types';
export type { GameMenuProps, GameMenuItem } from './types/menu.types';
export type { GamepadButton, GamepadData, GamepadConnectionEvent, StickPosition } from './types/Gamepad.type';
export type {
  FocusableElement,
  NavigationDirection,
  FocusContextValue,
  UseFocusableOptions,
  UseFocusableReturn,
  FocusProviderProps,
} from './types/focus.types';
