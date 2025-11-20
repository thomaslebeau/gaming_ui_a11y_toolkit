/**
 * Gaming UI A11y Toolkit - GameMenu Component
 *
 * A fully accessible menu component designed for gaming interfaces
 * WCAG 2.1 AA compliant with keyboard and gamepad navigation
 * Supports D-Pad and left joystick navigation
 */

import { useRef, useEffect, useCallback } from 'react';
import { GameButton } from '../GameButton/GameButton';
import { useGamepadNavigation } from '../../hooks/useGamepadNavigation';
import type { GameMenuProps } from '../../types/menu.types';
import styles from '../../styles/components/GameMenu.module.css';

/**
 * GameMenu - Accessible menu component for gaming interfaces
 *
 * Features:
 * - WCAG 2.1 AA compliant
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Gamepad navigation (D-Pad and left joystick)
 * - Screen reader support with ARIA attributes
 * - Automatic focus management
 * - Haptic feedback support
 *
 * @example
 * ```tsx
 * const menuItems = [
 *   { id: 'start', label: 'Start Game', onSelect: () => console.log('Start') },
 *   { id: 'options', label: 'Options', onSelect: () => console.log('Options') },
 *   { id: 'quit', label: 'Quit', onSelect: () => console.log('Quit') },
 * ];
 *
 * <GameMenu
 *   title="Main Menu"
 *   items={menuItems}
 * />
 * ```
 */
export const GameMenu = ({
  items,
  title,
  initialSelectedIndex = 0,
  enableHapticFeedback = true,
  onSelectionChange,
  className = '',
  joystickDeadzone = 0.5,
}: GameMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /**
   * Handle item activation
   */
  const handleActivate = useCallback((index: number) => {
    const item = items[index];
    if (item && !item.disabled) {
      item.onSelect();
    }
  }, [items]);

  /**
   * Use gamepad navigation hook
   */
  const { selectedIndex, isGamepadConnected, setSelectedIndex } = useGamepadNavigation({
    itemCount: items.length,
    initialIndex: initialSelectedIndex,
    onSelectionChange,
    onActivate: handleActivate,
    enableHapticFeedback,
    joystickDeadzone,
  });

  /**
   * Focus management - focus the selected item
   */
  useEffect(() => {
    const selectedItem = items[selectedIndex];
    if (selectedItem && itemRefs.current.has(selectedItem.id)) {
      const buttonElement = itemRefs.current.get(selectedItem.id);
      buttonElement?.focus();
    }
  }, [selectedIndex, items]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(Math.max(0, selectedIndex - 1));
        break;
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(Math.min(items.length - 1, selectedIndex + 1));
        break;
      case 'Home':
        event.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setSelectedIndex(items.length - 1);
        break;
      default:
        break;
    }
  }, [selectedIndex, items.length, setSelectedIndex]);

  /**
   * Store button ref
   */
  const setItemRef = useCallback((id: string, element: HTMLButtonElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  /**
   * Generate menu container classes
   */
  const menuClasses = [
    styles.menu,
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav
      ref={menuRef}
      className={menuClasses}
      role="menu"
      aria-label={title || 'Game menu'}
      onKeyDown={handleKeyDown}
    >
      {title && (
        <h2 className={styles.menuTitle}>
          {title}
        </h2>
      )}

      {isGamepadConnected && (
        <div className={styles.gamepadIndicator} aria-live="polite">
          <span className={styles.gamepadIcon}>🎮</span>
          <span className={styles.gamepadText}>Gamepad Connected</span>
        </div>
      )}

      <div className={styles.menuItems} role="group">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <div
              key={item.id}
              className={`${styles.menuItem} ${isSelected ? styles.selected : ''}`}
              role="presentation"
            >
              {item.icon && (
                <span className={styles.itemIcon} aria-hidden="true">
                  {item.icon}
                </span>
              )}

              <GameButton
                ref={(el: HTMLButtonElement | null) => setItemRef(item.id, el)}
                label={item.label}
                onClick={item.onSelect}
                disabled={item.disabled}
                variant={isSelected ? 'primary' : 'secondary'}
                size="large"
                className={styles.menuButton}
                enableHapticFeedback={enableHapticFeedback}
                ariaDescribedBy={isSelected ? `${item.id}-selected` : undefined}
              />

              {isSelected && (
                <span
                  id={`${item.id}-selected`}
                  className={styles.visuallyHidden}
                >
                  Currently selected
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.menuHints}>
        <div className={styles.hint}>
          <span className={styles.hintKey}>↑↓</span>
          <span className={styles.hintText}>Navigate</span>
        </div>
        {isGamepadConnected && (
          <>
            <div className={styles.hint}>
              <span className={styles.hintKey}>D-Pad / Left Stick</span>
              <span className={styles.hintText}>Navigate</span>
            </div>
            <div className={styles.hint}>
              <span className={styles.hintKey}>A Button</span>
              <span className={styles.hintText}>Select</span>
            </div>
          </>
        )}
        <div className={styles.hint}>
          <span className={styles.hintKey}>Enter / Space</span>
          <span className={styles.hintText}>Select</span>
        </div>
      </div>
    </nav>
  );
};

export default GameMenu;
