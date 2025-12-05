/**
 * Gaming UI A11y Toolkit - Gamepad Navigation Hook
 *
 * Custom hook for handling gamepad navigation in menus
 * Supports D-Pad and left joystick navigation
 * Now supports both vertical and horizontal navigation!
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseGamepadNavigationProps {
  /**
   * Total number of items in the menu
   */
  itemCount: number;

  /**
   * Initial selected index
   * @default 0
   */
  initialIndex?: number;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (index: number) => void;

  /**
   * Callback when item is activated (A button pressed)
   */
  onActivate?: (index: number) => void;

  onConfirm?: (index: number) => void;

  /**
   * Enable haptic feedback
   * @default true
   */
  enableHapticFeedback?: boolean;

  /**
   * Joystick deadzone threshold (0-1)
   * @default 0.5
   */
  joystickDeadzone?: number;

  /**
   * Delay between navigation inputs in ms (to prevent rapid scrolling)
   * @default 200
   */
  navigationDelay?: number;

  /**
   * Navigation direction - determines which buttons/axes to use
   * - 'vertical': UP/DOWN (D-Pad up/down, left stick Y-axis)
   * - 'horizontal': LEFT/RIGHT (D-Pad left/right, left stick X-axis)
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal';
}

interface UseGamepadNavigationReturn {
  selectedIndex: number;
  isGamepadConnected: boolean;
  setSelectedIndex: (index: number) => void;
}

/**
 * Standard gamepad button indices (based on standard mapping)
 */
const GAMEPAD_BUTTONS = {
  A: 0,           // Bottom button (A on Xbox, Cross on PlayStation)
  B: 1,           // Right button (B on Xbox, Circle on PlayStation)
  X: 2,           // Left button (X on Xbox, Square on PlayStation)
  Y: 3,           // Top button (Y on Xbox, Triangle on PlayStation)
  LB: 4,          // Left bumper
  RB: 5,          // Right bumper
  LT: 6,          // Left trigger
  RT: 7,          // Right trigger
  SELECT: 8,      // Select/Back
  START: 9,       // Start
  L_STICK: 10,    // Left stick button
  R_STICK: 11,    // Right stick button
  DPAD_UP: 12,    // D-Pad Up
  DPAD_DOWN: 13,  // D-Pad Down
  DPAD_LEFT: 14,  // D-Pad Left
  DPAD_RIGHT: 15, // D-Pad Right
};

/**
 * Gamepad axes indices
 */
const GAMEPAD_AXES = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
};

/**
 * Hook for gamepad navigation
 */
