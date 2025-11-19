import { useEffect, useRef, useState } from 'react';
import { useQTE } from '../../hooks/useQTE';
import styles from './QTE.module.css';

export interface QTEProps {
  buttonPrompt: 'A' | 'B' | 'X' | 'Y' | 'Space' | 'Enter';
  duration: number; // milliseconds
  onSuccess: () => void;
  onFailure: () => void;
  difficulty?: 'easy' | 'normal' | 'hard';
  showTimer?: boolean;
  practiceMode?: boolean;
  ariaLabel?: string;
}

/**
 * QTE (Quick Time Event) component provides an accessible timed button prompt.
 * Features: circular countdown timer, screen reader announcements, gamepad + keyboard support,
 * practice mode, adjustable difficulty, and color-coded time zones.
 */
export const QTE = ({
  buttonPrompt,
  duration,
  onSuccess,
  onFailure,
  difficulty = 'normal',
  showTimer = true,
  practiceMode = false,
  ariaLabel,
}: QTEProps) => {
  // Use QTE hook for state management
  const { state } = useQTE({
    buttonPrompt,
    duration,
    onSuccess,
    onFailure,
    difficulty,
    practiceMode,
    autoStart: true,
  });

  // Track previous time for announcements
  const previousTimeRef = useRef(state.timeRemaining);
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Live region for screen reader announcements (assertive for critical timing)
  const [announcement, setAnnouncement] = useState('');
  const [shouldAnnounce, setShouldAnnounce] = useState(false);

  // Calculate display values
  const percentage = state.getPercentage();
  const colorStatus = state.getColorStatus();
  const timeString = state.toTimeString();

  // Circular progress calculation (starts at top, goes clockwise)
  // SVG circle: circumference = 2πr, dashoffset controls visible portion
  const radius = 4.5; // rem (circle is 10rem diameter with 1rem stroke)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Screen reader announcements for time milestones (assertive for urgency)
  useEffect(() => {
    const currentSeconds = Math.ceil(state.timeRemaining / 1000);
    const previousSeconds = Math.ceil(previousTimeRef.current / 1000);

    // Announce at key intervals: every second when <5s, every 2s otherwise
    const shouldAnnounceTime =
      state.isActive() &&
      currentSeconds !== previousSeconds &&
      (currentSeconds <= 5 || currentSeconds % 2 === 0);

    if (shouldAnnounceTime) {
      // Clear existing timeout
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }

      // Create announcement
      let message = '';
      if (practiceMode) {
        message = `Practice mode: Press ${buttonPrompt}. ${currentSeconds} seconds remaining.`;
      } else {
        message = `Quick Time Event: Press ${buttonPrompt}. ${currentSeconds} seconds remaining.`;
      }

      setAnnouncement(message);
      setShouldAnnounce(true);

      // Reset announce flag after announcement
      announcementTimeoutRef.current = setTimeout(() => {
        setShouldAnnounce(false);
      }, 100);
    }

    // Announce completion
    if (state.status === 'success') {
      setAnnouncement('Success!');
      setShouldAnnounce(true);
      setTimeout(() => setShouldAnnounce(false), 100);
    } else if (state.status === 'failure') {
      setAnnouncement('Failed!');
      setShouldAnnounce(true);
      setTimeout(() => setShouldAnnounce(false), 100);
    }

    previousTimeRef.current = state.timeRemaining;

    // Cleanup
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, [state.timeRemaining, state.status, state.isActive, buttonPrompt, practiceMode]);

  // Compute ARIA attributes
  const computedAriaLabel =
    ariaLabel ||
    `Quick Time Event: Press ${buttonPrompt}. ${timeString} remaining.`;

  // Get status class for styling
  const statusClass =
    state.status === 'success'
      ? styles.success
      : state.status === 'failure'
      ? styles.failure
      : styles[colorStatus];

  return (
    <div className={styles.container}>
      {/* Circular QTE display */}
      <div
        className={`${styles.circle} ${statusClass}`}
        role="timer"
        aria-label={computedAriaLabel}
        aria-live="off" // Use separate live region for announcements
      >
        {/* SVG circular progress indicator */}
        <svg className={styles.progressRing} viewBox="0 0 10 10">
          {/* Background circle */}
          <circle
            className={styles.progressRingBg}
            cx="5"
            cy="5"
            r={radius}
            fill="none"
            strokeWidth="1"
          />

          {/* Progress circle */}
          <circle
            className={`${styles.progressRingCircle} ${statusClass}`}
            cx="5"
            cy="5"
            r={radius}
            fill="none"
            strokeWidth="1"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 5 5)" // Start from top
          />
        </svg>

        {/* Button prompt display */}
        <div className={styles.content}>
          <div className={styles.buttonPrompt}>{buttonPrompt}</div>
          {showTimer && <div className={styles.timer}>{timeString}</div>}
        </div>

        {/* Practice mode indicator */}
        {practiceMode && (
          <div className={styles.practiceLabel} aria-hidden="true">
            Practice
          </div>
        )}

        {/* Status indicator (success/failure) */}
        {state.status === 'success' && (
          <div className={styles.statusIcon} aria-hidden="true">
            ✓
          </div>
        )}
        {state.status === 'failure' && (
          <div className={styles.statusIcon} aria-hidden="true">
            ✗
          </div>
        )}
      </div>

      {/* Instructions for accessibility */}
      <div className={styles.instructions}>
        {practiceMode && <span>Practice Mode: No time limit</span>}
        {!practiceMode && <span>Press {buttonPrompt} before time runs out!</span>}
      </div>

      {/* Live region for screen reader announcements (assertive for urgency) */}
      <div
        className={styles.srOnly}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {shouldAnnounce ? announcement : ''}
      </div>
    </div>
  );
};
