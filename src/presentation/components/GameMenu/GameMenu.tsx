import { useEffect, useRef } from "react";
import { useMenuNavigation } from "../../hooks/useMenuNavigation";
import { GameButton } from "../GameButton/GameButton";
import styles from "./GameMenu.module.css";

export interface GameMenuProps {
  items: Array<{
    id: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  defaultFocusIndex?: number;
  ariaLabel?: string;
}

/**
 * GameMenu component provides an accessible vertical menu with gamepad and keyboard navigation.
 * Supports D-pad Up/Down (buttons 12/13) and arrow keys with wrap-around navigation.
 */
export const GameMenu = ({
  items,
  defaultFocusIndex = 0,
  ariaLabel = "Game menu",
}: GameMenuProps) => {
  const { focusedIndex, isFocused } = useMenuNavigation(
    items.length,
    defaultFocusIndex
  );

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus the active menu item
  useEffect(() => {
    const focusedButton = buttonRefs.current[focusedIndex];
    if (focusedButton && document.activeElement !== focusedButton) {
      focusedButton.focus();
    }
  }, [focusedIndex]);

  // Handle keyboard activation (Enter/Space)
  const handleKeyDown = (
    event: React.KeyboardEvent,
    item: GameMenuProps["items"][0]
  ) => {
    if ((event.key === "Enter" || event.key === " ") && !item.disabled) {
      event.preventDefault();
      item.onClick();
    }
  };

  return (
    <nav className={styles.menu} role="navigation" aria-label={ariaLabel}>
      <ul className={styles.menuList} role="menu">
        {items.map((item, index) => (
          <li key={item.id} className={styles.menuItem} role="none">
            <div
              ref={(el) => {
                if (el) {
                  // Store reference to the button element inside
                  const button = el.querySelector("button");
                  buttonRefs.current[index] = button;
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, item)}
            >
              <GameButton
                onClick={item.onClick}
                disabled={item.disabled}
                ariaLabel={item.label}
              >
                {item.label}
              </GameButton>
            </div>
            {isFocused(index) && (
              <span className={styles.focusIndicator} aria-hidden="true">
                ▶
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
