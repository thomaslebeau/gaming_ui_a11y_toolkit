/**
 * Gaming UI A11y Toolkit - Focus Provider
 *
 * Provider component for global focus management system
 * Handles gamepad input, spatial navigation, and focus state
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FocusContext } from "./FocusContext";
import type {
  FocusableElement,
  FocusProviderProps,
  FocusContextValue,
  NavigationDirection,
} from "../types/focus.types";
import {
  findClosestElement,
  findNextSequential,
  findPreviousSequential,
} from "../utils/spatialNavigation";

/**
 * Standard gamepad button indices
 */
const GAMEPAD_BUTTONS = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  SELECT: 8,
  START: 9,
  L_STICK: 10,
  R_STICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
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
 * Global focus management provider
 *
 * Wraps your application to enable global focus navigation
 * with gamepad and keyboard support
 */
export const FocusProvider: React.FC<FocusProviderProps> = ({
  children,
  enableHapticFeedback = true,
  joystickDeadzone = 0.5,
  navigationMode = "spatial",
  navigationDelay = 150,
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isGamepadConnected, setIsGamepadConnected] = useState(false);

  // Store all registered focusable elements
  const elementsRef = useRef<Map<string, FocusableElement>>(new Map());

  // Track button states to detect press/release
  const previousButtonStates = useRef<Map<number, boolean>>(new Map());

  // Track joystick state to prevent repeated navigation
  const previousAxisDirection = useRef<NavigationDirection | null>(null);

  // Track last navigation time for debouncing
  const lastNavigationTime = useRef<number>(0);

  useEffect(() => {
    if (focusedId === null && elementsRef.current.size > 0) {
      const firstElement = Array.from(elementsRef.current.values())[0];
      if (firstElement && !firstElement.disabled) {
        setFocusedId(firstElement.id);
      }
    }
  }, [focusedId]);

  /**
   * Trigger haptic feedback on connected gamepads
   */
  const triggerHapticFeedback = useCallback(
    (intensity: number = 0.3) => {
      if (!enableHapticFeedback) return;

      try {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          const gamepad = gamepads[i];
          if (gamepad && "vibrationActuator" in gamepad) {
            const actuator = gamepad.vibrationActuator as any;
            if (actuator && typeof actuator.playEffect === "function") {
              actuator
                .playEffect("dual-rumble", {
                  startDelay: 0,
                  duration: 50,
                  weakMagnitude: intensity,
                  strongMagnitude: intensity * 0.7,
                })
                .catch(() => {
                  // Silently fail if haptic not supported
                });
            }
          }
        }
      } catch (error) {
        // Gamepad API might not be available
      }
    },
    [enableHapticFeedback]
  );

  /**
   * Register a new focusable element
   */
  const registerElement = useCallback((element: FocusableElement) => {
    elementsRef.current.set(element.id, element);
  }, []);

  /**
   * Unregister a focusable element
   */
  const unregisterElement = useCallback((id: string) => {
    elementsRef.current.delete(id);

    // If we just unregistered the focused element, clear focus
    setFocusedId((current) => (current === id ? null : current));
  }, []);

  /**
   * Update an element's position
   */
  const updateElementPosition = useCallback((id: string, position: DOMRect) => {
    const element = elementsRef.current.get(id);
    if (element) {
      elementsRef.current.set(id, { ...element, position });
    }
  }, []);

  /**
   * Set focus to a specific element
   */
  const setFocus = useCallback(
    (id: string) => {
      const element = elementsRef.current.get(id);
      if (element && !element.disabled) {
        setFocusedId(id);

        // Scroll element into view if needed
        if (element.ref.current) {
          element.ref.current.focus({ preventScroll: false });
        }

        triggerHapticFeedback(0.2);
      }
    },
    [triggerHapticFeedback]
  );

  /**
   * Navigate in a specific direction
   */
  const navigateInDirection = useCallback(
    (direction: NavigationDirection) => {
      const now = Date.now();
      if (now - lastNavigationTime.current < navigationDelay) {
        return;
      }

      const currentElement = focusedId
        ? elementsRef.current.get(focusedId) ?? null
        : null;

      // Allow element to handle navigation first
      if (currentElement?.onNavigate?.(direction)) {
        return; // Element handled it
      }

      let nextElement: FocusableElement | null = null;

      if (navigationMode === "spatial") {
        nextElement = findClosestElement(
          currentElement,
          direction,
          elementsRef.current
        );
      } else {
        // Sequential mode: map directions to next/previous
        if (direction === "down" || direction === "right") {
          nextElement = findNextSequential(focusedId, elementsRef.current);
        } else {
          nextElement = findPreviousSequential(focusedId, elementsRef.current);
        }
      }

      if (nextElement) {
        lastNavigationTime.current = now;
        setFocus(nextElement.id);
      }
    },
    [focusedId, navigationMode, setFocus, navigationDelay]
  );

  /**
   * Focus next element in sequential order
   */
  const focusNext = useCallback(() => {
    const nextElement = findNextSequential(focusedId, elementsRef.current);
    if (nextElement) {
      setFocus(nextElement.id);
    }
  }, [focusedId, setFocus]);

  /**
   * Focus previous element in sequential order
   */
  const focusPrevious = useCallback(() => {
    const prevElement = findPreviousSequential(focusedId, elementsRef.current);
    if (prevElement) {
      setFocus(prevElement.id);
    }
  }, [focusedId, setFocus]);

  /**
   * Navigation direction callbacks
   */
  const navigateUp = useCallback(
    () => navigateInDirection("up"),
    [navigateInDirection]
  );
  const navigateDown = useCallback(
    () => navigateInDirection("down"),
    [navigateInDirection]
  );
  const navigateLeft = useCallback(
    () => navigateInDirection("left"),
    [navigateInDirection]
  );
  const navigateRight = useCallback(
    () => navigateInDirection("right"),
    [navigateInDirection]
  );

  /**
   * Activate the currently focused element
   */
  const activate = useCallback(() => {
    const element = focusedId ? elementsRef.current.get(focusedId) : null;
    if (element) {
      triggerHapticFeedback(0.5);
      element.onActivate?.();
      element.ref.current?.click();
    }
  }, [focusedId, triggerHapticFeedback]);

  /**
   * Handle a specific gamepad button
   */
  const handleButton = useCallback(
    (gamepad: Gamepad, buttonIndex: number, action: () => void) => {
      const isPressed = gamepad.buttons[buttonIndex]?.pressed || false;
      const wasPressed = previousButtonStates.current.get(buttonIndex) || false;

      if (isPressed && !wasPressed) {
        action();
      }

      previousButtonStates.current.set(buttonIndex, isPressed);
    },
    []
  );

  /**
   * Handle joystick navigation
   */
  const handleStick = useCallback(
    (gamepad: Gamepad) => {
      const xAxis = gamepad.axes[GAMEPAD_AXES.LEFT_STICK_X] || 0;
      const yAxis = gamepad.axes[GAMEPAD_AXES.LEFT_STICK_Y] || 0;

      let currentDirection: NavigationDirection | null = null;

      // Determine primary direction based on which axis has larger absolute value
      if (Math.abs(xAxis) > Math.abs(yAxis)) {
        // Horizontal movement
        if (xAxis < -joystickDeadzone) {
          currentDirection = "left";
        } else if (xAxis > joystickDeadzone) {
          currentDirection = "right";
        }
      } else {
        // Vertical movement
        if (yAxis < -joystickDeadzone) {
          currentDirection = "up";
        } else if (yAxis > joystickDeadzone) {
          currentDirection = "down";
        }
      }

      // Only navigate if direction changed
      if (currentDirection !== previousAxisDirection.current) {
        if (currentDirection) {
          navigateInDirection(currentDirection);
        }
        previousAxisDirection.current = currentDirection;
      }
    },
    [joystickDeadzone, navigateInDirection]
  );

  /**
   * Gamepad polling loop
   */
  useEffect(() => {
    let animationId: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      let hasGamepad = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        hasGamepad = true;

        // D-Pad navigation
        handleButton(gamepad, GAMEPAD_BUTTONS.DPAD_UP, navigateUp);
        handleButton(gamepad, GAMEPAD_BUTTONS.DPAD_DOWN, navigateDown);
        handleButton(gamepad, GAMEPAD_BUTTONS.DPAD_LEFT, navigateLeft);
        handleButton(gamepad, GAMEPAD_BUTTONS.DPAD_RIGHT, navigateRight);

        // A button for activation
        handleButton(gamepad, GAMEPAD_BUTTONS.A, activate);

        // Left stick navigation
        handleStick(gamepad);
      }

      setIsGamepadConnected(hasGamepad);
      animationId = requestAnimationFrame(pollGamepad);
    };

    animationId = requestAnimationFrame(pollGamepad);

    return () => cancelAnimationFrame(animationId);
  }, [
    handleButton,
    handleStick,
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight,
    activate,
  ]);

  /**
   * Handle gamepad connection events
   */
  useEffect(() => {
    const handleGamepadConnected = () => {
      setIsGamepadConnected(true);
    };

    const handleGamepadDisconnected = () => {
      const gamepads = navigator.getGamepads();
      const hasGamepad = Array.from(gamepads).some((gp) => gp !== null);
      setIsGamepadConnected(hasGamepad);
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
    };
  }, []);

  /**
   * Keyboard navigation support
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation if we have focused elements
      if (elementsRef.current.size === 0) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          navigateUp();
          break;
        case "ArrowDown":
          event.preventDefault();
          navigateDown();
          break;
        case "ArrowLeft":
          event.preventDefault();
          navigateLeft();
          break;
        case "ArrowRight":
          event.preventDefault();
          navigateRight();
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          activate();
          break;
        case "Tab":
          event.preventDefault();
          if (event.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight,
    activate,
    focusNext,
    focusPrevious,
  ]);

  const value: FocusContextValue = useMemo(
    () => ({
      focusedId,
      isGamepadConnected,
      registerElement,
      unregisterElement,
      updateElementPosition,
      setFocus,
      focusNext,
      focusPrevious,
      navigateUp,
      navigateDown,
      navigateLeft,
      navigateRight,
      activate,
    }),
    [
      focusedId,
      isGamepadConnected,
      registerElement,
      unregisterElement,
      updateElementPosition,
      setFocus,
      focusNext,
      focusPrevious,
      navigateUp,
      navigateDown,
      navigateLeft,
      navigateRight,
      activate,
    ]
  );

  return (
    <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
  );
};
