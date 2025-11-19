/**
 * IFocusRepository Port
 *
 * Defines the contract for focus management operations.
 * This port enables focus trap functionality and focus restoration
 * for accessible modal dialogs.
 *
 * Following the Dependency Inversion Principle, this interface
 * is defined in the domain layer and implemented in the infrastructure layer.
 */
export interface IFocusRepository {
  /**
   * Saves the currently focused element for later restoration
   */
  saveFocus(): void;

  /**
   * Restores focus to the previously saved element
   */
  restoreFocus(): void;

  /**
   * Traps focus within a specified container element
   * Returns a cleanup function to remove the trap
   *
   * @param container - The element to trap focus within
   * @returns Cleanup function
   */
  trapFocus(container: HTMLElement): () => void;

  /**
   * Gets all focusable elements within a container
   *
   * @param container - The element to search within
   * @returns Array of focusable elements
   */
  getFocusableElements(container: HTMLElement): HTMLElement[];

  /**
   * Focuses the first focusable element in a container
   *
   * @param container - The element to search within
   */
  focusFirstElement(container: HTMLElement): void;
}
