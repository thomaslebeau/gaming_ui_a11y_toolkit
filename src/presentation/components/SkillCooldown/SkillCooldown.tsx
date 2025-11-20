import { useEffect, useRef, type ReactNode } from 'react';
import styles from './SkillCooldown.module.css';

export interface SkillCooldownProps {
  // Skill icon - can be a URL string or React component
  icon: string | ReactNode;

  // Cooldown timing
  cooldownDuration: number; // Milliseconds
  remainingTime: number; // Milliseconds

  // Optional charges system
  charges?: {
    current: number;
    max: number;
  };

  // Optional hotkey display
  hotkey?: string;

  // State flags
  isReady?: boolean;
  isDisabled?: boolean;

  // Event handlers
  onActivate?: () => void;

  // Accessibility
  ariaLabel: string;

  // Optional announcement for screen readers
  announcement?: string;
  shouldAnnounce?: boolean;
}

/**
 * SkillCooldown component displays a game skill with cooldown overlay,
 * charge system, hotkey badge, and full accessibility support.
 *
 * Features:
 * - Radial cooldown progress overlay (SVG-based)
 * - Countdown timer text
 * - Ready state with pulsing glow animation
 * - Disabled state with grayscale + opacity
 * - Screen reader announcements
 * - Hotkey badge display
 * - Optional multi-charge system
 * - Keyboard and gamepad activation support
 * - High contrast mode support
 */
export const SkillCooldown = ({
  icon,
  cooldownDuration,
  remainingTime,
  charges,
  hotkey,
  isReady = false,
  isDisabled = false,
  onActivate,
  ariaLabel,
  announcement = '',
  shouldAnnounce = false,
}: SkillCooldownProps) => {
  // Calculate progress percentage for radial overlay
  const progressPercentage =
    cooldownDuration > 0
      ? ((cooldownDuration - remainingTime) / cooldownDuration) * 100
      : 100;

  // Calculate remaining percentage for visual overlay
  const remainingPercentage = 100 - progressPercentage;

  // Format remaining time as text
  const formatTime = (ms: number): string => {
    const seconds = ms / 1000;
    if (seconds >= 10) {
      return `${Math.ceil(seconds)}s`;
    }
    return `${seconds.toFixed(1)}s`;
  };

  const remainingTimeText = formatTime(remainingTime);

  // Determine if we should show cooldown overlay
  const showCooldown = remainingTime > 0 && !isReady;

  // Determine container classes
  const containerClasses = [
    styles.container,
    isReady && styles.ready,
    isDisabled && styles.disabled,
    showCooldown && styles.onCooldown,
  ]
    .filter(Boolean)
    .join(' ');

  // Handle click/activation
  const handleClick = () => {
    if (!isDisabled && isReady && onActivate) {
      onActivate();
    }
  };

  // Handle keyboard activation (Space or Enter)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  // Render icon (support both string URLs and React components)
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return (
        <img
          src={icon}
          alt=""
          className={styles.iconImage}
          draggable={false}
        />
      );
    }
    return <div className={styles.iconComponent}>{icon}</div>;
  };

  // Calculate SVG path for radial cooldown overlay
  // This creates a circular sweep from top, going clockwise
  const getRadialPath = (percentage: number): string => {
    if (percentage <= 0) return '';
    if (percentage >= 100) {
      // Full circle
      return 'M 32 32 m 0 -28 a 28 28 0 1 1 0 56 a 28 28 0 1 1 0 -56';
    }

    const angle = (percentage / 100) * 360;
    const radians = ((angle - 90) * Math.PI) / 180;
    const x = 32 + 28 * Math.cos(radians);
    const y = 32 + 28 * Math.sin(radians);
    const largeArc = angle > 180 ? 1 : 0;

    return `M 32 32 L 32 4 A 28 28 0 ${largeArc} 1 ${x} ${y} Z`;
  };

  const radialPath = getRadialPath(remainingPercentage);

  return (
    <>
      <button
        className={containerClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-disabled={isDisabled}
        type="button"
        tabIndex={0}
      >
        {/* Skill icon background */}
        <div className={styles.iconContainer}>{renderIcon()}</div>

        {/* Radial cooldown overlay (SVG) */}
        {showCooldown && (
          <svg
            className={styles.cooldownOverlay}
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <path d={radialPath} fill="rgba(0, 0, 0, 0.7)" />
          </svg>
        )}

        {/* Countdown timer text */}
        {showCooldown && (
          <div className={styles.timerText} aria-hidden="true">
            {remainingTimeText}
          </div>
        )}

        {/* Hotkey badge (top-left corner) */}
        {hotkey && (
          <div className={styles.hotkeyBadge} aria-hidden="true">
            {hotkey}
          </div>
        )}

        {/* Charges badge (bottom-right corner) */}
        {charges && charges.max > 1 && (
          <div className={styles.chargesBadge} aria-hidden="true">
            {charges.current}/{charges.max}
          </div>
        )}

        {/* Ready indicator glow effect (CSS animation) */}
        {isReady && !isDisabled && <div className={styles.readyGlow} />}

        {/* High contrast mode: bold border when ready */}
        {isReady && !isDisabled && (
          <div className={styles.readyBorder} aria-hidden="true" />
        )}
      </button>

      {/* ARIA live region for screen reader announcements */}
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {shouldAnnounce ? announcement : ''}
      </div>
    </>
  );
};
