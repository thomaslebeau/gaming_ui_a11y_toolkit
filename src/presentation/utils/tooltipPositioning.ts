/**
 * Tooltip Positioning Utility
 *
 * Calculates optimal tooltip position based on available viewport space.
 * Prevents tooltips from overflowing off-screen.
 */

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipPosition {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOOLTIP_OFFSET = 8; // 0.5rem = 8px (assuming 16px base)
const VIEWPORT_PADDING = 16; // 1rem = 16px

/**
 * Calculates available space around an element in each direction
 */
function calculateAvailableSpace(
  triggerRect: ElementRect,
  viewportWidth: number,
  viewportHeight: number
): Record<TooltipPlacement, number> {
  return {
    top: triggerRect.top - VIEWPORT_PADDING,
    right: viewportWidth - (triggerRect.left + triggerRect.width) - VIEWPORT_PADDING,
    bottom: viewportHeight - (triggerRect.top + triggerRect.height) - VIEWPORT_PADDING,
    left: triggerRect.left - VIEWPORT_PADDING,
  };
}

/**
 * Determines the best placement based on available space
 */
function determineBestPlacement(
  availableSpace: Record<TooltipPlacement, number>,
  preferredPlacement: TooltipPlacement | 'auto',
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPlacement {
  // If preferred placement is specified and has enough space, use it
  if (preferredPlacement !== 'auto') {
    const requiredSpace =
      preferredPlacement === 'top' || preferredPlacement === 'bottom'
        ? tooltipHeight
        : tooltipWidth;

    if (availableSpace[preferredPlacement] >= requiredSpace) {
      return preferredPlacement;
    }
  }

  // Otherwise, find the placement with the most space
  const placements: TooltipPlacement[] = ['top', 'right', 'bottom', 'left'];
  let bestPlacement: TooltipPlacement = 'top';
  let maxSpace = -1;

  for (const placement of placements) {
    const requiredSpace =
      placement === 'top' || placement === 'bottom' ? tooltipHeight : tooltipWidth;
    const space = availableSpace[placement];

    if (space >= requiredSpace && space > maxSpace) {
      maxSpace = space;
      bestPlacement = placement;
    }
  }

  // If no placement has enough space, choose the one with most space
  if (maxSpace === -1) {
    for (const placement of placements) {
      if (availableSpace[placement] > maxSpace) {
        maxSpace = availableSpace[placement];
        bestPlacement = placement;
      }
    }
  }

  return bestPlacement;
}

/**
 * Calculates tooltip position coordinates based on placement
 */
function calculatePosition(
  triggerRect: ElementRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: TooltipPlacement,
  viewportWidth: number,
  viewportHeight: number
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  // Calculate base position
  switch (placement) {
    case 'top':
      top = triggerRect.top - tooltipHeight - TOOLTIP_OFFSET;
      left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      break;

    case 'bottom':
      top = triggerRect.top + triggerRect.height + TOOLTIP_OFFSET;
      left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      break;

    case 'left':
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      left = triggerRect.left - tooltipWidth - TOOLTIP_OFFSET;
      break;

    case 'right':
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      left = triggerRect.left + triggerRect.width + TOOLTIP_OFFSET;
      break;
  }

  // Constrain to viewport bounds
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, viewportWidth - tooltipWidth - VIEWPORT_PADDING)
  );

  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, viewportHeight - tooltipHeight - VIEWPORT_PADDING)
  );

  return { top, left };
}

/**
 * Main function to calculate tooltip position
 *
 * @param triggerElement - The element that triggers the tooltip
 * @param tooltipElement - The tooltip element to position
 * @param preferredPlacement - Preferred placement direction or 'auto'
 * @returns Position and actual placement used
 */
export function calculateTooltipPosition(
  triggerElement: HTMLElement,
  tooltipElement: HTMLElement,
  preferredPlacement: TooltipPlacement | 'auto' = 'auto'
): TooltipPosition {
  // Get trigger element dimensions and position
  const triggerRect = triggerElement.getBoundingClientRect();
  const elementRect: ElementRect = {
    top: triggerRect.top + window.scrollY,
    left: triggerRect.left + window.scrollX,
    width: triggerRect.width,
    height: triggerRect.height,
  };

  // Get tooltip dimensions
  const tooltipWidth = tooltipElement.offsetWidth;
  const tooltipHeight = tooltipElement.offsetHeight;

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate available space in each direction
  const availableSpace = calculateAvailableSpace(
    elementRect,
    viewportWidth,
    viewportHeight + window.scrollY
  );

  // Determine best placement
  const placement = determineBestPlacement(
    availableSpace,
    preferredPlacement,
    tooltipWidth,
    tooltipHeight
  );

  // Calculate final position
  const position = calculatePosition(
    elementRect,
    tooltipWidth,
    tooltipHeight,
    placement,
    viewportWidth,
    viewportHeight + window.scrollY
  );

  return {
    ...position,
    placement,
  };
}
