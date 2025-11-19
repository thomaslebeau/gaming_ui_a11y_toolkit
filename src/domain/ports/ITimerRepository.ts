// Port (interface) - defines contract without implementation
export interface ITimerRepository {
  // Start timer with callback fired at 60fps (every ~16.67ms)
  startTimer(callback: (deltaTime: number) => void): void;

  // Stop the timer and cleanup resources
  stopTimer(): void;

  // Get current time in milliseconds (for testing)
  getCurrentTime(): number;
}
