import type { IFocusRepository } from '../../domain/ports/IFocusRepository';

/**
 * ManageDialogFocus Use Case
 *
 * Orchestrates focus management for dialog modals.
 * Handles focus trap setup, restoration, and keyboard navigation.
 *
 * Responsibilities:
 * - Save and restore focus when dialog opens/closes
 * - Trap focus within dialog while open
 * - Handle keyboard events (Escape, Tab navigation)
 */
export class ManageDialogFocus {
  private repository: IFocusRepository;

  constructor(repository: IFocusRepository) {
    this.repository = repository;
  }

  /**
   * Executes focus management for a dialog
   *
   * @param dialogElement - The dialog container element
   * @param onClose - Callback to invoke when Escape is pressed
   * @returns Cleanup function to remove all event listeners and restore focus
   */
  execute(
    dialogElement: HTMLElement | null,
    onClose: () => void
  ): () => void {
    if (!dialogElement) {
      return () => {}; // No-op cleanup if element doesn't exist
    }

    // Save the currently focused element for later restoration
    this.repository.saveFocus();

    // Set up focus trap within the dialog
    const removeFocusTrap = this.repository.trapFocus(dialogElement);

    // Focus the first focusable element in the dialog
    this.repository.focusFirstElement(dialogElement);

    // Set up keyboard event handler for Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    dialogElement.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      dialogElement.removeEventListener('keydown', handleKeyDown);
      removeFocusTrap();
      this.repository.restoreFocus();
    };
  }

  /**
   * Handles gamepad button press for closing dialog
   * Typically mapped to B button (index 1)
   *
   * @param buttonIndex - The gamepad button index
   * @param onClose - Callback to invoke when close button is pressed
   */
  handleGamepadClose(buttonIndex: number, onClose: () => void): void {
    // B button is typically index 1 on standard gamepads
    const CLOSE_BUTTON_INDEX = 1;

    if (buttonIndex === CLOSE_BUTTON_INDEX) {
      onClose();
    }
  }
}
