/**
 * Gaming UI A11y Toolkit - Menu Types
 *
 * Type definitions for accessible gaming menu components
 */

export interface GameMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string;

  /**
   * Display label for the menu item
   */
  label: string;

  /**
   * Action to execute when the item is selected
   */
  onSelect: () => void;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional icon or prefix content
   */
  icon?: string;
}

export interface GameMenuProps {
  /**
   * Array of menu items to display
   */
  items: GameMenuItem[];

  /**
   * Title of the menu
   */
  title?: string;

  /**
   * Initial selected index
   * @default 0
   */
  initialSelectedIndex?: number;

  /**
   * Enable haptic feedback for gamepad
   * @default true
   */
  enableHapticFeedback?: boolean;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (index: number) => void;

  /**
   * Optional CSS class name
   */
  className?: string;

  /**
   * Joystick deadzone threshold (0-1)
   * @default 0.5
   */
  joystickDeadzone?: number;
}

export interface GamepadNavigationState {
  /**
   * Currently selected menu item index
   */
  selectedIndex: number;

  /**
   * Whether a gamepad is connected
   */
  isGamepadConnected: boolean;
}
