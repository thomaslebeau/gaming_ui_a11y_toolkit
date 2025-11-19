import { useEffect, useRef } from 'react';
import { ManageDialogFocus } from '../../application/useCases/ManageDialogFocus';
import { BrowserFocusAdapter } from '../../infrastructure/adapters/BrowserFocusAdapter';

/**
 * useDialogFocus Hook
 *
 * React hook that manages focus for dialog modals.
 * Handles focus trap, restoration, and keyboard events.
 *
 * @param isOpen - Whether the dialog is currently open
 * @param onClose - Callback to invoke when dialog should close
 * @returns Ref to attach to the dialog container element
 */
export const useDialogFocus = (
  isOpen: boolean,
  onClose: () => void
): React.RefObject<HTMLDivElement> => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return;
    }

    // Create dependencies (dependency injection)
    const focusAdapter = new BrowserFocusAdapter();
    const manageDialogFocus = new ManageDialogFocus(focusAdapter);

    // Execute the use case
    const cleanup = manageDialogFocus.execute(dialogRef.current, onClose);

    // Lock body scroll when dialog is open
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Cleanup function
    return () => {
      cleanup();
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen, onClose]);

  return dialogRef;
};
