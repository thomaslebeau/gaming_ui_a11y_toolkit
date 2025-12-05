/**
 * Gaming UI A11y Toolkit - Spatial Navigation Utilities
 *
 * Algorithms for spatial navigation between focusable elements
 * Inspired by console UI navigation systems
 */

import type { FocusableElement, NavigationDirection } from '../types/focus.types';

/**
 * Find the closest element in a given direction using spatial navigation
 *
 * @param from - The current focused element
 * @param direction - The direction to navigate
 * @param elements - Map of all focusable elements
 * @returns The next element to focus, or null if none found
 */
export const findClosestElement = (
  from: FocusableElement | null,
  direction: NavigationDirection,
  elements: Map<string, FocusableElement>
): FocusableElement | null => {
  const allElements = Array.from(elements.values()).filter(el => !el.disabled);

  if (allElements.length === 0) {
    return null;
  }

  // If no current focus, return the first element (or highest priority)
  if (!from) {
    return allElements.reduce((highest, current) => {
      const highestPriority = highest.priority ?? 0;
      const currentPriority = current.priority ?? 0;
      return currentPriority > highestPriority ? current : highest;
    }, allElements[0]);
  }

  // Filter candidates based on direction
  const candidates = allElements.filter(el => {
    if (el.id === from.id) return false;
    return isInDirection(from.position, el.position, direction);
  });

  if (candidates.length === 0) {
    return null;
  }

  // Find the closest candidate using a weighted scoring system
  return candidates.reduce((closest, candidate) => {
    const scoreCurrent = calculateNavigationScore(from, candidate, direction);
    const scoreClosest = calculateNavigationScore(from, closest, direction);
    return scoreCurrent < scoreClosest ? candidate : closest;
  });
};

/**
 * Check if target element is in the given direction from the source element
 *
 * @param from - Source element position
 * @param to - Target element position
 * @param direction - Navigation direction
 * @returns true if target is in the direction from source
 */
export const isInDirection = (
  from: DOMRect,
  to: DOMRect,
  direction: NavigationDirection
): boolean => {
  const fromCenter = {
    x: from.left + from.width / 2,
    y: from.top + from.height / 2,
  };

  const toCenter = {
    x: to.left + to.width / 2,
    y: to.top + to.height / 2,
  };

  const deltaX = toCenter.x - fromCenter.x;
  const deltaY = toCenter.y - fromCenter.y;

  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  // Tolerance factor: allows elements within a wider cone
  // 0.5 means the primary direction must be at least 50% of the secondary
  // This creates a cone of approximately ±63° from the primary axis
  const DIRECTION_TOLERANCE = 0.5;

  switch (direction) {
    case 'up':
      // Must be above AND vertical distance should be significant
      return deltaY < 0 && absDeltaY >= absDeltaX * DIRECTION_TOLERANCE;
    case 'down':
      // Must be below AND vertical distance should be significant
      return deltaY > 0 && absDeltaY >= absDeltaX * DIRECTION_TOLERANCE;
    case 'left':
      // Must be to the left AND horizontal distance should be significant
      return deltaX < 0 && absDeltaX >= absDeltaY * DIRECTION_TOLERANCE;
    case 'right':
      // Must be to the right AND horizontal distance should be significant
      return deltaX > 0 && absDeltaX >= absDeltaY * DIRECTION_TOLERANCE;
  }
};

/**
 * Calculate navigation score between two elements
 * Lower score = better match
 *
 * @param from - Source element
 * @param to - Target element
 * @param direction - Navigation direction
 * @returns Navigation score (lower is better)
 */
