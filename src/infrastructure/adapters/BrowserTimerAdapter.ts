import type { ITimerRepository } from '../../domain/ports/ITimerRepository';

// Concrete implementation using browser requestAnimationFrame API
export class BrowserTimerAdapter implements ITimerRepository {
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private callback: ((deltaTime: number) => void) | null = null;

  /**
   * Starts the timer using requestAnimationFrame for 60fps updates
   * Calculates delta time between frames for accurate timing
   */
  startTimer(callback: (deltaTime: number) => void): void {
    this.callback = callback;
    this.lastTimestamp = performance.now();

    const tick = (currentTimestamp: number) => {
      // Calculate delta time in milliseconds
      const deltaTime = currentTimestamp - this.lastTimestamp;
      this.lastTimestamp = currentTimestamp;

      // Invoke callback with delta time
      if (this.callback) {
        this.callback(deltaTime);
      }

      // Schedule next frame
      this.animationFrameId = requestAnimationFrame(tick);
    };

    // Start the animation loop
    this.animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Stops the timer and cleans up resources
   */
  stopTimer(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.callback = null;
    this.lastTimestamp = 0;
  }

  /**
   * Gets the current high-resolution timestamp in milliseconds
   * Useful for testing and debugging
   */
  getCurrentTime(): number {
    return performance.now();
  }
}
