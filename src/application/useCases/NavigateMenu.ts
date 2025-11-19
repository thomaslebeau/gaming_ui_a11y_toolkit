import { MenuState } from "../../domain/entities/MenuState";

/**
 * NavigateMenu use case handles menu navigation logic.
 * Orchestrates navigation actions and state updates.
 */
export class NavigateMenu {
  /**
   * Navigate to the previous menu item
   */
  navigateUp(currentState: MenuState): MenuState {
    return currentState.navigateUp();
  }

  /**
   * Navigate to the next menu item
   */
  navigateDown(currentState: MenuState): MenuState {
    return currentState.navigateDown();
  }

  /**
   * Clear navigation state
   */
  clearNavigation(currentState: MenuState): MenuState {
    return currentState.clearNavigation();
  }

  /**
   * Check if an item should be focused
   */
  shouldFocus(currentState: MenuState, index: number): boolean {
    return currentState.isFocused(index);
  }
}
