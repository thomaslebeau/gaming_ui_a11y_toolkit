/**
 * BrowserInventoryAdapter
 *
 * Browser implementation for inventory-specific functionality.
 * Handles screen reader announcements for inventory navigation.
 *
 * This adapter is responsible for:
 * - Creating and managing ARIA live region for announcements
 * - Announcing inventory slot navigation to screen readers
 * - Cleaning up announcements when component unmounts
 */
export class BrowserInventoryAdapter {
  private liveRegion: HTMLElement | null = null;

  /**
   * Creates an ARIA live region for announcements if it doesn't exist
   */
  private ensureLiveRegion(): HTMLElement {
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'sr-only';
      // Position off-screen but accessible to screen readers
      this.liveRegion.style.position = 'absolute';
      this.liveRegion.style.left = '-10000px';
      this.liveRegion.style.width = '1px';
      this.liveRegion.style.height = '1px';
      this.liveRegion.style.overflow = 'hidden';
      document.body.appendChild(this.liveRegion);
    }
    return this.liveRegion;
  }

  /**
   * Announces a message to screen readers
   */
  announce(message: string): void {
    const region = this.ensureLiveRegion();
    // Clear and re-add to trigger announcement even if same message
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  }

  /**
   * Formats an inventory slot announcement for screen readers
   */
  formatSlotAnnouncement(
    row: number,
    column: number,
    itemName?: string,
    quantity?: number
  ): string {
    const position = `Row ${row + 1}, Column ${column + 1}`;

    if (itemName) {
      const quantityText = quantity !== undefined && quantity > 1
        ? `, quantity ${quantity}`
        : '';
      return `${position}: ${itemName}${quantityText}`;
    }

    return `${position}: Empty slot`;
  }

  /**
   * Announces item move start
   */
  announceItemMoveStart(itemName: string): void {
    this.announce(`Moving ${itemName}. Navigate to destination and press Enter to place.`);
  }

  /**
   * Announces item move complete
   */
  announceItemMoveComplete(itemName: string, row: number, column: number): void {
    this.announce(`${itemName} moved to Row ${row + 1}, Column ${column + 1}`);
  }

  /**
   * Announces item move cancel
   */
  announceItemMoveCancel(): void {
    this.announce('Move cancelled');
  }

  /**
   * Cleanup function to remove live region
   */
  cleanup(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
      this.liveRegion = null;
    }
  }
}
