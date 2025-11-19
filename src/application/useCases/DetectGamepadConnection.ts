import { GamepadState } from '../../domain/entities/GamepadState';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

// Use case: orchestrates gamepad detection and button polling
export class DetectGamepadConnection {
  private repository: IGamepadRepository;

  constructor(repository: IGamepadRepository) {
    this.repository = repository;
  }

  // Execute the use case with callbacks for UI updates
  execute(
    onConnected: (state: GamepadState) => void,
    onDisconnected: () => void,
    onButtonPress: (state: GamepadState) => void
  ): () => void {
    // Orchestrate connection detection
    this.repository.onConnect((state) => {
      console.log('Use case: gamepad connected');
      onConnected(state);
    });

    // Orchestrate disconnection detection
    this.repository.onDisconnect(() => {
      console.log('Use case: gamepad disconnected');
      onDisconnected();
    });

    // Orchestrate button polling
    this.repository.pollButtons((state) => {
      if (state.isButtonActive()) {
        onButtonPress(state);
      }
    });

    // Return cleanup function
    return () => {
      this.repository.cleanup();
    };
  }
}