import { useEffect, useState } from 'react';
import { GamepadState } from '../../domain/entities/GamepadState';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';

export const useGamepad = (onButtonPress?: () => void) => {
  const [gamepadState, setGamepadState] = useState<GamepadState>(
    GamepadState.createDisconnected()
  );

  useEffect(() => {
    // Create instances inside useEffect to ensure single creation
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
  }, []); // Empty deps if onButtonPress doesn't need to be reactive

  return gamepadState;
};