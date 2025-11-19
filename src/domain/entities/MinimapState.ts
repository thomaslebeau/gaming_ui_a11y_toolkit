import { POI, Position } from './POI';

/**
 * MinimapState entity represents the state and configuration of a minimap.
 * Handles coordinate transformations, zoom, rotation, and visibility calculations.
 * Immutable entity following clean architecture principles.
 */
export class MinimapState {
  readonly playerPosition: Position;
  readonly playerRotation: number; // In degrees
  readonly pointsOfInterest: POI[];
  readonly zoom: number; // 0.5 to 2.0
  readonly rotateWithPlayer: boolean;
  readonly visibilityRange: number; // World units visible on map
  readonly isVisible: boolean;
  readonly focusedPOIId: string | null;
  readonly previousPOIsInRange: Set<string>; // For detecting new POIs entering range

  constructor(
    playerPosition: Position,
    playerRotation: number = 0,
    pointsOfInterest: POI[] = [],
    zoom: number = 1.0,
    rotateWithPlayer: boolean = false,
    visibilityRange: number = 100,
    isVisible: boolean = true,
    focusedPOIId: string | null = null,
    previousPOIsInRange: Set<string> = new Set()
  ) {
    this.playerPosition = playerPosition;
    this.playerRotation = playerRotation;
    this.pointsOfInterest = pointsOfInterest;
    this.zoom = this.clampZoom(zoom);
    this.rotateWithPlayer = rotateWithPlayer;
    this.visibilityRange = visibilityRange;
    this.isVisible = isVisible;
    this.focusedPOIId = focusedPOIId;
    this.previousPOIsInRange = previousPOIsInRange;
  }

  /**
   * Creates initial minimap state
   */
  static create(
    playerPosition: Position,
    playerRotation?: number,
    pointsOfInterest?: POI[],
    zoom?: number,
    rotateWithPlayer?: boolean
  ): MinimapState {
    return new MinimapState(
      playerPosition,
      playerRotation,
      pointsOfInterest,
      zoom,
      rotateWithPlayer
    );
  }

  /**
   * Clamps zoom value to valid range (0.5 to 2.0)
   */
  private clampZoom(zoom: number): number {
    return Math.max(0.5, Math.min(2.0, zoom));
  }

  /**
   * Updates player position
   */
  updatePlayerPosition(position: Position): MinimapState {
    return new MinimapState(
      position,
      this.playerRotation,
      this.pointsOfInterest,
      this.zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      this.isVisible,
      this.focusedPOIId,
      this.previousPOIsInRange
    );
  }

  /**
   * Updates player rotation
   */
  updatePlayerRotation(rotation: number): MinimapState {
    return new MinimapState(
      this.playerPosition,
      rotation,
      this.pointsOfInterest,
      this.zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      this.isVisible,
      this.focusedPOIId,
      this.previousPOIsInRange
    );
  }

  /**
   * Updates points of interest
   */
  updatePOIs(pois: POI[]): MinimapState {
    return new MinimapState(
      this.playerPosition,
      this.playerRotation,
      pois,
      this.zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      this.isVisible,
      this.focusedPOIId,
      this.previousPOIsInRange
    );
  }

  /**
   * Sets zoom level
   */
  setZoom(zoom: number): MinimapState {
    return new MinimapState(
      this.playerPosition,
      this.playerRotation,
      this.pointsOfInterest,
      zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      this.isVisible,
      this.focusedPOIId,
      this.previousPOIsInRange
    );
  }

  /**
   * Increases zoom level
   */
  zoomIn(step: number = 0.25): MinimapState {
    return this.setZoom(this.zoom + step);
  }

  /**
   * Decreases zoom level
   */
  zoomOut(step: number = 0.25): MinimapState {
    return this.setZoom(this.zoom - step);
  }

  /**
   * Toggles minimap visibility
   */
  toggleVisibility(): MinimapState {
    return new MinimapState(
      this.playerPosition,
      this.playerRotation,
      this.pointsOfInterest,
      this.zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      !this.isVisible,
      this.focusedPOIId,
      this.previousPOIsInRange
    );
  }

  /**
   * Sets focused POI by id
   */
  focusPOI(poiId: string | null): MinimapState {
    return new MinimapState(
      this.playerPosition,
      this.playerRotation,
      this.pointsOfInterest,
      this.zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      this.isVisible,
      poiId,
      this.previousPOIsInRange
    );
  }

