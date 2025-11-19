import { useEffect, useRef, useState } from "react";
import { HealthState } from "../../../domain/entities/HealthState";
import styles from "./HealthBar.module.css";

export interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  ariaLabel?: string;
}

/**
 * HealthBar component provides an accessible health indicator with smooth animations.
 * Features: color-coded health zones, screen reader announcements, 60fps animations.
 */
export const HealthBar = ({
  current,
  max,
  label = "Health",
  showValue = true,
  showPercentage = false,
  ariaLabel,
}: HealthBarProps) => {
  // Create health state entity for business logic
  const healthState = new HealthState(current, max);
  const percentage = healthState.getPercentage();
  const colorStatus = healthState.getColorStatus();

  // Track previous percentage for smooth transitions
  const [displayPercentage, setDisplayPercentage] = useState(percentage);
  const previousPercentageRef = useRef(percentage);
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Live region for screen reader announcements
  const [announcement, setAnnouncement] = useState("");
  const [shouldAnnounce, setShouldAnnounce] = useState(false);

  // Smooth animation for percentage changes
  useEffect(() => {
    const diff = Math.abs(percentage - previousPercentageRef.current);

    // Only animate and announce for significant changes (>1%)
    if (diff > 1) {
      // Animate percentage
      const startPercentage = previousPercentageRef.current;
      const endPercentage = percentage;
      const duration = 300; // 300ms animation
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercentage =
          startPercentage + (endPercentage - startPercentage) * easeOut;

        setDisplayPercentage(currentPercentage);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayPercentage(endPercentage);
          previousPercentageRef.current = endPercentage;
        }
      };

      requestAnimationFrame(animate);

      // Debounce announcements to avoid spam
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }

      announcementTimeoutRef.current = setTimeout(() => {
        // Create meaningful announcement
        const statusText =
          colorStatus === "critical"
            ? "Critical"
            : colorStatus === "warning"
            ? "Warning"
            : "Healthy";

        const valueText = showPercentage
          ? healthState.toPercentageString()
          : healthState.toRatioString();

        setAnnouncement(`${label}: ${statusText}, ${valueText}`);
        setShouldAnnounce(true);

        // Reset announce flag after announcement
        setTimeout(() => setShouldAnnounce(false), 100);
      }, 500); // 500ms debounce
    } else {
      setDisplayPercentage(percentage);
      previousPercentageRef.current = percentage;
    }

    // Cleanup
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, [current, max, percentage, colorStatus, label, showPercentage, healthState]);

  // Format display text
  const displayText = showPercentage
    ? healthState.toPercentageString()
    : healthState.toRatioString();

  // Compute ARIA attributes
  const computedAriaLabel = ariaLabel || `${label}: ${displayText}`;

  return (
    <div className={styles.container}>
      {/* Label */}
      {label && <div className={styles.label}>{label}</div>}

      {/* Health bar container */}
      <div
        className={styles.barContainer}
        role="progressbar"
        aria-label={computedAriaLabel}
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={displayText}
      >
        {/* Filled portion with color coding */}
        <div
          className={`${styles.barFill} ${styles[colorStatus]}`}
          style={{ width: `${displayPercentage}%` }}
        />

        {/* Text overlay */}
        {showValue && (
          <div className={styles.valueText} aria-hidden="true">
            {displayText}
          </div>
        )}
      </div>

      {/* Live region for screen reader announcements */}
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {shouldAnnounce ? announcement : ""}
      </div>
    </div>
  );
};
