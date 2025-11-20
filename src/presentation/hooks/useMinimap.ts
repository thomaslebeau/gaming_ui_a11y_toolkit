import { useState, useEffect, useCallback, useRef } from 'react';
import { MinimapState } from '../../domain/entities/MinimapState';
import { POI, type Position } from '../../domain/entities/POI';
import { UpdateMinimap } from '../../application/useCases/UpdateMinimap';
import { BrowserMinimapAdapter } from '../../infrastructure/adapters/BrowserMinimapAdapter';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';

interface UseMinimapOptions {
  playerPosition: Position;
  playerRotation?: number;
  pointsOfInterest: POI[];
  zoom?: number;
  rotateWithPlayer?: boolean;
  onPOIClick?: (poi: POI) => void;
  enableAudioPings?: boolean;
}

/**
 * Hook for managing minimap state with keyboard and gamepad support.
 * Handles visibility toggle, zoom, POI focus, and accessibility announcements.
 *
 * Keyboard mapping:
 * - M key: Toggle minimap visibility
 * - +/= key: Zoom in
 * - -/_ key: Zoom out
 * - Tab: Focus next POI
 * - Shift+Tab: Focus previous POI
 * - Enter: Click focused POI
 *
 * Gamepad mapping:
 * - Select button (button 8): Toggle minimap visibility
 * - D-pad Up (button 12): Focus previous POI
 * - D-pad Down (button 13): Focus next POI
 * - A button (button 0): Click focused POI
 */
