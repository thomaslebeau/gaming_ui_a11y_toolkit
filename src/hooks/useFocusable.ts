/**
 * Gaming UI A11y Toolkit - useFocusable Hook
 *
 * Hook to make an element focusable in the global focus system
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFocusContext } from './useFocusContext';
import type{ UseFocusableOptions, UseFocusableReturn } from '../types/focus.types';

/**
 * Make an element focusable in the global focus management system
 *
 * @param options - Configuration options
 * @returns Object containing focus state and props to spread on the element
 *
 * @example
 * ```tsx
 * function MyButton() {
 *   const focusable = useFocusable({
 *     id: 'my-button',
 *     onActivate: () => console.log('Activated!'),
 *     autoFocus: true,
 *   });
 *
 *   return (
 *     <button {...focusable.focusProps}>
 *       {focusable.isFocused ? 'Focused!' : 'Not focused'}
 *     </button>
 *   );
 * }
 * ```
 */
export const useFocusable = ({
  id,
  group,
  onActivate,
  onNavigate,
  disabled = false,
  autoFocus = false,
  priority,
}: UseFocusableOptions): UseFocusableReturn => {
  const context = useFocusContext();
  const ref = useRef<HTMLElement>(null);
  const isFocused = context.focusedId === id;

  /**
   * Get the current position of the element
   */
  const getPosition = useCallback((): DOMRect => {
    if (ref.current) {
      return ref.current.getBoundingClientRect();
    }
    // Return empty rect if element not mounted
    return new DOMRect(0, 0, 0, 0);
  }, []);

  /**
   * Store callbacks in refs to avoid re-registration
   */
  const onActivateRef = useRef(onActivate);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onActivateRef.current = onActivate;
    onNavigateRef.current = onNavigate;
  }, [onActivate, onNavigate]);

  /**
   * Update element registration when properties change
   */
  useEffect(() => {
    if (isRegistered.current && ref.current && !disabled) {
      const position = ref.current.getBoundingClientRect();

      context.registerElement({
        id,
        ref,
        group,
        position,
        onActivate: (...args) => onActivateRef.current?.(...args),
        onNavigate: (...args) => onNavigateRef.current?.(...args) ?? false,
        disabled,
        priority,
      });
    }
  }, [id, group, disabled, priority, context]);

  /**
   * Unregister element on unmount
   */
  useEffect(() => {
    return () => {
      context.unregisterElement(id);
      isRegistered.current = false;
    };
  }, [id, context]);

  /**
   * Update position on resize and scroll
   */
  useEffect(() => {
    if (disabled) return;

    const updatePosition = () => {
      if (ref.current) {
        const position = ref.current.getBoundingClientRect();
        context.updateElementPosition(id, position);
      }
    };

    // Update position periodically and on scroll/resize
    const interval = setInterval(updatePosition, 1000);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [id, disabled, context]);

  /**
   * Track if element has been registered
   */
  const isRegistered = useRef(false);

  /**
   * Handle DOM ref callback
   */
  const handleRef = useCallback((element: HTMLElement | null) => {
    (ref as React.MutableRefObject<HTMLElement | null>).current = element;

    // Register element when ref is first set
    if (element && !isRegistered.current && !disabled) {
      const position = element.getBoundingClientRect();

      context.registerElement({
        id,
        ref,
        group,
        position,
        onActivate: (...args) => onActivateRef.current?.(...args),
        onNavigate: (...args) => onNavigateRef.current?.(...args) ?? false,
        disabled,
        priority,
      });

      isRegistered.current = true;

      // Auto-focus if requested
      if (autoFocus) {
        context.setFocus(id);
      }
    } else if (element && isRegistered.current) {
      // Just update position if already registered
      const position = element.getBoundingClientRect();
      context.updateElementPosition(id, position);
    }
  }, [id, group, disabled, autoFocus, priority, context]);

  /**
   * Handle focus event
   */
  const handleFocus = useCallback(() => {
    if (!disabled) {
      context.setFocus(id);
    }
  }, [id, disabled, context]);

  /**
   * Handle click event
   */
  const handleClick = useCallback(() => {
    if (!disabled) {
      // Set focus first
      context.setFocus(id);
      // Then activate
      onActivate?.();
    }
  }, [id, disabled, onActivate, context]);

  /**
   * Programmatically focus this element
   */
  const focus = useCallback(() => {
    context.setFocus(id);
  }, [id, context]);

  return {
    isFocused,
    focusProps: {
      ref: handleRef,
      'data-focusable-id': id,
      'data-focused': isFocused,
      'aria-current': isFocused ? 'true' : undefined,
      tabIndex: isFocused ? 0 : -1,
      onFocus: handleFocus,
      onClick: handleClick,
    },
    focus,
  };
};
