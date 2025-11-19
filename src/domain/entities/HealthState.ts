/**
 * HealthState entity represents the current health status in a game.
 * Immutable entity following clean architecture principles.
 * Handles business logic for health calculations and color status.
 */
export class HealthState {
  readonly current: number;
  readonly max: number;

  constructor(current: number, max: number) {
    // Validate inputs
    if (max <= 0) {
      throw new Error('Maximum health must be greater than 0');
    }
    if (current < 0) {
      throw new Error('Current health cannot be negative');
    }

    this.current = Math.min(current, max); // Clamp current to max
    this.max = max;
  }

  /**
   * Creates a HealthState with full health
   */
  static createFull(maxHealth: number): HealthState {
    return new HealthState(maxHealth, maxHealth);
  }

  /**
   * Creates a HealthState from percentage (0-100)
   */
  static fromPercentage(percentage: number, maxHealth: number): HealthState {
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    const current = Math.round((clampedPercentage / 100) * maxHealth);
    return new HealthState(current, maxHealth);
  }

  /**
   * Calculates health percentage (0-100)
   */
  getPercentage(): number {
    if (this.max === 0) return 0;
    return (this.current / this.max) * 100;
  }

  /**
   * Determines health bar color based on percentage thresholds
   * Green: >60%, Yellow: 30-60%, Red: <30%
   */
  getColorStatus(): 'healthy' | 'warning' | 'critical' {
    const percentage = this.getPercentage();

    if (percentage > 60) {
      return 'healthy'; // Green zone
    } else if (percentage >= 30) {
      return 'warning'; // Yellow zone
    } else {
      return 'critical'; // Red zone
    }
  }

  /**
   * Checks if health is at maximum
   */
  isFull(): boolean {
    return this.current === this.max;
  }

  /**
   * Checks if health is depleted
   */
  isEmpty(): boolean {
    return this.current === 0;
  }

  /**
   * Returns a new HealthState with updated current health
   */
  updateCurrent(newCurrent: number): HealthState {
    return new HealthState(newCurrent, this.max);
  }

  /**
   * Returns a new HealthState with updated max health
   * Maintains the same percentage if possible
   */
  updateMax(newMax: number): HealthState {
    const percentage = this.getPercentage();
    const newCurrent = Math.round((percentage / 100) * newMax);
    return new HealthState(newCurrent, newMax);
  }

  /**
   * Applies damage to health
   */
  takeDamage(damage: number): HealthState {
    const newCurrent = Math.max(0, this.current - damage);
    return new HealthState(newCurrent, this.max);
  }

  /**
   * Restores health
   */
  heal(amount: number): HealthState {
    const newCurrent = Math.min(this.max, this.current + amount);
    return new HealthState(newCurrent, this.max);
  }

  /**
   * Formats health as ratio string (e.g., "75/100")
   */
  toRatioString(): string {
    return `${this.current}/${this.max}`;
  }

  /**
   * Formats health as percentage string (e.g., "75%")
   */
  toPercentageString(): string {
    return `${Math.round(this.getPercentage())}%`;
  }
}
