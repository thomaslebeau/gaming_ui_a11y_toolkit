/**
 * SkillState entity represents the current state of a game skill.
 * Immutable entity following clean architecture principles.
 * Handles business logic for cooldown calculations, charges, and ready state.
 */
export class SkillState {
  readonly cooldownDuration: number; // Total cooldown duration in milliseconds
  readonly remainingTime: number; // Remaining cooldown time in milliseconds
  readonly currentCharges: number; // Current available charges
  readonly maxCharges: number; // Maximum charges available
  readonly isDisabled: boolean; // Whether the skill is disabled

  constructor(
    cooldownDuration: number,
    remainingTime: number,
    currentCharges: number = 1,
    maxCharges: number = 1,
    isDisabled: boolean = false
  ) {
    // Validate inputs
    if (cooldownDuration < 0) {
      throw new Error('Cooldown duration cannot be negative');
    }
    if (remainingTime < 0) {
      throw new Error('Remaining time cannot be negative');
    }
    if (maxCharges < 1) {
      throw new Error('Maximum charges must be at least 1');
    }
    if (currentCharges < 0) {
      throw new Error('Current charges cannot be negative');
    }

    this.cooldownDuration = cooldownDuration;
    this.remainingTime = Math.min(remainingTime, cooldownDuration);
    this.currentCharges = Math.min(currentCharges, maxCharges);
    this.maxCharges = maxCharges;
    this.isDisabled = isDisabled;
  }

  /**
   * Creates a SkillState that is ready to use
   */
  static createReady(
    cooldownDuration: number,
    maxCharges: number = 1
  ): SkillState {
    return new SkillState(cooldownDuration, 0, maxCharges, maxCharges, false);
  }

  /**
   * Creates a SkillState on cooldown
   */
  static createOnCooldown(
    cooldownDuration: number,
    remainingTime: number,
    currentCharges: number = 0,
    maxCharges: number = 1
  ): SkillState {
    return new SkillState(
      cooldownDuration,
      remainingTime,
      currentCharges,
      maxCharges,
      false
    );
  }

  /**
   * Creates a disabled SkillState
   */
  static createDisabled(cooldownDuration: number): SkillState {
    return new SkillState(cooldownDuration, 0, 0, 1, true);
  }

  /**
   * Calculates cooldown progress as percentage (0-100)
   * 0% = fully on cooldown, 100% = ready
   */
  getProgressPercentage(): number {
    if (this.cooldownDuration === 0) return 100;
    const progress =
      ((this.cooldownDuration - this.remainingTime) / this.cooldownDuration) *
      100;
    return Math.max(0, Math.min(100, progress));
  }

  /**
   * Calculates remaining cooldown as percentage (0-100)
   * 100% = fully on cooldown, 0% = ready
   */
  getRemainingPercentage(): number {
    return 100 - this.getProgressPercentage();
  }

  /**
   * Checks if the skill is ready to use
   * Ready if: not disabled AND (has charges OR cooldown complete)
   */
  isReady(): boolean {
    if (this.isDisabled) return false;
    return this.currentCharges > 0 || this.remainingTime === 0;
  }

  /**
   * Checks if the skill is currently on cooldown
   */
  isOnCooldown(): boolean {
    return this.remainingTime > 0;
  }

  /**
   * Checks if the skill has multiple charges available
   */
  hasCharges(): boolean {
    return this.maxCharges > 1;
  }

  /**
   * Checks if all charges are available
   */
  isFullyCharged(): boolean {
    return this.currentCharges === this.maxCharges;
  }

  /**
   * Formats remaining time as seconds with one decimal (e.g., "3.5s")
   */
  formatRemainingTime(): string {
    const seconds = this.remainingTime / 1000;
    if (seconds >= 10) {
      return `${Math.ceil(seconds)}s`;
    }
    return `${seconds.toFixed(1)}s`;
  }

  /**
   * Formats charges as ratio string (e.g., "2/3")
   */
  formatCharges(): string {
    return `${this.currentCharges}/${this.maxCharges}`;
  }

  /**
   * Returns a new SkillState with updated remaining time
   */
  updateRemainingTime(newRemainingTime: number): SkillState {
    return new SkillState(
      this.cooldownDuration,
      newRemainingTime,
      this.currentCharges,
      this.maxCharges,
      this.isDisabled
    );
  }

  /**
   * Returns a new SkillState with updated charges
   */
  updateCharges(newCharges: number): SkillState {
    return new SkillState(
      this.cooldownDuration,
      this.remainingTime,
      newCharges,
      this.maxCharges,
      this.isDisabled
    );
  }

  /**
   * Activates the skill (consumes a charge, starts cooldown)
   * Returns new state with one less charge and full cooldown
   */
  activate(): SkillState {
    if (!this.isReady()) {
      throw new Error('Cannot activate skill: not ready');
    }

    // If we have charges, consume one
    if (this.currentCharges > 0) {
      return new SkillState(
        this.cooldownDuration,
        this.cooldownDuration, // Start full cooldown
        this.currentCharges - 1,
        this.maxCharges,
        this.isDisabled
      );
    }

    // No charge system, just start cooldown
    return new SkillState(
      this.cooldownDuration,
      this.cooldownDuration,
      0,
      this.maxCharges,
      this.isDisabled
    );
  }

  /**
   * Ticks down the cooldown by a given delta time
   */
  tick(deltaTime: number): SkillState {
    const newRemainingTime = Math.max(0, this.remainingTime - deltaTime);

    // If we just finished cooldown and have a charge system, restore one charge
    if (
      this.remainingTime > 0 &&
      newRemainingTime === 0 &&
      this.hasCharges() &&
      !this.isFullyCharged()
    ) {
      return new SkillState(
        this.cooldownDuration,
        0,
        this.currentCharges + 1,
        this.maxCharges,
        this.isDisabled
      );
    }

    return this.updateRemainingTime(newRemainingTime);
  }

  /**
   * Enables or disables the skill
   */
  setDisabled(disabled: boolean): SkillState {
    return new SkillState(
      this.cooldownDuration,
      this.remainingTime,
      this.currentCharges,
      this.maxCharges,
      disabled
    );
  }

  /**
   * Creates an ARIA description of the skill state
   */
  toAriaDescription(skillName: string): string {
    if (this.isDisabled) {
      return `${skillName} is disabled`;
    }

    if (this.isReady()) {
      if (this.hasCharges()) {
        return `${skillName} ready, ${this.formatCharges()} charges available`;
      }
      return `${skillName} ready`;
    }

    if (this.hasCharges() && this.currentCharges > 0) {
      return `${skillName}, ${this.formatRemainingTime()} remaining, ${this.formatCharges()} charges available`;
    }

    return `${skillName}, ${this.formatRemainingTime()} remaining`;
  }
}
