import { useState, useEffect, useCallback } from "react";
import { MenuState } from "../../domain/entities/MenuState";
import { NavigateMenu } from "../../application/useCases/NavigateMenu";
import { BrowserGamepadAdapter } from "../../infrastructure/adapters/BrowserGamepadAdapter";
import { DetectGamepadConnection } from "../../application/useCases/DetectGamepadConnection";

/**
 * Hook for managing menu navigation with keyboard and gamepad support.
 * Handles D-pad Up/Down (buttons 12/13) and arrow keys.
 */
export const useMenuNavigation = (
  itemCount: number,
  defaultFocusIndex: number = 0
) => {
  const [menuState, setMenuState] = useState<MenuState>(
    MenuState.create(itemCount, defaultFocusIndex)
  );

  const navigateMenu = new NavigateMenu();

  // Handle navigation actions
  const handleNavigateUp = useCallback(() => {
    setMenuState((current) => navigateMenu.navigateUp(current));
  }, []);

  const handleNavigateDown = useCallback(() => {
    setMenuState((current) => navigateMenu.navigateDown(current));
  }, []);

  // Update menu state when item count changes
  useEffect(() => {
    setMenuState((current) => current.updateItemCount(itemCount));
  }, [itemCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        handleNavigateUp();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        handleNavigateDown();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNavigateUp, handleNavigateDown]);

  // Gamepad navigation (D-pad Up = button 12, D-pad Down = button 13)
  useEffect(() => {
    const adapter = new BrowserGamepadAdapter();
    const useCase = new DetectGamepadConnection(adapter);

    let lastButtonState = { up: false, down: false };

    const cleanup = useCase.execute(
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
      }
    );

    return cleanup;
  }, [handleNavigateUp, handleNavigateDown]);

  return {
    focusedIndex: menuState.focusedIndex,
    isFocused: (index: number) => menuState.isFocused(index),
  };
};
