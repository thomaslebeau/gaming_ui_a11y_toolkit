/**
 * Gaming UI A11y Toolkit - useFocusContext Hook
 *
 * Hook to access the global focus context
 */

import { useContext } from 'react';
import { FocusContext } from '../context/FocusContext';
import type { FocusContextValue } from '../types/focus.types';

/**
 * Hook to access the focus context
 *
 * Must be used within a FocusProvider
 *
 * @returns Focus context value
 * @throws Error if used outside FocusProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { focusedId, navigateUp, activate } = useFocusContext();
 *
 *   return <div>Current focus: {focusedId}</div>;
 * }
 * ```
 */
export const useFocusContext = (): FocusContextValue => {
  const context = useContext(FocusContext);

  if (!context) {
    throw new Error(
      'useFocusContext must be used within a FocusProvider. ' +
        'Wrap your component tree with <FocusProvider> to use focus management.'
    );
  }

  return context;
};
