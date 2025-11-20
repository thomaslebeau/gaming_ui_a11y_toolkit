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

// Shared live region to prevent multiple instances from accumulating in DOM
let sharedLiveRegion: HTMLElement | null = null;
let liveRegionRefCount = 0;

export class BrowserInventoryAdapter {
  private isActive = false;

  /**
   * Creates an ARIA live region for announcements if it doesn't exist
   * Uses a shared singleton to prevent DOM accumulation
   */
  private ensureLiveRegion(): HTMLElement {
    if (!sharedLiveRegion) {
      sharedLiveRegion = document.createElement('div');
      sharedLiveRegion.setAttribute('role', 'status');
      sharedLiveRegion.setAttribute('aria-live', 'polite');
      sharedLiveRegion.setAttribute('aria-atomic', 'true');
      sharedLiveRegion.className = 'sr-only';
      sharedLiveRegion.setAttribute('id', 'inventory-live-region');
      // Position off-screen but accessible to screen readers
      sharedLiveRegion.style.position = 'absolute';
      sharedLiveRegion.style.left = '-10000px';
      sharedLiveRegion.style.width = '1px';
      sharedLiveRegion.style.height = '1px';
      sharedLiveRegion.style.overflow = 'hidden';
      document.body.appendChild(sharedLiveRegion);
    }

    // Increment ref count when this instance starts using the live region
    if (!this.isActive) {
      liveRegionRefCount++;
      this.isActive = true;
    }

    return sharedLiveRegion;
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
   * Only removes the shared region when last instance is cleaned up
   */
  cleanup(): void {
    if (this.isActive) {
      liveRegionRefCount--;
      this.isActive = false;

      // Remove shared live region only when no more instances are using it
      if (liveRegionRefCount <= 0 && sharedLiveRegion && sharedLiveRegion.parentNode) {
        sharedLiveRegion.parentNode.removeChild(sharedLiveRegion);
        sharedLiveRegion = null;
        liveRegionRefCount = 0;
      }
    }
  }
}
