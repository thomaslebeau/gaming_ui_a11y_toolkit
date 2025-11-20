import { useState, useEffect, useCallback, useRef } from 'react';
import { SkillState } from '../../domain/entities/SkillState';
import { TrackSkillCooldown } from '../../application/useCases/TrackSkillCooldown';

export interface UseSkillCooldownOptions {
  cooldownDuration: number; // Milliseconds
  initialRemainingTime?: number; // Milliseconds
  charges?: { current: number; max: number };
  isDisabled?: boolean;
  onReady?: () => void; // Callback when skill becomes ready
  onActivate?: () => void; // Callback when skill is activated
  skillName?: string; // For ARIA announcements
}

/**
 * Hook for managing skill cooldown state with automatic tick updates.
 * Handles cooldown tracking, charges, and accessibility announcements.
 */
export const useSkillCooldown = ({
  cooldownDuration,
  initialRemainingTime = 0,
  charges,
  isDisabled = false,
  onReady,
  onActivate,
  skillName = 'Skill',
}: UseSkillCooldownOptions) => {
  // Initialize skill state
  const [skillState, setSkillState] = useState<SkillState>(() => {
    return new SkillState(
      cooldownDuration,
      initialRemainingTime,
      charges?.current ?? 1,
      charges?.max ?? 1,
      isDisabled
    );
  });

  const trackSkillCooldown = new TrackSkillCooldown();
  const previousStateRef = useRef(skillState);
  const lastTickTimeRef = useRef(performance.now());

  // State for ARIA announcements
  const [announcement, setAnnouncement] = useState<string>('');
  const [shouldAnnounce, setShouldAnnounce] = useState(false);

  // Handle activation
  const activate = useCallback(() => {
    try {
      setSkillState((current) => {
        const newState = trackSkillCooldown.activate(current);
        onActivate?.();
        return newState;
      });
    } catch (error) {
      // Skill not ready, ignore
      console.warn('Skill activation failed:', error);
    }
  }, [onActivate]);

  // Auto-tick cooldown using requestAnimationFrame for 60fps
  useEffect(() => {
    if (!skillState.isOnCooldown()) {
      return;
    }

    let animationFrameId: number;
    const tick = () => {
      const now = performance.now();
      const deltaTime = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      setSkillState((current) =>
        trackSkillCooldown.updateCooldown(current, deltaTime)
      );

      // Continue ticking if still on cooldown
      if (skillState.isOnCooldown()) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [skillState.isOnCooldown(), trackSkillCooldown]);

  // Sync external remaining time changes
  useEffect(() => {
    setSkillState((current) =>
      trackSkillCooldown.setRemainingTime(current, initialRemainingTime)
    );
  }, [initialRemainingTime, trackSkillCooldown]);

  // Sync external charge changes
  useEffect(() => {
    if (charges) {
      setSkillState((current) =>
        trackSkillCooldown.setCharges(current, charges.current)
      );
    }
  }, [charges?.current, charges?.max, trackSkillCooldown]);

  // Sync disabled state
  useEffect(() => {
    setSkillState((current) =>
      trackSkillCooldown.setDisabled(current, isDisabled)
    );
  }, [isDisabled, trackSkillCooldown]);

  // Handle ready state change and announcements
  useEffect(() => {
    const wasReady = previousStateRef.current.isReady();
    const isNowReady = skillState.isReady();

    // Callback when becoming ready
    if (!wasReady && isNowReady) {
      onReady?.();
    }

    // Create announcement for state changes
    const announcementText = trackSkillCooldown.createAnnouncement(
      previousStateRef.current,
      skillState,
      skillName
    );

    if (announcementText) {
      setAnnouncement(announcementText);
      setShouldAnnounce(true);

      // Reset announce flag after announcement
      setTimeout(() => setShouldAnnounce(false), 100);
    }

    previousStateRef.current = skillState;
  }, [skillState, onReady, skillName, trackSkillCooldown]);

  // Get visual state for rendering
  const visualState = trackSkillCooldown.getVisualState(skillState);

  return {
    // State
    isReady: visualState.isReady,
    isOnCooldown: visualState.isOnCooldown,
    isDisabled: visualState.isDisabled,
    progressPercentage: visualState.progressPercentage,
    remainingPercentage: visualState.remainingPercentage,
    remainingTime: skillState.remainingTime,
    currentCharges: skillState.currentCharges,
    maxCharges: skillState.maxCharges,

    // Formatted values
    remainingTimeText: visualState.remainingTimeText,
    chargesText: visualState.chargesText,
    hasCharges: visualState.hasCharges,

    // Actions
    activate,

    // Accessibility
    ariaDescription: skillState.toAriaDescription(skillName),
    announcement,
    shouldAnnounce,
  };
};