export const calculateNavigationScore = (
  from: FocusableElement,
  to: FocusableElement,
  direction: NavigationDirection
): number => {
  const fromRect = from.position;
  const toRect = to.position;

  const fromCenter = {
    x: fromRect.left + fromRect.width / 2,
    y: fromRect.top + fromRect.height / 2,
  };

  const toCenter = {
    x: toRect.left + toRect.width / 2,
    y: toRect.top + toRect.height / 2,
  };

  // Calculate primary and secondary distances based on direction
  let primaryDistance: number;
  let secondaryDistance: number;

  if (direction === 'up' || direction === 'down') {
    // Vertical navigation
    primaryDistance = Math.abs(toCenter.y - fromCenter.y);
    secondaryDistance = Math.abs(toCenter.x - fromCenter.x);

    // Check for horizontal overlap to boost aligned elements
    const overlap = calculateOverlap(
      fromRect.left,
      fromRect.right,
      toRect.left,
      toRect.right
    );

    if (overlap > 0) {
      // Reduce secondary distance for aligned elements
      secondaryDistance *= 0.3;
    }
  } else {
    // Horizontal navigation
    primaryDistance = Math.abs(toCenter.x - fromCenter.x);
    secondaryDistance = Math.abs(toCenter.y - fromCenter.y);

    // Check for vertical overlap
    const overlap = calculateOverlap(
      fromRect.top,
      fromRect.bottom,
      toRect.top,
      toRect.bottom
    );

    if (overlap > 0) {
      // Reduce secondary distance for aligned elements
      secondaryDistance *= 0.3;
    }
  }

  // Weight primary distance MUCH more than secondary (alignment)
  // This ensures we prioritize elements in the correct direction
  // Primary distance is weighted 3x to strongly favor closer elements
  return primaryDistance * 3 + secondaryDistance * 0.3;
};

/**
 * Calculate overlap between two ranges
 *
 * @param start1 - Start of first range
 * @param end1 - End of first range
 * @param start2 - Start of second range
 * @param end2 - End of second range
 * @returns Amount of overlap (0 if no overlap)
 */
const calculateOverlap = (
  start1: number,
  end1: number,
  start2: number,
  end2: number
): number => {
  return Math.max(0, Math.min(end1, end2) - Math.max(start1, start2));
};

/**
 * Get all elements in sequential order (DOM order)
 *
 * @param elements - Map of all focusable elements
 * @returns Array of elements sorted by DOM position
 */
export const getSequentialElements = (
  elements: Map<string, FocusableElement>
): FocusableElement[] => {
  return Array.from(elements.values())
    .filter(el => !el.disabled)
    .sort((a, b) => {
      // Sort by priority first
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;

      if (priorityA !== priorityB) {
        return priorityB - priorityA; // Higher priority first
      }

      // Then by vertical position (top to bottom)
      if (Math.abs(a.position.top - b.position.top) > 5) {
        return a.position.top - b.position.top;
      }

      // Then by horizontal position (left to right)
      return a.position.left - b.position.left;
    });
};

/**
 * Find the next element in sequential order
 *
 * @param currentId - ID of current element
 * @param elements - Map of all focusable elements
 * @returns Next element or null
 */
export const findNextSequential = (
  currentId: string | null,
  elements: Map<string, FocusableElement>
): FocusableElement | null => {
  const sequential = getSequentialElements(elements);

  if (sequential.length === 0) return null;
  if (!currentId) return sequential[0];

  const currentIndex = sequential.findIndex(el => el.id === currentId);

  if (currentIndex === -1) return sequential[0];
  if (currentIndex >= sequential.length - 1) return sequential[0]; // Wrap around

  return sequential[currentIndex + 1];
};

/**
 * Find the previous element in sequential order
 *
 * @param currentId - ID of current element
 * @param elements - Map of all focusable elements
 * @returns Previous element or null
 */
export const findPreviousSequential = (
  currentId: string | null,
  elements: Map<string, FocusableElement>
): FocusableElement | null => {
  const sequential = getSequentialElements(elements);

  if (sequential.length === 0) return null;
  if (!currentId) return sequential[0];

  const currentIndex = sequential.findIndex(el => el.id === currentId);

  if (currentIndex === -1) return sequential[0];
  if (currentIndex <= 0) return sequential[sequential.length - 1]; // Wrap around

  return sequential[currentIndex - 1];
};
