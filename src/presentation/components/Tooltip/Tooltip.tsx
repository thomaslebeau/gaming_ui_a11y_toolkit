import {
  useState,
  useRef,
  useEffect,
  useCallback,
  cloneElement,
  Children,
  isValidElement,
} from 'react';
import { createPortal } from 'react-dom';
import {
  calculateTooltipPosition,
  type TooltipPlacement,
} from '../../utils/tooltipPositioning';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** Content to display in the tooltip */
  content: string;
  /** Single child element that triggers the tooltip */
  children: React.ReactElement;
  /** Preferred placement direction (defaults to 'auto' for best fit) */
  placement?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  /** Delay in milliseconds before showing tooltip (default 500ms) */
  delay?: number;
  /** Optional ARIA label for the tooltip itself */
  ariaLabel?: string;
}

/**
 * Tooltip component provides accessible contextual information on hover/focus.
 *
 * Features:
 * - Auto-positioning to prevent viewport overflow
 * - Configurable show delay
 * - Keyboard accessible (shows on focus, hides on Escape)
 * - ARIA describedby for screen readers
 * - Portal rendering for proper z-index layering
 * - Smooth fade animations
 */
export const Tooltip = ({
  content,
  children,
  placement = 'auto',
  delay = 500,
  ariaLabel,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState<TooltipPlacement>('top');
  const [tooltipId] = useState(
    () => `tooltip-${Math.random().toString(36).substring(2, 11)}`
  );

  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  // Update tooltip position
  const updatePosition = useCallback(() => {
    if (triggerRef.current && tooltipRef.current) {
      const pos = calculateTooltipPosition(
        triggerRef.current,
        tooltipRef.current,
        placement
      );
      setPosition({ top: pos.top, left: pos.left });
      setActualPlacement(pos.placement);
    }
  }, [placement]);

  // Show tooltip after delay
  const handleShow = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    showTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsVisible(true);
      }
    }, delay);
  }, [delay]);

  // Hide tooltip immediately
  const handleHide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }

    // Small delay on hide for better UX when moving between elements
    hideTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsVisible(false);
      }
    }, 100);
  }, []);

  // Handle keyboard escape
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        handleHide();
        // Return focus to trigger element
        triggerRef.current?.focus();
      }
    },
    [isVisible, handleHide]
  );

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  // Listen for escape key and window resize
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isVisible, handleKeyDown, updatePosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Ensure we have a valid single child
  const child = Children.only(children);
  if (!isValidElement(child)) {
    throw new Error('Tooltip children must be a valid React element');
  }

  // Clone child and add event handlers + aria attributes
  const trigger = cloneElement(child, {
    ref: (node: HTMLElement) => {
      triggerRef.current = node;

      // Preserve any existing ref
      const { ref } = child as any;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      handleShow();
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleHide();
      child.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleShow();
      child.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleHide();
      child.props.onBlur?.(e);
    },
    'aria-describedby': isVisible ? tooltipId : child.props['aria-describedby'],
  } as any);

  // Tooltip portal content
  const tooltipContent = isVisible
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          aria-label={ariaLabel}
          className={`${styles.tooltip} ${styles[actualPlacement]}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  );
};
