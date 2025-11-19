import { useRef, useEffect } from 'react';
import { Tooltip } from '../Tooltip/Tooltip';
import type { InventoryItem } from '../../../domain/entities/InventoryState';
import styles from './InventoryGrid.module.css';

interface InventorySlotProps {
  index: number;
  row: number;
  column: number;
  item?: InventoryItem;
  isFocused: boolean;
  isMoveSource: boolean;
  isMovingItem: boolean;
}

export const InventorySlot = ({
  index,
  row,
  column,
  item,
  isFocused,
  isMoveSource,
  isMovingItem,
}: InventorySlotProps) => {
  const slotRef = useRef<HTMLButtonElement>(null);

  // Auto-focus the focused slot
  useEffect(() => {
    if (isFocused && slotRef.current) {
      slotRef.current.focus();
    }
  }, [isFocused]);

  // Build ARIA label
  const ariaLabel = (() => {
    const position = `Row ${row + 1}, Column ${column + 1}`;
    if (item) {
      const quantity = item.quantity !== undefined && item.quantity > 1
        ? `, quantity ${item.quantity}`
        : '';
      return `${position}: ${item.name}${quantity}`;
    }
    return `${position}: Empty slot`;
  })();

  // Build CSS classes
  const slotClasses = [
    styles.slot,
    isFocused ? styles.focused : '',
    isMoveSource ? styles.moveSource : '',
    isMovingItem && !isMoveSource ? styles.moveTarget : '',
    item ? styles.hasItem : styles.empty,
  ]
    .filter(Boolean)
    .join(' ');

  // Tooltip content
  const tooltipContent = item
    ? `${item.name}${item.quantity !== undefined && item.quantity > 1 ? ` (x${item.quantity})` : ''}`
    : 'Empty slot';

  const slotContent = (
    <button
      ref={slotRef}
      className={slotClasses}
      role="gridcell"
      aria-label={ariaLabel}
      aria-selected={isFocused}
      tabIndex={isFocused ? 0 : -1}
      data-row={row}
      data-column={column}
      data-index={index}
    >
      {item && (
        <div className={styles.itemContent}>
          {item.icon && (
            <img
              src={item.icon}
              alt=""
              className={styles.itemIcon}
              aria-hidden="true"
            />
          )}
          {item.quantity !== undefined && item.quantity > 1 && (
            <span className={styles.quantity} aria-hidden="true">
              {item.quantity}
            </span>
          )}
        </div>
      )}
      {!item && <div className={styles.emptySlot} aria-hidden="true"></div>}
    </button>
  );

  return <Tooltip content={tooltipContent}>{slotContent}</Tooltip>;
};
