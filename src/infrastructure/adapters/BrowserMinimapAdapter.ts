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
export class BrowserMinimapAdapter {
  private liveRegion: HTMLElement | null = null;
  private audioContext: AudioContext | null = null;

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
   */
  cleanup(): void {
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion);
      this.liveRegion = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
