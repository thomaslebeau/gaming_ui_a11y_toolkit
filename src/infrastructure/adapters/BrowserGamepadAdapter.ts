import { GamepadState } from '../../domain/entities/GamepadState';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

// Concrete implementation using browser Gamepad API
export class BrowserGamepadAdapter implements IGamepadRepository {
  private currentState: GamepadState = GamepadState.createDisconnected();
  private animationFrameId: number | null = null;
  private connectHandler: ((e: GamepadEvent) => void) | null = null;
  private disconnectHandler: (() => void) | null = null;

  onConnect(callback: (state: GamepadState) => void): void {
    // Remove previous handler if exists
    if (this.connectHandler) {
      window.removeEventListener('gamepadconnected', this.connectHandler);
    }

    this.connectHandler = (e: GamepadEvent) => {
      console.log('🎮 Adapter: gamepad connected -', e.gamepad.id);
      this.currentState = GamepadState.createConnected();
      callback(this.currentState);
    };

    window.addEventListener('gamepadconnected', this.connectHandler);
  }

  onDisconnect(callback: () => void): void {
    // Remove previous handler if exists
    if (this.disconnectHandler) {
      window.removeEventListener('gamepaddisconnected', this.disconnectHandler);
    }

    this.disconnectHandler = () => {
      console.log('🎮 Adapter: gamepad disconnected');
      this.currentState = GamepadState.createDisconnected();
      callback();
    };

    window.addEventListener('gamepaddisconnected', this.disconnectHandler);
  }

  pollButtons(callback: (state: GamepadState) => void): void {
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

    // Remove event listeners to prevent memory leaks
    if (this.connectHandler) {
      window.removeEventListener('gamepadconnected', this.connectHandler);
      this.connectHandler = null;
    }

    if (this.disconnectHandler) {
      window.removeEventListener('gamepaddisconnected', this.disconnectHandler);
      this.disconnectHandler = null;
    }

    console.log('🎮 Adapter: cleanup');
  }
}