/**
 * QTEState entity represents the state of a Quick Time Event.
 * Immutable entity following clean architecture principles.
 * Handles business logic for QTE timing, success/failure, and accessibility features.
 */
export class QTEState {
  readonly status: 'idle' | 'active' | 'success' | 'failure';
  readonly timeRemaining: number; // milliseconds
  readonly totalDuration: number; // milliseconds
  readonly buttonPrompt: 'A' | 'B' | 'X' | 'Y' | 'Space' | 'Enter';
  readonly practiceMode: boolean;

  constructor(
    status: 'idle' | 'active' | 'success' | 'failure',
    timeRemaining: number,
    totalDuration: number,
    buttonPrompt: 'A' | 'B' | 'X' | 'Y' | 'Space' | 'Enter',
    practiceMode: boolean = false
  ) {
    // Validate inputs
    if (totalDuration <= 0) {
      throw new Error('Total duration must be greater than 0');
    }
    if (timeRemaining < 0) {
      throw new Error('Time remaining cannot be negative');
    }

    this.status = status;
    this.timeRemaining = Math.min(timeRemaining, totalDuration); // Clamp to total
    this.totalDuration = totalDuration;
    this.buttonPrompt = buttonPrompt;
    this.practiceMode = practiceMode;
  }

  /**
   * Creates an idle QTE state (not started yet)
   */
  static createIdle(
    buttonPrompt: 'A' | 'B' | 'X' | 'Y' | 'Space' | 'Enter',
    duration: number,
    practiceMode: boolean = false
  ): QTEState {
    return new QTEState('idle', duration, duration, buttonPrompt, practiceMode);
  }

  /**
   * Creates an active QTE state (countdown in progress)
   */
  static createActive(
    buttonPrompt: 'A' | 'B' | 'X' | 'Y' | 'Space' | 'Enter',
    duration: number,
    practiceMode: boolean = false
  ): QTEState {
    return new QTEState('active', duration, duration, buttonPrompt, practiceMode);
  }

  /**
   * Calculates remaining time as a percentage (0-100)
   */
  getPercentage(): number {
    if (this.totalDuration === 0) return 0;
    return (this.timeRemaining / this.totalDuration) * 100;
  }

  /**
   * Determines color status based on remaining time
   * Green: >60%, Yellow: 30-60%, Red: <30%
   */
  getColorStatus(): 'safe' | 'warning' | 'danger' {
    const percentage = this.getPercentage();

    if (percentage > 60) {
      return 'safe'; // Green zone
    } else if (percentage >= 30) {
      return 'warning'; // Yellow zone
    } else {
      return 'danger'; // Red zone
    }
  }

  /**
   * Checks if QTE is currently active
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Checks if QTE is completed (success or failure)
   */
  isCompleted(): boolean {
    return this.status === 'success' || this.status === 'failure';
  }

  /**
   * Checks if time has expired
   */
  isExpired(): boolean {
    return this.timeRemaining <= 0;
  }

  /**
   * Returns a new QTEState with updated time remaining
   */
  tick(deltaTime: number): QTEState {
    if (!this.isActive()) {
      return this; // No change if not active
    }

    const newTimeRemaining = Math.max(0, this.timeRemaining - deltaTime);

    // Check if time expired and not in practice mode
    if (newTimeRemaining <= 0 && !this.practiceMode) {
      return new QTEState(
        'failure',
        0,
        this.totalDuration,
        this.buttonPrompt,
        this.practiceMode
      );
    }

    return new QTEState(
      this.status,
      newTimeRemaining,
      this.totalDuration,
      this.buttonPrompt,
      this.practiceMode
    );
  }

  /**
   * Returns a new QTEState marking success
   */
  markSuccess(): QTEState {
    if (!this.isActive()) {
      return this; // Can only succeed when active
    }

    return new QTEState(
      'success',
      this.timeRemaining,
      this.totalDuration,
      this.buttonPrompt,
      this.practiceMode
    );
  }

  /**
   * Returns a new QTEState marking failure (only if not in practice mode)
   */
  markFailure(): QTEState {
    if (!this.isActive() || this.practiceMode) {
      return this; // Can only fail when active and not in practice mode
    }

    return new QTEState(
      'failure',
      this.timeRemaining,
      this.totalDuration,
      this.buttonPrompt,
      this.practiceMode
    );
  }

  /**
   * Starts the QTE (transitions from idle to active)
   */
  start(): QTEState {
    if (this.status !== 'idle') {
      return this; // Already started
    }

    return new QTEState(
      'active',
      this.totalDuration,
      this.totalDuration,
      this.buttonPrompt,
      this.practiceMode
    );
  }

  /**
   * Formats time remaining as seconds with one decimal place
   */
  toTimeString(): string {
    const seconds = this.timeRemaining / 1000;
    return `${seconds.toFixed(1)}s`;
  }

  /**
   * Gets difficulty multiplier for adjusting duration
   * Easy: 1.5x, Normal: 1.0x, Hard: 0.7x
   */
  static getDifficultyMultiplier(difficulty: 'easy' | 'normal' | 'hard'): number {
    switch (difficulty) {
      case 'easy':
        return 1.5;
      case 'normal':
        return 1.0;
      case 'hard':
        return 0.7;
    }
  }

  /**
   * Gets the keyboard key corresponding to the button prompt
   */
  getKeyboardKey(): string {
    switch (this.buttonPrompt) {
      case 'Space':
        return ' ';
      case 'Enter':
        return 'Enter';
      case 'A':
        return 'a';
      case 'B':
        return 'b';
      case 'X':
        return 'x';
      case 'Y':
        return 'y';
    }
  }

  /**
   * Gets the gamepad button index corresponding to the button prompt
   * Standard mapping: A=0, B=1, X=2, Y=3
   */
  getGamepadButtonIndex(): number | null {
    switch (this.buttonPrompt) {
      case 'A':
        return 0;
      case 'B':
        return 1;
      case 'X':
        return 2;
      case 'Y':
        return 3;
      default:
        return null; // Space and Enter are keyboard-only
    }
  }
}