export const useGamepadNavigation = ({
  itemCount,
  initialIndex = 0,
  onSelectionChange,
  onActivate,
  onConfirm,
  enableHapticFeedback = true,
  joystickDeadzone = 0.5,
  navigationDelay = 200,
  direction = 'vertical',
}: UseGamepadNavigationProps): UseGamepadNavigationReturn => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);
  const lastNavigationTime = useRef<number>(0);
  const previousButtonStates = useRef<Map<number, boolean>>(new Map());
  const previousAxisDirection = useRef<'previous' | 'next' | null>(null);

  /**
   * Trigger haptic feedback on gamepad
   */
  const triggerHapticFeedback = useCallback((intensity: number = 0.3) => {
    if (!enableHapticFeedback) return;

    try {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad && 'vibrationActuator' in gamepad) {
          const actuator = gamepad.vibrationActuator as any;
          if (actuator && typeof actuator.playEffect === 'function') {
            actuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: 50,
              weakMagnitude: intensity,
              strongMagnitude: intensity * 0.7,
            }).catch(() => {
              // Silently fail if haptic not supported
            });
          }
        }
      }
    } catch (error) {
      // Gamepad API might not be available
    }
  }, [enableHapticFeedback]);

  /**
   * Navigate to a specific index with bounds checking
   */
  const navigateToIndex = useCallback((newIndex: number) => {
    const now = Date.now();
    if (now - lastNavigationTime.current < navigationDelay) {
      return;
    }

    // Clamp index to valid range
    const clampedIndex = Math.max(0, Math.min(itemCount - 1, newIndex));

    if (clampedIndex !== selectedIndex) {
      lastNavigationTime.current = now;
      setSelectedIndex(clampedIndex);
      triggerHapticFeedback(0.2);
      onSelectionChange?.(clampedIndex);
    }
  }, [selectedIndex, itemCount, onSelectionChange, triggerHapticFeedback, navigationDelay]);

  /**
   * Move selection to previous item
   */
  const movePrevious = useCallback(() => {
    navigateToIndex(selectedIndex - 1);
  }, [selectedIndex, navigateToIndex]);

  /**
   * Move selection to next item
   */
  const moveNext = useCallback(() => {
    navigateToIndex(selectedIndex + 1);
  }, [selectedIndex, navigateToIndex]);

  /**
   * Activate current item
   */
  const activateCurrentItem = useCallback(() => {
    triggerHapticFeedback(0.5);
    onActivate?.(selectedIndex);
  }, [selectedIndex, onActivate, triggerHapticFeedback]);

  /**
   * Poll gamepad state
   */
  useEffect(() => {
    let animationId: number;

    // Determine which buttons and axes to use based on direction
    const previousButton = direction === 'horizontal' 
      ? GAMEPAD_BUTTONS.DPAD_LEFT 
      : GAMEPAD_BUTTONS.DPAD_UP;
    
    const nextButton = direction === 'horizontal'
      ? GAMEPAD_BUTTONS.DPAD_RIGHT
      : GAMEPAD_BUTTONS.DPAD_DOWN;

    const stickAxis = direction === 'horizontal'
      ? GAMEPAD_AXES.LEFT_STICK_X
      : GAMEPAD_AXES.LEFT_STICK_Y;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      let hasActiveGamepad = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        hasActiveGamepad = true;

        // Check D-Pad Previous button (UP or LEFT)
        const prevButtonPressed = gamepad.buttons[previousButton]?.pressed || false;
        const wasPrevButtonPressed = previousButtonStates.current.get(previousButton) || false;
        if (prevButtonPressed && !wasPrevButtonPressed) {
          movePrevious();
        }
        previousButtonStates.current.set(previousButton, prevButtonPressed);

        // Check D-Pad Next button (DOWN or RIGHT)
        const nextButtonPressed = gamepad.buttons[nextButton]?.pressed || false;
        const wasNextButtonPressed = previousButtonStates.current.get(nextButton) || false;
        if (nextButtonPressed && !wasNextButtonPressed) {
          moveNext();
        }
        previousButtonStates.current.set(nextButton, nextButtonPressed);

        // Check A button (activate)
        const aButtonPressed = gamepad.buttons[GAMEPAD_BUTTONS.A]?.pressed || false;
        const wasAButtonPressed = previousButtonStates.current.get(GAMEPAD_BUTTONS.A) || false;
        if (aButtonPressed && !wasAButtonPressed) {
          activateCurrentItem();
        }
        previousButtonStates.current.set(GAMEPAD_BUTTONS.A, aButtonPressed);

         if (onConfirm) {
          const startPressed = gamepad.buttons[GAMEPAD_BUTTONS.START]?.pressed || false;
          const wasStartPressed = previousButtonStates.current.get(GAMEPAD_BUTTONS.START) || false;
          if (startPressed && !wasStartPressed) {
            triggerHapticFeedback(0.5);
            onConfirm(selectedIndex);
          }
          previousButtonStates.current.set(GAMEPAD_BUTTONS.START, startPressed);
        }

        // Check joystick axis (Y-axis for vertical, X-axis for horizontal)
        const axisValue = gamepad.axes[stickAxis] || 0;

        if (axisValue < -joystickDeadzone) {
          // Stick pushed in "previous" direction (up for vertical, left for horizontal)
          if (previousAxisDirection.current !== 'previous') {
            previousAxisDirection.current = 'previous';
            movePrevious();
          }
        } else if (axisValue > joystickDeadzone) {
          // Stick pushed in "next" direction (down for vertical, right for horizontal)
          if (previousAxisDirection.current !== 'next') {
            previousAxisDirection.current = 'next';
            moveNext();
          }
        } else {
          // Stick in neutral position
          previousAxisDirection.current = null;
        }
      }

      setIsGamepadConnected(hasActiveGamepad);
      animationId = requestAnimationFrame(pollGamepad);
    };

    // Start polling
    animationId = requestAnimationFrame(pollGamepad);

    // Handle gamepad connection events
    const handleGamepadConnected = () => {
      setIsGamepadConnected(true);
    };

    const handleGamepadDisconnected = () => {
      const gamepads = navigator.getGamepads();
      const hasGamepad = Array.from(gamepads).some(gp => gp !== null);
      setIsGamepadConnected(hasGamepad);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [movePrevious, moveNext, activateCurrentItem, joystickDeadzone, direction, onConfirm]);

  return {
    selectedIndex,
    isGamepadConnected,
    setSelectedIndex,
  };
};