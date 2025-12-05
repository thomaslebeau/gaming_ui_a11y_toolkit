/**
 * Gaming UI A11y Toolkit - Focus Context
 *
 * React context for global focus management
 */

import { createContext } from 'react';
import { FocusContextValue } from '../types/focus.types';

/**
 * Context for global focus management
 */
export const FocusContext = createContext<FocusContextValue | null>(null);

FocusContext.displayName = 'FocusContext';
