/**
 * MenuState entity represents the state of a menu navigation system.
 * Immutable entity following clean architecture principles.
 */
export class MenuState {
  readonly focusedIndex: number;
  readonly itemCount: number;
  readonly isNavigating: boolean;

  constructor(focusedIndex: number, itemCount: number, isNavigating: boolean) {
    this.focusedIndex = focusedIndex;
    this.itemCount = itemCount;
    this.isNavigating = isNavigating;
  }

  /**
   * Creates initial menu state with default focus
   */
  static create(itemCount: number, defaultFocusIndex: number = 0): MenuState {
    const validIndex = Math.max(0, Math.min(defaultFocusIndex, itemCount - 1));
    return new MenuState(validIndex, itemCount, false);
  }

  /**
   * Navigates to the previous item with wrapping
   */
  navigateUp(): MenuState {
    if (this.itemCount === 0) return this;

    const newIndex = this.focusedIndex === 0
      ? this.itemCount - 1
      : this.focusedIndex - 1;

    return new MenuState(newIndex, this.itemCount, true);
  }

  /**
   * Navigates to the next item with wrapping
   */
  navigateDown(): MenuState {
    if (this.itemCount === 0) return this;

    const newIndex = this.focusedIndex === this.itemCount - 1
      ? 0
      : this.focusedIndex + 1;

    return new MenuState(newIndex, this.itemCount, true);
  }

  /**
   * Sets navigation state to inactive
   */
  clearNavigation(): MenuState {
    return new MenuState(this.focusedIndex, this.itemCount, false);
  }

  /**
   * Checks if the given index is currently focused
   */
  isFocused(index: number): boolean {
    return this.focusedIndex === index;
  }

  /**
   * Updates the item count (useful when items change)
   */
  updateItemCount(newCount: number): MenuState {
    if (newCount === this.itemCount) return this;

    // Ensure focused index is still valid
    const validIndex = Math.min(this.focusedIndex, Math.max(0, newCount - 1));
    return new MenuState(validIndex, newCount, this.isNavigating);
  }
}
