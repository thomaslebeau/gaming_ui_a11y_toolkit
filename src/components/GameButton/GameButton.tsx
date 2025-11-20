/**
 * Gaming UI A11y Toolkit - GameButton Component
 *
 * A fully accessible button component designed for gaming interfaces
 * WCAG 2.1 AA compliant with keyboard navigation and gamepad support
 */

import { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import type { GameButtonProps } from '../../types/button.types';
import styles from '../../styles/components/GameButton.module.css';

/**
 * GameButton - Accessible button component for gaming interfaces
 *
 * Features:
 * - WCAG 2.1 AA compliant
 * - Keyboard navigation (Enter and Space)
 * - Screen reader support with ARIA attributes
 * - High contrast gaming focus indicators
 * - Gamepad haptic feedback
 * - Visual pressed/active state
 *
 * @example
 * ```tsx
 * <GameButton
 *   label="Start Game"
 *   onClick={() => console.log('Game started!')}
 *   variant="primary"
 *   size="large"
 * />
 * ```
 */
export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  ariaDescribedBy,
  enableHapticFeedback = true,
}, ref) => {
  const [isPressed, setIsPressed] = useState(false);
  const internalRef = useRef<HTMLButtonElement>(null);
  const buttonRef = (ref as React.RefObject<HTMLButtonElement>) || internalRef;

  /**
   * Trigger haptic feedback on connected gamepad
   * Uses the Gamepad API's vibration actuator if available
   */
  const triggerHapticFeedback = useCallback(() => {
    if (!enableHapticFeedback) return;

    try {
      const gamepads = navigator.getGamepads();

      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];

        if (gamepad && 'vibrationActuator' in gamepad) {
          const actuator = gamepad.vibrationActuator as any;

          // Check if the actuator supports the 'dual-rumble' effect
          if (actuator && typeof actuator.playEffect === 'function') {
            actuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: 100,
              weakMagnitude: 0.3,
              strongMagnitude: 0.5,
            }).catch((error: Error) => {
              // Silently fail if haptic feedback is not supported
              console.debug('Haptic feedback not supported:', error.message);
            });
          }
        }
      }
    } catch (error) {
      // Gamepad API might not be available in all environments
      console.debug('Gamepad API not available:', error);
    }
  }, [enableHapticFeedback]);

  /**
   * Handle button click with haptic feedback
   */
  const handleClick = useCallback(() => {
    if (disabled) return;

    triggerHapticFeedback();
    onClick();
  }, [disabled, onClick, triggerHapticFeedback]);

  /**
   * Handle keyboard events (Enter and Space)
   * WCAG 2.1 Requirement: Keyboard accessible
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Space key should prevent default to avoid page scroll
      if (event.key === ' ') {
        event.preventDefault();
        setIsPressed(true);
      }

      // Enter key activates immediately
      if (event.key === 'Enter') {
        event.preventDefault();
        setIsPressed(true);
        handleClick();
      }
    },
    [disabled, handleClick]
  );

  /**
   * Handle keyboard key release
   */
  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Space key activates on release (native button behavior)
      if (event.key === ' ') {
        event.preventDefault();
        setIsPressed(false);
        handleClick();
      }

      // Enter key visual feedback
      if (event.key === 'Enter') {
        setIsPressed(false);
      }
    },
    [disabled, handleClick]
  );

  /**
   * Handle mouse/touch press
   */
  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
  }, [disabled]);

  /**
   * Handle mouse/touch release
   */
  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  /**
   * Handle mouse leave (cancel pressed state)
   */
  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  /**
   * Clean up pressed state if component unmounts while pressed
   */
  useEffect(() => {
    return () => {
      setIsPressed(false);
    };
  }, []);

  /**
   * Generate CSS classes based on props
   */
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    isPressed ? styles.pressed : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled}
      aria-label={label}
      aria-describedby={ariaDescribedBy}
      aria-pressed={isPressed}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
});

GameButton.displayName = 'GameButton';

export default GameButton;
