import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryState } from '../../domain/entities/InventoryState';
import type { InventoryItem } from '../../domain/entities/InventoryState';
import { NavigateInventoryGrid } from '../../application/useCases/NavigateInventoryGrid';
import { BrowserInventoryAdapter } from '../../infrastructure/adapters/BrowserInventoryAdapter';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';

interface UseInventoryGridOptions {
  columns: number;
  rows: number;
  items: InventoryItem[];
  onItemSelect?: (item: InventoryItem) => void;
  onItemMove?: (fromIndex: number, toIndex: number) => void;
  wrapNavigation?: boolean;
}

/**
 * Hook for managing inventory grid navigation with keyboard and gamepad support.
 * Handles 2D navigation (arrow keys/D-pad), item selection, and item movement.
 *
 * Gamepad mapping:
 * - D-pad Up/Down/Left/Right (buttons 12/13/14/15)
 * - A button (button 0) for select/move
 * - B button (button 1) for cancel move
 */
export const useInventoryGrid = ({
  columns,
  rows,
  items,
  onItemSelect,
  onItemMove,
  wrapNavigation = true,
}: UseInventoryGridOptions) => {
  const [inventoryState, setInventoryState] = useState<InventoryState>(() =>
    InventoryState.create(rows, columns, items, wrapNavigation)
  );

  const navigateUseCase = new NavigateInventoryGrid();
  const adapterRef = useRef<BrowserInventoryAdapter | null>(null);

  // Initialize adapter
  if (!adapterRef.current) {
    adapterRef.current = new BrowserInventoryAdapter();
  }

  const adapter = adapterRef.current;

  // Update items when they change
  useEffect(() => {
    setInventoryState((current) => current.updateItems(items));
  }, [items]);

  // Announce focused slot changes
  useEffect(() => {
    const item = inventoryState.getItemAt(inventoryState.focusedIndex);
    const announcement = adapter.formatSlotAnnouncement(
      inventoryState.focusedPosition.row,
      inventoryState.focusedPosition.column,
      item?.name,
      item?.quantity
    );
    adapter.announce(announcement);
  }, [inventoryState.focusedIndex, adapter]);

  // Navigation handlers
  const handleNavigateUp = useCallback(() => {
    setInventoryState((current) => navigateUseCase.navigateUp(current));
  }, []);

  const handleNavigateDown = useCallback(() => {
    setInventoryState((current) => navigateUseCase.navigateDown(current));
  }, []);

  const handleNavigateLeft = useCallback(() => {
    setInventoryState((current) => navigateUseCase.navigateLeft(current));
  }, []);

  const handleNavigateRight = useCallback(() => {
    setInventoryState((current) => navigateUseCase.navigateRight(current));
  }, []);

  // Select/Move handler
  const handleSelect = useCallback(() => {
    setInventoryState((current) => {
      const wasMoving = current.isMovingItem;
      const newState = navigateUseCase.toggleMoveMode(current);

      if (!wasMoving && newState.isMovingItem) {
        // Started moving
        const item = current.getItemAt(current.focusedIndex);
        if (item) {
          adapter.announceItemMoveStart(item.name);
        }
      } else if (wasMoving && !newState.isMovingItem) {
        // Completed moving
        if (current.moveSourceIndex !== null && current.moveSourceIndex !== current.focusedIndex) {
          const item = current.getItemAt(current.moveSourceIndex);
          if (item) {
            adapter.announceItemMoveComplete(
              item.name,
              current.focusedPosition.row,
              current.focusedPosition.column
            );
          }
          if (onItemMove) {
            onItemMove(current.moveSourceIndex, current.focusedIndex);
          }
        }
      } else if (!wasMoving && !newState.isMovingItem) {
        // Regular selection (no item to move)
        const item = current.getItemAt(current.focusedIndex);
        if (item && onItemSelect) {
          onItemSelect(item);
        }
      }

      return newState;
    });
  }, [onItemSelect, onItemMove, adapter]);

  // Cancel move handler
  const handleCancelMove = useCallback(() => {
    setInventoryState((current) => {
      if (current.isMovingItem) {
        adapter.announceItemMoveCancel();
        return navigateUseCase.cancelMove(current);
      }
      return current;
    });
  }, [adapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          handleNavigateUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleNavigateDown();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleNavigateLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNavigateRight();
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleSelect();
          break;
        case 'Escape':
          event.preventDefault();
          handleCancelMove();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNavigateUp,
    handleNavigateDown,
    handleNavigateLeft,
    handleNavigateRight,
    handleSelect,
    handleCancelMove,
  ]);

  // Gamepad navigation
  useEffect(() => {
    const gamepadAdapter = new BrowserGamepadAdapter();
    const gamepadUseCase = new DetectGamepadConnection(gamepadAdapter);

    let lastButtonState = {
      up: false,
      down: false,
      left: false,
      right: false,
      a: false,
      b: false,
    };

    const cleanup = gamepadUseCase.execute(
      () => {}, // onConnected
      () => {}, // onDisconnected
      (gamepadState) => {
        // D-pad Up (button 12)
        if (gamepadState.buttonIndex === 12 && !lastButtonState.up) {
          lastButtonState.up = true;
          handleNavigateUp();
        } else if (gamepadState.buttonIndex !== 12) {
          lastButtonState.up = false;
        }

        // D-pad Down (button 13)
        if (gamepadState.buttonIndex === 13 && !lastButtonState.down) {
          lastButtonState.down = true;
          handleNavigateDown();
        } else if (gamepadState.buttonIndex !== 13) {
          lastButtonState.down = false;
        }

        // D-pad Left (button 14)
        if (gamepadState.buttonIndex === 14 && !lastButtonState.left) {
          lastButtonState.left = true;
          handleNavigateLeft();
        } else if (gamepadState.buttonIndex !== 14) {
          lastButtonState.left = false;
        }

        // D-pad Right (button 15)
        if (gamepadState.buttonIndex === 15 && !lastButtonState.right) {
          lastButtonState.right = true;
          handleNavigateRight();
        } else if (gamepadState.buttonIndex !== 15) {
          lastButtonState.right = false;
        }

        // A button (button 0) - Select/Move
        if (gamepadState.buttonIndex === 0 && !lastButtonState.a) {
          lastButtonState.a = true;
          handleSelect();
        } else if (gamepadState.buttonIndex !== 0) {
          lastButtonState.a = false;
        }

        // B button (button 1) - Cancel move
        if (gamepadState.buttonIndex === 1 && !lastButtonState.b) {
          lastButtonState.b = true;
          handleCancelMove();
        } else if (gamepadState.buttonIndex !== 1) {
          lastButtonState.b = false;
        }
      }
    );

    return cleanup;
  }, [
    handleNavigateUp,
    handleNavigateDown,
    handleNavigateLeft,
    handleNavigateRight,
    handleSelect,
    handleCancelMove,
  ]);

  // Cleanup adapter on unmount
  useEffect(() => {
    return () => {
      adapter.cleanup();
    };
  }, [adapter]);

  return {
    focusedIndex: inventoryState.focusedIndex,
    focusedPosition: inventoryState.focusedPosition,
    isFocused: (index: number) => inventoryState.isFocused(index),
    isMovingItem: inventoryState.isMovingItem,
    isMoveSource: (index: number) => navigateUseCase.isMoveSource(inventoryState, index),
    getItemAt: (index: number) => inventoryState.getItemAt(index),
  };
};
