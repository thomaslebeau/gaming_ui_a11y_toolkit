import { useState, useEffect, useCallback, useMemo } from "react";
import { MenuState } from "../../domain/entities/MenuState";
import { NavigateMenu } from "../../application/useCases/NavigateMenu";
import { useGamepadContext } from "../contexts/GamepadContext";

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

  // Memoize use case to prevent recreation on every render
  const navigateMenu = useMemo(() => new NavigateMenu(), []);

  // Handle navigation actions
  const handleNavigateUp = useCallback(() => {
    setMenuState((current) => navigateMenu.navigateUp(current));
  }, [navigateMenu]);

  const handleNavigateDown = useCallback(() => {
    setMenuState((current) => navigateMenu.navigateDown(current));
  }, [navigateMenu]);

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
  // Utilise le Context centralisé
  const { onButtonPress: subscribeToButtonPress } = useGamepadContext();

  useEffect(() => {
    let lastButtonState = { up: false, down: false };

    // S'abonne aux événements de pression de bouton via le Context centralisé
    const unsubscribe = subscribeToButtonPress((gamepadState) => {
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
    });

    return unsubscribe;
  }, [handleNavigateUp, handleNavigateDown, subscribeToButtonPress]);

  return {
    focusedIndex: menuState.focusedIndex,
    isFocused: (index: number) => menuState.isFocused(index),
  };
};
