import { GridPosition } from './GridPosition';

/**
 * Represents an item in the inventory
 */
export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity?: number;
  slotIndex: number;
}

/**
 * InventoryState entity represents the state of an inventory grid.
 * Immutable entity following clean architecture principles.
 */
export class InventoryState {
  readonly focusedPosition: GridPosition;
  readonly rows: number;
  readonly columns: number;
  readonly items: Map<number, InventoryItem>;
  readonly isMovingItem: boolean;
  readonly moveSourceIndex: number | null;
  readonly wrapNavigation: boolean;

  constructor(
    focusedPosition: GridPosition,
    rows: number,
    columns: number,
    items: Map<number, InventoryItem>,
    isMovingItem: boolean = false,
    moveSourceIndex: number | null = null,
    wrapNavigation: boolean = true
  ) {
    this.focusedPosition = focusedPosition;
    this.rows = rows;
    this.columns = columns;
    this.items = items;
    this.isMovingItem = isMovingItem;
    this.moveSourceIndex = moveSourceIndex;
    this.wrapNavigation = wrapNavigation;
  }

  /**
   * Creates initial inventory state
   */
  static create(
    rows: number,
    columns: number,
    items: InventoryItem[] = [],
    wrapNavigation: boolean = true
  ): InventoryState {
    const itemsMap = new Map<number, InventoryItem>();
    items.forEach((item) => {
      itemsMap.set(item.slotIndex, item);
    });

    return new InventoryState(
      new GridPosition(0, 0),
      rows,
      columns,
      itemsMap,
      false,
      null,
      wrapNavigation
    );
  }

  /**
   * Gets the currently focused index
   */
  get focusedIndex(): number {
    return this.focusedPosition.toIndex(this.columns);
  }

  /**
   * Gets total slot count
   */
  get totalSlots(): number {
    return this.rows * this.columns;
  }

  /**
   * Navigates up
   */
  navigateUp(): InventoryState {
    const newPosition = this.focusedPosition.moveUp(this.rows, this.wrapNavigation);
    return new InventoryState(
      newPosition,
      this.rows,
      this.columns,
      this.items,
      this.isMovingItem,
      this.moveSourceIndex,
      this.wrapNavigation
    );
  }

  /**
   * Navigates down
   */
  navigateDown(): InventoryState {
    const newPosition = this.focusedPosition.moveDown(this.rows, this.wrapNavigation);
    return new InventoryState(
      newPosition,
      this.rows,
      this.columns,
      this.items,
      this.isMovingItem,
      this.moveSourceIndex,
      this.wrapNavigation
    );
  }

  /**
   * Navigates left
   */
  navigateLeft(): InventoryState {
    const newPosition = this.focusedPosition.moveLeft(this.columns, this.wrapNavigation);
    return new InventoryState(
      newPosition,
      this.rows,
      this.columns,
      this.items,
      this.isMovingItem,
      this.moveSourceIndex,
      this.wrapNavigation
    );
  }

  /**
   * Navigates right
   */
  navigateRight(): InventoryState {
    const newPosition = this.focusedPosition.moveRight(this.columns, this.wrapNavigation);
    return new InventoryState(
      newPosition,
      this.rows,
      this.columns,
      this.items,
      this.isMovingItem,
      this.moveSourceIndex,
      this.wrapNavigation
    );
  }

  /**
   * Starts moving an item from the current position
   */
  startMovingItem(): InventoryState {
    const currentIndex = this.focusedIndex;
    const hasItem = this.items.has(currentIndex);

    if (!hasItem) return this;

    return new InventoryState(
      this.focusedPosition,
      this.rows,
      this.columns,
      this.items,
      true,
      currentIndex,
      this.wrapNavigation
    );
  }

  /**
   * Completes moving an item to the current position
   */
  completeMovingItem(): InventoryState {
    if (!this.isMovingItem || this.moveSourceIndex === null) {
      return this;
    }

    const targetIndex = this.focusedIndex;
    if (targetIndex === this.moveSourceIndex) {
      // Cancel move if same position
      return new InventoryState(
        this.focusedPosition,
        this.rows,
        this.columns,
        this.items,
        false,
        null,
        this.wrapNavigation
      );
    }

    // Swap items
    const newItems = new Map(this.items);
    const sourceItem = this.items.get(this.moveSourceIndex);
    const targetItem = this.items.get(targetIndex);

    if (sourceItem) {
      newItems.set(targetIndex, { ...sourceItem, slotIndex: targetIndex });
    } else {
      newItems.delete(targetIndex);
    }

    if (targetItem) {
      newItems.set(this.moveSourceIndex, { ...targetItem, slotIndex: this.moveSourceIndex });
    } else {
      newItems.delete(this.moveSourceIndex);
    }

    return new InventoryState(
      this.focusedPosition,
      this.rows,
      this.columns,
      newItems,
      false,
      null,
      this.wrapNavigation
    );
  }

  /**
   * Cancels moving an item
   */
  cancelMovingItem(): InventoryState {
    return new InventoryState(
      this.focusedPosition,
      this.rows,
      this.columns,
      this.items,
      false,
      null,
      this.wrapNavigation
    );
  }

  /**
   * Gets the item at a specific index
   */
  getItemAt(index: number): InventoryItem | undefined {
    return this.items.get(index);
  }

  /**
   * Checks if a slot is focused
   */
  isFocused(index: number): boolean {
    return this.focusedIndex === index;
  }

  /**
   * Updates the items in the inventory
   */
  updateItems(newItems: InventoryItem[]): InventoryState {
    const itemsMap = new Map<number, InventoryItem>();
    newItems.forEach((item) => {
      itemsMap.set(item.slotIndex, item);
    });

    return new InventoryState(
      this.focusedPosition,
      this.rows,
      this.columns,
      itemsMap,
      this.isMovingItem,
      this.moveSourceIndex,
      this.wrapNavigation
    );
  }
}
