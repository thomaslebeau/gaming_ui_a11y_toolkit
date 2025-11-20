/**
 * Point of Interest (POI) entity represents a location marker on the minimap.
 * Immutable entity with distance and direction calculation capabilities.
 */

export type POIType = 'enemy' | 'objective' | 'waypoint' | 'ally';

export interface Position {
  x: number;
  y: number;
}

export class POI {
  readonly id: string;
  readonly type: POIType;
  readonly position: Position;
  readonly label: string;

  constructor(id: string, type: POIType, position: Position, label: string) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.label = label;
  }

  /**
   * Calculates the distance from this POI to another position
   */
  distanceTo(position: Position): number {
    const dx = this.position.x - position.x;
    const dy = this.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the angle (in degrees) from a position to this POI
   * 0 degrees = East, 90 = North, 180 = West, 270 = South
   */
  angleTo(fromPosition: Position): number {
    const dx = this.position.x - fromPosition.x;
    const dy = this.position.y - fromPosition.y;
    const radians = Math.atan2(-dy, dx); // Negative dy for screen coordinates
    const degrees = radians * (180 / Math.PI);
    return (degrees + 360) % 360; // Normalize to 0-360
  }

  /**
   * Gets the cardinal or intercardinal direction from a position to this POI
   * Returns one of: N, NE, E, SE, S, SW, W, NW
   */
  directionFrom(fromPosition: Position): string {
    const angle = this.angleTo(fromPosition);
    const directions = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  }

  /**
   * Checks if this POI is within a certain range of a position
   */
  isWithinRange(position: Position, range: number): boolean {
    return this.distanceTo(position) <= range;
  }

  /**
   * Gets readable description for screen readers
   */
  getAccessibleDescription(fromPosition: Position): string {
    const distance = Math.round(this.distanceTo(fromPosition));
    const direction = this.directionFrom(fromPosition);
    const typeLabel = this.type.charAt(0).toUpperCase() + this.type.slice(1);
    return `${typeLabel} ${this.label}, ${direction}, ${distance} meters`;
  }

  /**
   * Creates a new POI with updated position
   */
  withPosition(position: Position): POI {
    return new POI(this.id, this.type, position, this.label);
  }

  /**
   * Checks if this POI equals another (by id)
   */
  equals(other: POI): boolean {
    return this.id === other.id;
  }
}
