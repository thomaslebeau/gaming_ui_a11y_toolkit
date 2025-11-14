import { GamepadState } from '../entities/GamepadState';

// Port (interface) - defines contract without implementation
export interface IGamepadRepository {
  // Subscribe to gamepad connection events
  onConnect(callback: (state: GamepadState) => void): void;
  
  // Subscribe to gamepad disconnection events
  onDisconnect(callback: () => void): void;
  
  // Poll gamepad buttons (Gamepad API requires polling)
  pollButtons(callback: (state: GamepadState) => void): void;
  
  // Cleanup resources
  cleanup(): void;
}