import { useEffect, useState } from 'react';
import { GamepadState } from '../../domain/entities/GamepadState';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';

// Hook acts as a controller - bridges React with use cases
export const useGamepad = (onButtonPress?: () => void) => {
  const [gamepadState, setGamepadState] = useState<GamepadState>(
    GamepadState.createDisconnected()
  );

  useEffect(() => {
    // Dependency injection: create adapter and use case
    const adapter = new BrowserGamepadAdapter();
    const useCase = new DetectGamepadConnection(adapter);

    // Execute use case with callbacks
    const cleanup = useCase.execute(
      // On connected
      (state) => setGamepadState(state),
      
      // On disconnected
      () => setGamepadState(GamepadState.createDisconnected()),
      
      // On button press
      (state) => {
        setGamepadState(state);
        onButtonPress?.();
      }
    );

    // Cleanup on unmount
    return cleanup;
  }, [onButtonPress]);

  return gamepadState;
};