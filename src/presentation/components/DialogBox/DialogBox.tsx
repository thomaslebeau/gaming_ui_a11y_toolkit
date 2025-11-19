import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useGamepad } from '../../hooks/useGamepad';
import { GameButton } from '../GameButton/GameButton';
import styles from './DialogBox.module.css';

export interface DialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: string;
  characterName?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  ariaLabel?: string;
  showCloseButton?: boolean;
}

export const DialogBox = ({
  isOpen,
  onClose,
  title,
  content,
  characterName,
  actions = [],
  ariaLabel,
  showCloseButton = true,
}: DialogBoxProps) => {
  // Focus management hook
  const dialogRef = useDialogFocus(isOpen, onClose);

  // Gamepad support - B button (index 1) closes dialog
  const gamepadState = useGamepad();

  useEffect(() => {
    if (
      isOpen &&
      gamepadState.connected &&
      gamepadState.buttonPressed &&
      gamepadState.buttonIndex === 1
    ) {
      // B button (index 1) pressed - close dialog
      onClose();
    }
  }, [isOpen, gamepadState.buttonPressed, gamepadState.buttonIndex, onClose, gamepadState.connected]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Split content by line breaks for subtitle-style rendering
  const contentLines = content.split('\n').filter((line) => line.trim().length > 0);

  // Generate accessible label
  const computedAriaLabel =
    ariaLabel || title || (characterName ? `${characterName} dialog` : 'Dialog');

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const dialogContent = (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={computedAriaLabel}
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby="dialog-content"
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        {/* Character name/portrait section */}
        {characterName && (
          <div className={styles.characterSection}>
            <div className={styles.characterName} aria-label={`Character: ${characterName}`}>
              {characterName}
            </div>
          </div>
        )}

        {/* Title */}
        {title && (
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
        )}

        {/* Content with line breaks */}
        <div id="dialog-content" className={styles.content}>
          {contentLines.map((line, index) => (
            <p key={index} className={styles.contentLine}>
              {line}
            </p>
          ))}
        </div>

        {/* Action buttons */}
        {actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action, index) => (
              <GameButton
                key={index}
                onClick={action.onClick}
                ariaLabel={action.label}
              >
                {action.label}
              </GameButton>
            ))}
          </div>
        )}

        {/* Screen reader hint for gamepad users */}
        <div className={styles.srOnly}>
          Press Escape or gamepad B button to close this dialog.
        </div>
      </div>
    </div>
  );

  // Render dialog in a portal at document body level
  return createPortal(dialogContent, document.body);
};
