import type { ITimerRepository } from '../../domain/ports/ITimerRepository';
import { QTEState } from '../../domain/entities/QTEState';

/**
 * ExecuteQTE Use Case
 *
 * Orchestrates Quick Time Event execution with timing logic.
 * Handles countdown updates at 60fps, success/failure detection,
 * and callback invocations.
 *
 * Responsibilities:
 * - Start countdown timer at 60fps using RAF
 * - Update QTE state on each tick
 * - Detect time expiration and trigger failure (unless practice mode)
 * - Invoke callbacks for state changes
 * - Provide cleanup mechanism
 */
export class ExecuteQTE {
  private repository: ITimerRepository;

  constructor(repository: ITimerRepository) {
    this.repository = repository;
  }

  /**
   * Executes the QTE countdown and state management
   *
   * @param initialState - The initial QTE state
   * @param onTick - Callback invoked on each frame with updated state
   * @param onSuccess - Callback invoked when QTE succeeds
   * @param onFailure - Callback invoked when QTE fails (not in practice mode)
   * @returns Cleanup function to stop the timer
   */
  execute(
    initialState: QTEState,
    onTick: (state: QTEState) => void,
    onSuccess: () => void,
    onFailure: () => void
  ): () => void {
    let currentState = initialState;
    let hasCompleted = false;

    // Start the state as active if it's idle
    if (currentState.status === 'idle') {
      currentState = currentState.start();
      onTick(currentState);
    }

    // Timer callback - runs at 60fps
    const handleTick = (deltaTime: number) => {
      // Skip if already completed
      if (hasCompleted || currentState.isCompleted()) {
        return;
      }

      // Update state with time elapsed
      const newState = currentState.tick(deltaTime);
      currentState = newState;

      // Notify tick callback
      onTick(newState);

      // Check for completion
      if (newState.status === 'failure') {
        hasCompleted = true;
        this.repository.stopTimer();
        onFailure();
      } else if (newState.status === 'success') {
        hasCompleted = true;
        this.repository.stopTimer();
        onSuccess();
      }
    };

    // Start the timer
    this.repository.startTimer(handleTick);

    // Return cleanup function
    return () => {
      this.repository.stopTimer();
    };
  }

  /**
   * Handles button press detection and success marking
   *
   * @param state - Current QTE state
   * @param pressedKey - The keyboard key that was pressed
   * @returns Updated state (marked as success if correct key)
   */
  handleKeyPress(state: QTEState, pressedKey: string): QTEState {
    if (!state.isActive()) {
      return state; // Ignore if not active
    }

    const expectedKey = state.getKeyboardKey();

    // Case-insensitive comparison for letter keys
    if (pressedKey.toLowerCase() === expectedKey.toLowerCase()) {
      return state.markSuccess();
    }

    return state;
  }

  /**
   * Handles gamepad button press detection and success marking
   *
   * @param state - Current QTE state
   * @param buttonIndex - The gamepad button index that was pressed
   * @returns Updated state (marked as success if correct button)
   */
  handleGamepadPress(state: QTEState, buttonIndex: number): QTEState {
    if (!state.isActive()) {
      return state; // Ignore if not active
    }

    const expectedButtonIndex = state.getGamepadButtonIndex();

    if (expectedButtonIndex !== null && buttonIndex === expectedButtonIndex) {
      return state.markSuccess();
    }

    return state;
  }
}
