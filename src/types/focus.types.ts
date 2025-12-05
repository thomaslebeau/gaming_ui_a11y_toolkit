/**
 * Gaming UI A11y Toolkit - Focus Management Types
 *
 * Type definitions for the global focus management system
 */

/**
 * Gaming UI A11y Toolkit - Focus Management Types
 *
 * Type definitions for the global focus management system
 */
import type { ReactNode } from 'react';

/**
 * Direction of navigation
 */
export type NavigationDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Represents a focusable element in the focus management system
 */
export interface FocusableElement {
  /** Unique identifier for the element */
  id: string;

  /** Reference to the DOM element */
  ref: React.RefObject<HTMLElement | null>;

  /** Optional group identifier for logical grouping */
  group?: string;

  /** Current position of the element */
  position: DOMRect;

  /** Callback when element is activated (e.g., button pressed) */
  onActivate?: () => void;

  /**
   * Callback when navigation occurs
   * Return true to prevent default navigation behavior
   */
  onNavigate?: (direction: NavigationDirection) => boolean;

  /** Whether the element is disabled */
  disabled?: boolean;

  /** Priority for navigation ordering (higher = higher priority) */
  priority?: number;
}

/**
 * Context value for the focus management system
 */
export interface FocusContextValue {
  // State
  /** ID of the currently focused element */
  focusedId: string | null;

  /** Whether a gamepad is currently connected */
  isGamepadConnected: boolean;

  // Registration
  /** Register a new focusable element */
  registerElement: (element: FocusableElement) => void;

  /** Unregister a focusable element */
  unregisterElement: (id: string) => void;

  /** Update an element's position */
  updateElementPosition: (id: string, position: DOMRect) => void;

  // Focus management
  /** Set focus to a specific element by ID */
  setFocus: (id: string) => void;

  /** Focus the next element in sequential order */
  focusNext: () => void;

  /** Focus the previous element in sequential order */
  focusPrevious: () => void;

  // Spatial navigation
  /** Navigate up */
  navigateUp: () => void;

  /** Navigate down */
  navigateDown: () => void;

  /** Navigate left */
  navigateLeft: () => void;

  /** Navigate right */
  navigateRight: () => void;

  /** Activate the currently focused element */
  activate: () => void;
}

/**
 * Options for the useFocusable hook
 */
export interface UseFocusableOptions {
  /** Unique identifier for this focusable element */
  id: string;

  /** Optional group identifier */
  group?: string;

  /** Callback when element is activated */
  onActivate?: () => void;

  /** Callback when navigation occurs from this element */
  onNavigate?: (direction: NavigationDirection) => boolean;

  /** Whether the element is disabled */
  disabled?: boolean;

  /** Automatically focus this element on mount */
  autoFocus?: boolean;

  /** Priority for navigation ordering */
  priority?: number;
}

/**
 * Return value from the useFocusable hook
 */
export interface UseFocusableReturn {
  /** Whether this element is currently focused */
  isFocused: boolean;

  /** Props to spread onto the focusable element */
  focusProps: {
    ref: React.RefCallback<HTMLElement>;
    'data-focusable-id': string;
    'data-focused': boolean;
    'aria-current'?: 'true';
    tabIndex: number;
    onFocus: () => void;
    onClick: () => void;
  };

  /** Programmatically focus this element */
  focus: () => void;
}

/**
 * Props for the FocusProvider component
 */
export interface FocusProviderProps {
  /** Child components */
  children: ReactNode;

  /**
   * Enable haptic feedback on navigation
   * @default true
   */
  enableHapticFeedback?: boolean;

  /**
   * Joystick deadzone threshold (0-1)
   * @default 0.5
   */
  joystickDeadzone?: number;

  /**
   * Navigation mode
   * - 'spatial': Navigate based on element positions (default)
   * - 'sequential': Navigate in DOM order
   * @default 'spatial'
   */
  navigationMode?: 'spatial' | 'sequential';

  /**
   * Delay between navigation inputs in ms
   * @default 150
   */
  navigationDelay?: number;
}
