/**
 * Gaming UI A11y Toolkit - Button Types
 *
 * Type definitions for accessible gaming button components
 */

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface GameButtonProps {
  /**
   * Button label text - also used as aria-label
   */
  label: string;

  /**
   * Click handler function
   */
  onClick: () => void;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size variant
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Optional CSS class name for additional styling
   */
  className?: string;

  /**
   * Optional aria-describedby ID for additional context
   */
  ariaDescribedBy?: string;

  /**
   * Enable haptic/vibration feedback for gamepad
   * @default true
   */
  enableHapticFeedback?: boolean;
}
