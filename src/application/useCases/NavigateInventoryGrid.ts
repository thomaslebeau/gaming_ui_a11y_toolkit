import { InventoryState } from '../../domain/entities/InventoryState';

/**
 * NavigateInventoryGrid use case handles 2D inventory grid navigation logic.
 * Orchestrates navigation actions, item selection, and item movement.
 */
export class NavigateInventoryGrid {
  /**
   * Navigate up in the grid
   */
  navigateUp(currentState: InventoryState): InventoryState {
    return currentState.navigateUp();
  }

  /**
   * Navigate down in the grid
   */
  navigateDown(currentState: InventoryState): InventoryState {
    return currentState.navigateDown();
  }

  /**
   * Navigate left in the grid
   */
  navigateLeft(currentState: InventoryState): InventoryState {
    return currentState.navigateLeft();
  }

  /**
   * Navigate right in the grid
   */
  navigateRight(currentState: InventoryState): InventoryState {
    return currentState.navigateRight();
  }

  /**
   * Toggle item move mode
   * If not moving: start moving the item at current position
   * If moving: complete the move to current position
   */
  toggleMoveMode(currentState: InventoryState): InventoryState {
    if (currentState.isMovingItem) {
      return currentState.completeMovingItem();
    } else {
      return currentState.startMovingItem();
    }
  }

  /**
   * Cancel item move mode
   */
  cancelMove(currentState: InventoryState): InventoryState {
    return currentState.cancelMovingItem();
  }

  /**
   * Check if a slot should be focused
   */
  shouldFocus(currentState: InventoryState, index: number): boolean {
    return currentState.isFocused(index);
  }

  /**
   * Get the item at the current focused position
   */
  getFocusedItem(currentState: InventoryState) {
    return currentState.getItemAt(currentState.focusedIndex);
  }

  /**
   * Check if a slot is the move source
   */
  isMoveSource(currentState: InventoryState, index: number): boolean {
    return currentState.isMovingItem && currentState.moveSourceIndex === index;
  }
}
