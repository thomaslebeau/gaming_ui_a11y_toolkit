import { useEffect, useState, useRef } from 'react';
import { useGamepad } from '../../hooks/useGamepad';
import styles from './VirtualKeyboard.module.css';

export interface VirtualKeyboardProps {
  isVisible: boolean;
  onClose: () => void;
  onInput: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  ariaLabel?: string;
}

/**
 * VirtualKeyboard Component
 *
 * On-screen keyboard for gamepad text input.
 * Users navigate with D-pad and select with A button.
 * Designed for gaming environments where physical keyboard may not be available.
 */
export const VirtualKeyboard = ({
  isVisible,
  onClose,
  onInput,
  onBackspace,
  onSubmit,
  ariaLabel = 'Virtual keyboard',
}: VirtualKeyboardProps) => {
  // Keyboard layout
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ['SPACE', 'BACKSPACE', 'SUBMIT'],
  ];

  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [isUpperCase, setIsUpperCase] = useState(true);

  const keyboardRef = useRef<HTMLDivElement>(null);
  const gamepadState = useGamepad();

  // Track previous axis state to debounce navigation
  const lastAxisStateRef = useRef({ horizontal: 0, vertical: 0 });
  const lastButtonStateRef = useRef({ a: false, b: false });

  // Handle gamepad navigation
  useEffect(() => {
    if (!isVisible || !gamepadState.connected) return;

    const axes = gamepadState.axes;
    const DEADZONE = 0.3;
    const horizontalAxis = axes[0] || 0;
    const verticalAxis = axes[1] || 0;

    // Horizontal navigation (left/right) - only trigger on threshold crossing
    const wasHorizontalNeutral = Math.abs(lastAxisStateRef.current.horizontal) <= DEADZONE;
    if (wasHorizontalNeutral && Math.abs(horizontalAxis) > DEADZONE) {
      const maxCols = keys[selectedRow].length - 1;
      if (horizontalAxis > DEADZONE && selectedCol < maxCols) {
        setSelectedCol((prev) => Math.min(prev + 1, maxCols));
      } else if (horizontalAxis < -DEADZONE && selectedCol > 0) {
        setSelectedCol((prev) => Math.max(prev - 1, 0));
      }
    }

    // Vertical navigation (up/down) - only trigger on threshold crossing
    const wasVerticalNeutral = Math.abs(lastAxisStateRef.current.vertical) <= DEADZONE;
    if (wasVerticalNeutral && Math.abs(verticalAxis) > DEADZONE) {
      if (verticalAxis > DEADZONE && selectedRow < keys.length - 1) {
        setSelectedRow((prev) => {
          const newRow = prev + 1;
          setSelectedCol((col) => Math.min(col, keys[newRow].length - 1));
          return newRow;
        });
      } else if (verticalAxis < -DEADZONE && selectedRow > 0) {
        setSelectedRow((prev) => {
          const newRow = prev - 1;
          setSelectedCol((col) => Math.min(col, keys[newRow].length - 1));
          return newRow;
        });
      }
    }

    // Update axis state
    lastAxisStateRef.current = { horizontal: horizontalAxis, vertical: verticalAxis };

    // A button (index 0) - select key (only on press, not hold)
    const isAPressed = gamepadState.buttonPressed && gamepadState.buttonIndex === 0;
    if (isAPressed && !lastButtonStateRef.current.a) {
      handleKeySelect();
    }
    lastButtonStateRef.current.a = isAPressed;

    // B button (index 1) - close keyboard (only on press, not hold)
    const isBPressed = gamepadState.buttonPressed && gamepadState.buttonIndex === 1;
    if (isBPressed && !lastButtonStateRef.current.b) {
      onClose();
    }
    lastButtonStateRef.current.b = isBPressed;
  }, [
    gamepadState.axes,
    gamepadState.buttonPressed,
    gamepadState.buttonIndex,
    gamepadState.connected,
    isVisible,
    selectedRow,
    selectedCol,
    onClose,
  ]);

  // Handle keyboard input (for testing/accessibility)
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setSelectedRow((prev) => {
            const newRow = Math.max(prev - 1, 0);
            setSelectedCol((col) => Math.min(col, keys[newRow].length - 1));
            return newRow;
          });
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedRow((prev) => {
            const newRow = Math.min(prev + 1, keys.length - 1);
            setSelectedCol((col) => Math.min(col, keys[newRow].length - 1));
            return newRow;
          });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setSelectedCol((prev) => Math.max(prev - 1, 0));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setSelectedCol((prev) => Math.min(prev + 1, keys[selectedRow].length - 1));
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleKeySelect();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, selectedRow, selectedCol, onClose]);

  // Handle key selection
  const handleKeySelect = () => {
    const key = keys[selectedRow][selectedCol];

    switch (key) {
      case 'SPACE':
        onInput(' ');
        break;
      case 'BACKSPACE':
        onBackspace();
        break;
      case 'SUBMIT':
        onSubmit();
        break;
      default:
        onInput(isUpperCase ? key : key.toLowerCase());
        break;
    }
  };

  // Handle mouse/touch click
  const handleKeyClick = (rowIndex: number, colIndex: number) => {
    setSelectedRow(rowIndex);
    setSelectedCol(colIndex);
    handleKeySelect();
  };

  // Toggle case
  const toggleCase = () => {
    setIsUpperCase((prev) => !prev);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={keyboardRef}
        className={styles.keyboard}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Virtual Keyboard</h3>
          <button
            className={styles.toggleCase}
            onClick={toggleCase}
            aria-label={isUpperCase ? 'Switch to lowercase' : 'Switch to uppercase'}
          >
            {isUpperCase ? 'ABC' : 'abc'}
          </button>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close keyboard"
          >
            ×
          </button>
        </div>

        {/* Keyboard layout */}
        <div className={styles.keys}>
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((key, colIndex) => {
                const isSelected = rowIndex === selectedRow && colIndex === selectedCol;
                const isSpecialKey = ['SPACE', 'BACKSPACE', 'SUBMIT'].includes(key);

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`${styles.key} ${isSelected ? styles.selected : ''} ${
                      isSpecialKey ? styles.specialKey : ''
                    }`}
                    onClick={() => handleKeyClick(rowIndex, colIndex)}
                    aria-label={key === 'SPACE' ? 'Space' : key}
                    aria-pressed={isSelected}
                  >
                    {key === 'SPACE'
                      ? 'Space'
                      : key === 'BACKSPACE'
                      ? '←'
                      : key === 'SUBMIT'
                      ? '✓'
                      : isUpperCase
                      ? key
                      : key.toLowerCase()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <p className={styles.srOnly}>
            Use arrow keys or gamepad to navigate. Press Enter or A button to select. Press
            Escape or B button to close.
          </p>
          <p className={styles.hint} aria-hidden="true">
            D-pad: Navigate • A: Select • B: Close
          </p>
        </div>
      </div>
    </div>
  );
};
