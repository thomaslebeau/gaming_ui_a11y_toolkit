/**
 * Gaming UI A11y Toolkit - Main entry point
 *
 * A React component library for building accessible gaming interfaces
 * with keyboard, mouse, and gamepad support.
 *
 * @packageDocumentation
 */

// Components
export { GameButton } from './components/GameButton';
export { GameMenu } from './components/GameMenu';

// Hooks
export { useGamepadNavigation } from './hooks/useGamepadNavigation';

// Types
export type { GameButtonProps } from './types/button.types';
export type { GameMenuProps, GameMenuItem } from './types/menu.types';
export type { GamepadButton, GamepadData, GamepadConnectionEvent, StickPosition } from './types/Gamepad.type';
