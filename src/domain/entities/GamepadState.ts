// Pure business logic - no framework dependencies
export class GamepadState {
  readonly connected: boolean;
  readonly buttonPressed: boolean;
  readonly buttonIndex: number | null;

  constructor(
    connected: boolean,
    buttonPressed: boolean,
    buttonIndex: number | null
  ) {
    this.connected = connected;
    this.buttonPressed = buttonPressed;
    this.buttonIndex = buttonIndex;
  }

  // Business rule: a button is active only if gamepad is connected
  isButtonActive(): boolean {
    return this.connected && this.buttonPressed;
  }

  // Business rule: create initial disconnected state
  static createDisconnected(): GamepadState {
    return new GamepadState(false, false, null);
  }

  // Business rule: create connected state
  static createConnected(): GamepadState {
    return new GamepadState(true, false, null);
  }

  // Business rule: transition when button is pressed
  withButtonPress(buttonIndex: number): GamepadState {
    if (!this.connected) {
      throw new Error('Cannot press button on disconnected gamepad');
    }
    return new GamepadState(true, true, buttonIndex);
  }

  // Business rule: transition when button is released
  withButtonRelease(): GamepadState {
    return new GamepadState(this.connected, false, null);
  }

  // Business rule: transition to disconnected state
  disconnect(): GamepadState {
    return GamepadState.createDisconnected();
  }
}