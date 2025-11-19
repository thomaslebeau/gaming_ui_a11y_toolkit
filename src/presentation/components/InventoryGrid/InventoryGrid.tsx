import type { InventoryItem } from '../../../domain/entities/InventoryState';
import { useInventoryGrid } from '../../hooks/useInventoryGrid';
import { InventorySlot } from './InventorySlot';
import styles from './InventoryGrid.module.css';

export interface InventoryGridProps {
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows in the grid */
  rows: number;
  /** Array of items to display in the grid */
  items: InventoryItem[];
  /** Callback when an item is selected (Enter/A button on empty slot or with item) */
  onItemSelect?: (item: InventoryItem) => void;
  /** Callback when an item is moved from one slot to another */
  onItemMove?: (fromIndex: number, toIndex: number) => void;
  /** Whether navigation wraps around edges (default: true) */
  wrapNavigation?: boolean;
  /** ARIA label for the grid */
  ariaLabel?: string;
}

/**
 * InventoryGrid component provides accessible 2D grid navigation for game inventories.
 *
 * Features:
 * - 2D navigation with arrow keys and D-pad (up/down/left/right)
 * - Wrap navigation around edges (configurable)
 * - Item selection with Enter/Space or A button
 * - Item movement: hold A/Enter + navigate to move items between slots
 * - Screen reader announcements with position and item info
 * - Keyboard and gamepad support
 * - Tooltips on hover showing item details
 *
 * Controls:
 * - Arrow keys / D-pad: Navigate grid
 * - Enter / Space / A button: Select item or toggle move mode
 * - Escape / B button: Cancel move mode
 */
export const InventoryGrid = ({
  columns,
  rows,
  items,
  onItemSelect,
  onItemMove,
  wrapNavigation = true,
  ariaLabel = 'Inventory grid',
}: InventoryGridProps) => {
  const {
    isFocused,
    isMovingItem,
    isMoveSource,
    getItemAt,
  } = useInventoryGrid({
    columns,
    rows,
    items,
    onItemSelect,
    onItemMove,
    wrapNavigation,
  });

  // Generate all slots
  const totalSlots = rows * columns;
  const slots = Array.from({ length: totalSlots }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const item = getItemAt(index);

    return (
      <InventorySlot
        key={index}
        index={index}
        row={row}
        column={column}
        item={item}
        isFocused={isFocused(index)}
        isMoveSource={isMoveSource(index)}
        isMovingItem={isMovingItem}
      />
    );
  });

  return (
    <div
      className={styles.inventoryGridContainer}
      data-moving={isMovingItem}
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={rows}
        aria-colcount={columns}
        className={styles.inventoryGrid}
        style={{
          gridTemplateColumns: `repeat(${columns}, 4rem)`,
          gridTemplateRows: `repeat(${rows}, 4rem)`,
        }}
      >
        {slots}
      </div>
      {isMovingItem && (
        <div className={styles.moveHint} aria-live="polite">
          Moving item - Navigate to destination and press Enter to place, or Escape to cancel
        </div>
      )}
    </div>
  );
};
