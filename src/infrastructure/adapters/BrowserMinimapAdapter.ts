/**
 * BrowserMinimapAdapter
 *
 * Browser implementation for minimap-specific functionality.
 * Handles screen reader announcements for minimap navigation and POI notifications.
 *
 * This adapter is responsible for:
 * - Creating and managing ARIA live region for announcements
 * - Announcing nearby POIs to screen readers
 * - Playing audio pings when POIs enter range
 * - Cleaning up resources when component unmounts
 */

// Shared live region to prevent multiple instances from accumulating in DOM
let sharedLiveRegion: HTMLElement | null = null;
let liveRegionRefCount = 0;

export class BrowserMinimapAdapter {
  private isActive = false;
  private audioContext: AudioContext | null = null;

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
      sharedLiveRegion.setAttribute('id', 'minimap-live-region');
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
   * Announces minimap visibility toggle
   */
  announceToggle(isVisible: boolean): void {
    this.announce(isVisible ? 'Minimap opened' : 'Minimap closed');
  }

  /**
   * Announces zoom level change
   */
  announceZoom(zoomLevel: number): void {
    const percentage = Math.round(zoomLevel * 100);
    this.announce(`Zoom ${percentage}%`);
  }

  /**
   * Announces POI focus
   */
  announcePOIFocus(description: string): void {
    this.announce(`Focused: ${description}`);
  }

  /**
   * Announces POI click/selection
   */
  announcePOIClick(description: string): void {
    this.announce(`Selected: ${description}`);
  }

  /**
   * Announces POI entering range with audio ping
   */
  announcePOIEnteringRange(description: string): void {
    this.announce(`New: ${description}`);
    this.playPing();
  }

  /**
   * Plays an audio ping notification
   * Creates a short beep sound using Web Audio API
   */
  playPing(): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Short beep at 800Hz
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      // Quick fade out
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.2
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if audio context not supported
      console.warn('Audio ping not supported:', error);
    }
  }

  /**
   * Cleanup function to remove live region and audio context
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

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