export const useMinimap = ({
  playerPosition,
  playerRotation = 0,
  pointsOfInterest,
  zoom = 1.0,
  rotateWithPlayer = false,
  onPOIClick,
  enableAudioPings = true,
}: UseMinimapOptions) => {
  const [minimapState, setMinimapState] = useState<MinimapState>(() =>
    MinimapState.create(
      playerPosition,
      playerRotation,
      pointsOfInterest,
      zoom,
      rotateWithPlayer
    )
  );

  const updateUseCase = new UpdateMinimap();
  const adapterRef = useRef<BrowserMinimapAdapter | null>(null);
  const gamepadAdapterRef = useRef<BrowserGamepadAdapter | null>(null);

  // Initialize adapters
  if (!adapterRef.current) {
    adapterRef.current = new BrowserMinimapAdapter();
  }

  if (!gamepadAdapterRef.current) {
    gamepadAdapterRef.current = new BrowserGamepadAdapter();
  }

  const adapter = adapterRef.current;
  const gamepadAdapter = gamepadAdapterRef.current;

  // Update player position when it changes
  useEffect(() => {
    setMinimapState((current) =>
      updateUseCase.updatePlayerPosition(current, playerPosition)
    );
  }, [playerPosition.x, playerPosition.y]);

  // Update player rotation when it changes
  useEffect(() => {
    setMinimapState((current) =>
      updateUseCase.updatePlayerRotation(current, playerRotation)
    );
  }, [playerRotation]);

  // Update POIs when they change
  useEffect(() => {
    setMinimapState((current) => updateUseCase.updatePOIs(current, pointsOfInterest));
  }, [pointsOfInterest]);

  // Check for new POIs entering range and announce them
  useEffect(() => {
    if (!enableAudioPings) return;

    setMinimapState((current) => {
      const { newState, newPOIs } = updateUseCase.checkForNewPOIs(current);

      // Announce new POIs entering range
      newPOIs.forEach((poi) => {
        const description = poi.getAccessibleDescription(current.playerPosition);
        adapter.announcePOIEnteringRange(description);
      });

      return newState;
    });
  }, [playerPosition.x, playerPosition.y, pointsOfInterest, enableAudioPings, adapter]);

  // Announce nearby POIs periodically for screen readers
  useEffect(() => {
    if (!minimapState.isVisible) return;

    const announceInterval = setInterval(() => {
      const summary = updateUseCase.getAccessibleSummary(minimapState);
      adapter.announce(summary);
    }, 10000); // Announce every 10 seconds

    return () => clearInterval(announceInterval);
  }, [minimapState, adapter]);

  // Toggle visibility
  const handleToggleVisibility = useCallback(() => {
    setMinimapState((current) => {
      const newState = updateUseCase.toggleVisibility(current);
      adapter.announceToggle(newState.isVisible);
      return newState;
    });
  }, [adapter]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setMinimapState((current) => {
      const newState = updateUseCase.zoomIn(current);
      adapter.announceZoom(newState.zoom);
      return newState;
    });
  }, [adapter]);

  const handleZoomOut = useCallback(() => {
    setMinimapState((current) => {
      const newState = updateUseCase.zoomOut(current);
      adapter.announceZoom(newState.zoom);
      return newState;
    });
  }, [adapter]);

  // POI focus handlers
  const handleFocusNextPOI = useCallback(() => {
    setMinimapState((current) => {
      const newState = updateUseCase.focusNextPOI(current);
      const focusedPOI = updateUseCase.getFocusedPOI(newState);
      if (focusedPOI) {
        const description = focusedPOI.getAccessibleDescription(
          newState.playerPosition
        );
        adapter.announcePOIFocus(description);
      }
      return newState;
    });
  }, [adapter]);

  const handleFocusPreviousPOI = useCallback(() => {
    setMinimapState((current) => {
      const newState = updateUseCase.focusPreviousPOI(current);
      const focusedPOI = updateUseCase.getFocusedPOI(newState);
      if (focusedPOI) {
        const description = focusedPOI.getAccessibleDescription(
          newState.playerPosition
        );
        adapter.announcePOIFocus(description);
      }
      return newState;
    });
  }, [adapter]);

  const handlePOIClick = useCallback(
    (poi: POI) => {
      const description = poi.getAccessibleDescription(minimapState.playerPosition);
      adapter.announcePOIClick(description);
      if (onPOIClick) {
        onPOIClick(poi);
      }
    },
    [minimapState.playerPosition, onPOIClick, adapter]
  );

  const handleFocusedPOIClick = useCallback(() => {
    const focusedPOI = updateUseCase.getFocusedPOI(minimapState);
    if (focusedPOI) {
      handlePOIClick(focusedPOI);
    }
  }, [minimapState, handlePOIClick]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'm':
        case 'M':
          event.preventDefault();
          handleToggleVisibility();
          break;
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          event.preventDefault();
          handleZoomOut();
          break;
        case 'Tab':
          if (minimapState.isVisible && minimapState.pointsOfInterest.length > 0) {
            event.preventDefault();
            if (event.shiftKey) {
              handleFocusPreviousPOI();
            } else {
              handleFocusNextPOI();
            }
          }
          break;
        case 'Enter':
          if (minimapState.isVisible && minimapState.focusedPOIId) {
            event.preventDefault();
            handleFocusedPOIClick();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleToggleVisibility,
    handleZoomIn,
    handleZoomOut,
    handleFocusNextPOI,
    handleFocusPreviousPOI,
    handleFocusedPOIClick,
    minimapState.isVisible,
    minimapState.pointsOfInterest,
    minimapState.focusedPOIId,
  ]);

  // Gamepad navigation
  useEffect(() => {
    const gamepadUseCase = new DetectGamepadConnection(gamepadAdapter);

    let lastButtonState = {
      select: false,
      up: false,
      down: false,
      a: false,
    };

    const cleanup = gamepadUseCase.execute(
      () => {}, // onConnected
      () => {}, // onDisconnected
      (gamepadState) => {
        // Select button (button 8) - Toggle visibility
        if (gamepadState.buttonIndex === 8 && !lastButtonState.select) {
          lastButtonState.select = true;
          handleToggleVisibility();
        } else if (gamepadState.buttonIndex !== 8) {
          lastButtonState.select = false;
        }

        // D-pad Up (button 12) - Focus previous POI
        if (
          gamepadState.buttonIndex === 12 &&
          !lastButtonState.up &&
          minimapState.isVisible
        ) {
          lastButtonState.up = true;
          handleFocusPreviousPOI();
        } else if (gamepadState.buttonIndex !== 12) {
          lastButtonState.up = false;
        }

        // D-pad Down (button 13) - Focus next POI
        if (
          gamepadState.buttonIndex === 13 &&
          !lastButtonState.down &&
          minimapState.isVisible
        ) {
          lastButtonState.down = true;
          handleFocusNextPOI();
        } else if (gamepadState.buttonIndex !== 13) {
          lastButtonState.down = false;
        }

        // A button (button 0) - Click focused POI
        if (
          gamepadState.buttonIndex === 0 &&
          !lastButtonState.a &&
          minimapState.isVisible &&
          minimapState.focusedPOIId
        ) {
          lastButtonState.a = true;
          handleFocusedPOIClick();
        } else if (gamepadState.buttonIndex !== 0) {
          lastButtonState.a = false;
        }
      }
    );

    return cleanup;
  }, [
    gamepadAdapter,
    handleToggleVisibility,
    handleFocusNextPOI,
    handleFocusPreviousPOI,
    handleFocusedPOIClick,
    minimapState.isVisible,
    minimapState.focusedPOIId,
  ]);

  // Cleanup adapters on unmount
  useEffect(() => {
    return () => {
      adapter.cleanup();
      gamepadAdapter.cleanup();
    };
  }, [adapter, gamepadAdapter]);

  return {
    isVisible: minimapState.isVisible,
    zoom: minimapState.zoom,
    visiblePOIs: updateUseCase.getVisiblePOIs(minimapState),
    focusedPOIId: minimapState.focusedPOIId,
    worldToMinimap: (worldPos: Position, mapWidth: number, mapHeight: number) =>
      updateUseCase.worldToMinimap(minimapState, worldPos, mapWidth, mapHeight),
    toggleVisibility: handleToggleVisibility,
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    onPOIClick: handlePOIClick,
    playerRotation: minimapState.playerRotation,
    rotateWithPlayer: minimapState.rotateWithPlayer,
  };
};
