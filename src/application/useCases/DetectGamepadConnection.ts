import { GamepadState } from '../../domain/entities/GamepadState';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

export class DetectGamepadConnection {
  private repository: IGamepadRepository;
  private lastNavigationTime: number;

  constructor(repository: IGamepadRepository) {
    this.repository = repository;
    this.lastNavigationTime = 0;
  }

  execute(
    onConnected: (state: GamepadState) => void,
    onDisconnected: () => void,
    onButtonPress: (state: GamepadState) => void,
    onNavigation?: (direction: { x: number; y: number }) => void
  ): () => void {
    this.repository.onConnect((state) => {
      console.log('Use case: gamepad connected');
      onConnected(state);
      
      // Ne pas stocker le retour si pollButtons retourne void
      this.repository.pollButtons((state) => {
        // Handle button press
        if (state.isButtonActive()) {
          onButtonPress(state);
        }
        
        // Handle navigation - simple throttle
        if (onNavigation) {
          const direction = state.getDpadDirection() || state.getStickDirection(0.3);
          
          if (direction) {
            const now = Date.now();
            // Simple throttle : navigate every 200ms while holding
            if (now - this.lastNavigationTime > 200) {
              onNavigation(direction);
              this.lastNavigationTime = now;
            }
          }
        }
      });
    });

    this.repository.onDisconnect(() => {
      console.log('Use case: gamepad disconnected');
      onDisconnected();
      // Le cleanup sera géré par repository.cleanup()
    });

    return () => {
      this.repository.cleanup();
    };
  }
}