  /**
   * Focuses the next POI in the list
   */
  focusNextPOI(): MinimapState {
    if (this.pointsOfInterest.length === 0) return this;

    const currentIndex = this.focusedPOIId
      ? this.pointsOfInterest.findIndex((poi) => poi.id === this.focusedPOIId)
      : -1;

    const nextIndex = (currentIndex + 1) % this.pointsOfInterest.length;
    return this.focusPOI(this.pointsOfInterest[nextIndex].id);
  }

  /**
   * Focuses the previous POI in the list
   */
  focusPreviousPOI(): MinimapState {
    if (this.pointsOfInterest.length === 0) return this;

    const currentIndex = this.focusedPOIId
      ? this.pointsOfInterest.findIndex((poi) => poi.id === this.focusedPOIId)
      : -1;

    const prevIndex =
      (currentIndex - 1 + this.pointsOfInterest.length) %
      this.pointsOfInterest.length;
    return this.focusPOI(this.pointsOfInterest[prevIndex].id);
  }

  /**
   * Gets currently focused POI
   */
  getFocusedPOI(): POI | null {
    if (!this.focusedPOIId) return null;
    return (
      this.pointsOfInterest.find((poi) => poi.id === this.focusedPOIId) || null
    );
  }

  /**
   * Gets POIs within visibility range, sorted by distance
   */
  getVisiblePOIs(): POI[] {
    return this.pointsOfInterest
      .filter((poi) => poi.isWithinRange(this.playerPosition, this.visibilityRange))
      .sort(
        (a, b) =>
          a.distanceTo(this.playerPosition) - b.distanceTo(this.playerPosition)
      );
  }

  /**
   * Gets the nearest N POIs
   */
  getNearestPOIs(count: number = 3): POI[] {
    return this.getVisiblePOIs().slice(0, count);
  }

  /**
   * Converts world coordinates to minimap coordinates
   * Returns null if position is outside visibility range
   */
  worldToMinimap(
    worldPos: Position,
    mapWidth: number,
    mapHeight: number
  ): Position | null {
    // Calculate relative position from player
    let relativeX = worldPos.x - this.playerPosition.x;
    let relativeY = worldPos.y - this.playerPosition.y;

    // Apply rotation if enabled
    if (this.rotateWithPlayer) {
      const radians = (this.playerRotation * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const rotatedX = relativeX * cos - relativeY * sin;
      const rotatedY = relativeX * sin + relativeY * cos;
      relativeX = rotatedX;
      relativeY = rotatedY;
    }

    // Apply zoom
    const scaledX = relativeX * this.zoom;
    const scaledY = relativeY * this.zoom;

    // Check if within visibility range
    const distance = Math.sqrt(scaledX * scaledX + scaledY * scaledY);
    const maxDistance = (Math.min(mapWidth, mapHeight) / 2) * this.zoom;
    if (distance > maxDistance) {
      return null;
    }

    // Convert to screen coordinates (center of minimap)
    const screenX = mapWidth / 2 + scaledX;
    const screenY = mapHeight / 2 + scaledY;

    return { x: screenX, y: screenY };
  }

  /**
   * Updates the set of POIs in range for comparison
   */
  updatePOIsInRange(): MinimapState {
    const currentPOIsInRange = new Set(
      this.getVisiblePOIs().map((poi) => poi.id)
    );

    return new MinimapState(
      this.playerPosition,
      this.playerRotation,
      this.pointsOfInterest,
      this.zoom,
      this.rotateWithPlayer,
      this.visibilityRange,
      this.isVisible,
      this.focusedPOIId,
      currentPOIsInRange
    );
  }

  /**
   * Gets POIs that newly entered range (for audio ping notifications)
   */
  getNewPOIsInRange(): POI[] {
    const currentPOIsInRange = this.getVisiblePOIs();
    return currentPOIsInRange.filter(
      (poi) => !this.previousPOIsInRange.has(poi.id)
    );
  }

  /**
   * Gets an accessible description of nearby POIs for screen readers
   */
  getAccessibleSummary(): string {
    const nearbyPOIs = this.getNearestPOIs(3);

    if (nearbyPOIs.length === 0) {
      return 'Minimap: No points of interest nearby';
    }

    const descriptions = nearbyPOIs.map((poi) =>
      poi.getAccessibleDescription(this.playerPosition)
    );

    return `Minimap: ${nearbyPOIs.length} nearby. ${descriptions.join('. ')}`;
  }
}
