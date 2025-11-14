import { useRef } from "react";
import { useGamepad } from "../../hooks/useGamepad";
import styles from "./GameButton.module.css";

export interface GameButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const GameButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
}: GameButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Use gamepad hook (controller)
  const gamepadState = useGamepad(() => {
    if (!disabled && onClick) {
      // Focus button when gamepad presses
      buttonRef.current?.focus();
      onClick();
    }
  });

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard support: Enter and Space
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      className={`
        ${styles.button} 
        ${gamepadState.buttonPressed ? styles.buttonPressed : ""}
        ${gamepadState.connected ? styles.buttonGamepadConnected : ""}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={
        ariaLabel || (typeof children === "string" ? children : undefined)
      }
      aria-pressed={gamepadState.buttonPressed}
      tabIndex={0}
      type="button"
    >
      {children}
    </button>
  );
};
