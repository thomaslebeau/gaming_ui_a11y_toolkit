export interface GamepadButton {
  pressed: boolean;
  value: number;
}

export interface GamepadData {
  index: number;
  id: string;
  buttons: GamepadButton[];
  axes: number[];
}

// Extended GamepadEvent type (not fully defined in standard lib)
export interface GamepadConnectionEvent extends Event {
  gamepad: Gamepad;
}

// Stick position calculation helper type
export interface StickPosition {
  x: number;
  y: number;
}