import { useEffect, useState, useCallback, useRef } from 'react';
import { QTEState } from '../../domain/entities/QTEState';
import { ExecuteQTE } from '../../application/useCases/ExecuteQTE';
import { BrowserTimerAdapter } from '../../infrastructure/adapters/BrowserTimerAdapter';

interface UseQTEOptions {
  buttonPrompt: 'A' | 'B' | 'X' | 'Y' | 'Space' | 'Enter';
  duration: number; // milliseconds
  onSuccess: () => void;
  onFailure: () => void;
  difficulty?: 'easy' | 'normal' | 'hard';
  practiceMode?: boolean;
  autoStart?: boolean;
}

// Hook acts as a controller - bridges React with use cases
export const useQTE = ({
  buttonPrompt,
  duration,
  onSuccess,
  onFailure,
  difficulty = 'normal',
  practiceMode = false,
  autoStart = true,
}: UseQTEOptions) => {
  // Apply difficulty multiplier to duration
  const adjustedDuration = duration * QTEState.getDifficultyMultiplier(difficulty);

  // Initialize QTE state
  const [qteState, setQteState] = useState<QTEState>(() =>
    QTEState.createIdle(buttonPrompt, adjustedDuration, practiceMode)
  );

  // Track if callbacks have been invoked to prevent duplicates
  const callbacksInvokedRef = useRef(false);

  // Manual start function (for non-autostart scenarios)
  const startQTE = useCallback(() => {
    if (qteState.status === 'idle') {
      const activeState = qteState.start();
      setQteState(activeState);
      callbacksInvokedRef.current = false;
    }
  }, [qteState]);

  // Reset function to restart the QTE
  const resetQTE = useCallback(() => {
    const newState = QTEState.createIdle(buttonPrompt, adjustedDuration, practiceMode);
    setQteState(newState);
    callbacksInvokedRef.current = false;

    if (autoStart) {
      // Start automatically after a brief delay
      setTimeout(() => {
        setQteState((prev) => (prev.status === 'idle' ? prev.start() : prev));
      }, 100);
    }
  }, [buttonPrompt, adjustedDuration, practiceMode, autoStart]);

  // Execute QTE use case with timer
  useEffect(() => {
    // Only start timer if state is active
    if (qteState.status !== 'active') {
      return;
    }

    // Dependency injection: create adapter and use case
    const adapter = new BrowserTimerAdapter();
    const useCase = new ExecuteQTE(adapter);

    // Execute use case with callbacks
    const cleanup = useCase.execute(
      qteState,
      // On tick - update state
      (newState) => {
        setQteState(newState);
      },
      // On success
      () => {
        if (!callbacksInvokedRef.current) {
          callbacksInvokedRef.current = true;
          onSuccess();
        }
      },
      // On failure
      () => {
        if (!callbacksInvokedRef.current) {
          callbacksInvokedRef.current = true;
          onFailure();
        }
      }
    );

    // Cleanup on unmount or state change
    return cleanup;
  }, [qteState.status, onSuccess, onFailure]);

  // Handle keyboard input
  useEffect(() => {
    if (qteState.status !== 'active') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const useCase = new ExecuteQTE(new BrowserTimerAdapter());
      const newState = useCase.handleKeyPress(qteState, event.key);

      if (newState.status === 'success' && !callbacksInvokedRef.current) {
        setQteState(newState);
        callbacksInvokedRef.current = true;
        onSuccess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [qteState, onSuccess]);

  // Handle gamepad input
  useEffect(() => {
    if (qteState.status !== 'active') {
      return;
    }

    let animationFrameId: number;
    const pressedButtons = new Set<number>();

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];

      if (gamepad) {
        gamepad.buttons.forEach((button, index) => {
          if (button.pressed && !pressedButtons.has(index)) {
            // Button just pressed
            pressedButtons.add(index);

            const useCase = new ExecuteQTE(new BrowserTimerAdapter());
            const newState = useCase.handleGamepadPress(qteState, index);

            if (newState.status === 'success' && !callbacksInvokedRef.current) {
              setQteState(newState);
              callbacksInvokedRef.current = true;
              onSuccess();
            }
          } else if (!button.pressed && pressedButtons.has(index)) {
            // Button released
            pressedButtons.delete(index);
          }
        });
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    animationFrameId = requestAnimationFrame(pollGamepad);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [qteState, onSuccess]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && qteState.status === 'idle') {
      const timer = setTimeout(() => {
        setQteState((prev) => (prev.status === 'idle' ? prev.start() : prev));
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  return {
    state: qteState,
    startQTE,
    resetQTE,
  };
};
