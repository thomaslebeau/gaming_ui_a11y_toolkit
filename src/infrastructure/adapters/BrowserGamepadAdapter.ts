import { GamepadState } from '../../domain/entities/GamepadState';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

// Concrete implementation using browser Gamepad API
export class BrowserGamepadAdapter implements IGamepadRepository {
  private currentState: GamepadState = GamepadState.createDisconnected();
  private animationFrameId: number | null = null;
  private connectCallback?: (state: GamepadState) => void;
  private disconnectCallback?: () => void;
  private buttonPollCallback?: (state: GamepadState) => void;

  onConnect(callback: (state: GamepadState) => void): void {
    this.connectCallback = callback;
    
    const handleConnect = (e: GamepadEvent) => {
      console.log('🎮 Adapter: gamepad connected -', e.gamepad.id);
      this.currentState = GamepadState.createConnected();
      callback(this.currentState);
    };

    window.addEventListener('gamepadconnected', handleConnect);
  }

  onDisconnect(callback: () => void): void {
    this.disconnectCallback = callback;
    
    const handleDisconnect = () => {
      console.log('🎮 Adapter: gamepad disconnected');
      this.currentState = GamepadState.createDisconnected();
      callback();
    };

    window.addEventListener('gamepaddisconnected', handleDisconnect);
  }

  pollButtons(callback: (state: GamepadState) => void): void {
    this.buttonPollCallback = callback;

    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0]; // Use first connected gamepad

      if (gamepad && this.currentState.connected) {
        // Check A button (index 0 on most gamepads)
        const aButton = gamepad.buttons[0];

        if (aButton.pressed && !this.currentState.buttonPressed) {
          // Button just pressed
          this.currentState = this.currentState.withButtonPress(0);
          callback(this.currentState);
        } else if (!aButton.pressed && this.currentState.buttonPressed) {
          // Button just released
          this.currentState = this.currentState.withButtonRelease();
          callback(this.currentState);
        }
      }

      this.animationFrameId = requestAnimationFrame(poll);
    };

    this.animationFrameId = requestAnimationFrame(poll);
  }

  cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Note: We can't remove event listeners here without keeping references
    // In a real app, you'd store the handlers and remove them properly
    console.log('🎮 Adapter: cleanup');
  }
}