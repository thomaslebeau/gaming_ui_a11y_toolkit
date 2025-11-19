import type { IFocusRepository } from '../../domain/ports/IFocusRepository';

/**
 * BrowserFocusAdapter
 *
 * Browser implementation of the IFocusRepository port.
 * Handles focus management using browser DOM APIs.
 *
 * This adapter is responsible for:
 * - Saving and restoring focus using document.activeElement
 * - Creating focus traps with Tab key interception
 * - Querying focusable elements using CSS selectors
 */
export class BrowserFocusAdapter implements IFocusRepository {
  private previouslyFocusedElement: HTMLElement | null = null;

  /**
   * Selector for all focusable elements
   * Includes buttons, links, inputs, textareas, selects, and elements with tabindex
   */
  private readonly focusableSelector =
    'button:not([disabled]), ' +
    '[href], ' +
    'input:not([disabled]), ' +
    'select:not([disabled]), ' +
    'textarea:not([disabled]), ' +
    '[tabindex]:not([tabindex="-1"])';

  saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.previouslyFocusedElement = activeElement;
    }
  }

  restoreFocus(): void {
    if (this.previouslyFocusedElement) {
      // Use setTimeout to ensure the dialog is removed from DOM first
      setTimeout(() => {
        this.previouslyFocusedElement?.focus();
        this.previouslyFocusedElement = null;
      }, 0);
    }
  }

  trapFocus(container: HTMLElement): () => void {
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = this.getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: moving backwards
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const elements = container.querySelectorAll<HTMLElement>(
      this.focusableSelector
    );
    return Array.from(elements).filter((element) => {
      // Additional check: element must be visible
      return (
        element.offsetWidth > 0 ||
        element.offsetHeight > 0 ||
        element.getClientRects().length > 0
      );
    });
  }

  focusFirstElement(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length > 0) {
      // Use setTimeout to ensure the element is ready to receive focus
      setTimeout(() => {
        focusableElements[0].focus();
      }, 0);
    }
  }
}
