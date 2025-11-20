import { MinimapState } from '../../domain/entities/MinimapState';
import { POI, type Position } from '../../domain/entities/POI';

/**
 * UpdateMinimap use case handles minimap state updates and interactions.
 * Orchestrates zoom, toggle, POI focus, and coordinate transformations.
 */
export class UpdateMinimap {
  /**
   * Update player position
   */
  updatePlayerPosition(
    currentState: MinimapState,
    position: Position
  ): MinimapState {
    return currentState.updatePlayerPosition(position);
  }

  /**
   * Update player rotation
   */
  updatePlayerRotation(
    currentState: MinimapState,
    rotation: number
  ): MinimapState {
    return currentState.updatePlayerRotation(rotation);
  }

  /**
   * Update points of interest
   */
  updatePOIs(currentState: MinimapState, pois: POI[]): MinimapState {
    return currentState.updatePOIs(pois);
  }

  /**
   * Zoom in on the minimap
   */
  zoomIn(currentState: MinimapState, step?: number): MinimapState {
    return currentState.zoomIn(step);
  }

  /**
   * Zoom out on the minimap
   */
  zoomOut(currentState: MinimapState, step?: number): MinimapState {
    return currentState.zoomOut(step);
  }

  /**
   * Set specific zoom level
   */
  setZoom(currentState: MinimapState, zoom: number): MinimapState {
    return currentState.setZoom(zoom);
  }

  /**
   * Toggle minimap visibility
   */
  toggleVisibility(currentState: MinimapState): MinimapState {
    return currentState.toggleVisibility();
  }

  /**
   * Focus a specific POI by id
   */
  focusPOI(currentState: MinimapState, poiId: string | null): MinimapState {
    return currentState.focusPOI(poiId);
  }

  /**
   * Focus the next POI in the list
   */
  focusNextPOI(currentState: MinimapState): MinimapState {
    return currentState.focusNextPOI();
  }

  /**
   * Focus the previous POI in the list
   */
  focusPreviousPOI(currentState: MinimapState): MinimapState {
    return currentState.focusPreviousPOI();
  }

  /**
   * Get currently focused POI
   */
  getFocusedPOI(currentState: MinimapState): POI | null {
    return currentState.getFocusedPOI();
  }

  /**
   * Get visible POIs within range
   */
  getVisiblePOIs(currentState: MinimapState): POI[] {
    return currentState.getVisiblePOIs();
  }

  /**
   * Get the nearest N POIs for screen reader announcements
   */
  getNearestPOIs(currentState: MinimapState, count?: number): POI[] {
    return currentState.getNearestPOIs(count);
  }

  /**
   * Convert world coordinates to minimap screen coordinates
   */
  worldToMinimap(
    currentState: MinimapState,
    worldPos: Position,
    mapWidth: number,
    mapHeight: number
  ): Position | null {
    return currentState.worldToMinimap(worldPos, mapWidth, mapHeight);
  }

  /**
   * Update POIs in range tracking and get newly entered POIs
   */
  checkForNewPOIs(currentState: MinimapState): {
    newState: MinimapState;
    newPOIs: POI[];
  } {
    const newPOIs = currentState.getNewPOIsInRange();
    const newState = currentState.updatePOIsInRange();
    return { newState, newPOIs };
  }

  /**
   * Get accessible description for screen readers
   */
  getAccessibleSummary(currentState: MinimapState): string {
    return currentState.getAccessibleSummary();
  }

  /**
   * Check if a POI is currently focused
   */
  isPOIFocused(currentState: MinimapState, poiId: string): boolean {
    return currentState.focusedPOIId === poiId;
  }

  /**
   * Check if minimap is currently visible
   */
  isVisible(currentState: MinimapState): boolean {
    return currentState.isVisible;
  }
}
