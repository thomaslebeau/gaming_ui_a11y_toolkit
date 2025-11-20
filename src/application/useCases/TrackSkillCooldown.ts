import { SkillState } from '../../domain/entities/SkillState';

/**
 * TrackSkillCooldown use case handles skill cooldown tracking logic.
 * Orchestrates cooldown updates, activation, and state transitions.
 */
export class TrackSkillCooldown {
  /**
   * Activates a skill if it's ready
   * Returns new state or throws if not ready
   */
  activate(currentState: SkillState): SkillState {
    return currentState.activate();
  }

  /**
   * Updates cooldown based on elapsed time
   */
  updateCooldown(currentState: SkillState, deltaTime: number): SkillState {
    return currentState.tick(deltaTime);
  }

  /**
   * Updates remaining time directly (useful for external sync)
   */
  setRemainingTime(currentState: SkillState, remainingTime: number): SkillState {
    return currentState.updateRemainingTime(remainingTime);
  }

  /**
   * Updates charge count
   */
  setCharges(currentState: SkillState, charges: number): SkillState {
    return currentState.updateCharges(charges);
  }

  /**
   * Enables or disables the skill
   */
  setDisabled(currentState: SkillState, disabled: boolean): SkillState {
    return currentState.setDisabled(disabled);
  }

  /**
   * Checks if the skill can be activated
   */
  canActivate(currentState: SkillState): boolean {
    return currentState.isReady() && !currentState.isDisabled;
  }

  /**
   * Gets the visual state for rendering
   */
  getVisualState(currentState: SkillState): {
    isReady: boolean;
    isOnCooldown: boolean;
    isDisabled: boolean;
    progressPercentage: number;
    remainingPercentage: number;
    remainingTimeText: string;
    chargesText: string | null;
    hasCharges: boolean;
  } {
    return {
      isReady: currentState.isReady(),
      isOnCooldown: currentState.isOnCooldown(),
      isDisabled: currentState.isDisabled,
      progressPercentage: currentState.getProgressPercentage(),
      remainingPercentage: currentState.getRemainingPercentage(),
      remainingTimeText: currentState.formatRemainingTime(),
      chargesText: currentState.hasCharges()
        ? currentState.formatCharges()
        : null,
      hasCharges: currentState.hasCharges(),
    };
  }

  /**
   * Creates ARIA announcement for state changes
   */
  createAnnouncement(
    previousState: SkillState,
    currentState: SkillState,
    skillName: string
  ): string | null {
    // Announce when skill becomes ready
    const wasReady = previousState.isReady();
    const isNowReady = currentState.isReady();

    if (!wasReady && isNowReady) {
      return `${skillName} ready`;
    }

    // Announce when charges are restored
    if (
      currentState.hasCharges() &&
      currentState.currentCharges > previousState.currentCharges
    ) {
      return `${skillName} charge restored, ${currentState.formatCharges()} available`;
    }

    return null;
  }
}
