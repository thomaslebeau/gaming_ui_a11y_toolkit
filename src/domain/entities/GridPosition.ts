/**
 * GridPosition entity represents a 2D coordinate in a grid.
 * Immutable value object for grid navigation calculations.
 */
export class GridPosition {
  readonly row: number;
  readonly column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  /**
   * Creates a GridPosition from a linear index
   */
  static fromIndex(index: number, columns: number): GridPosition {
    const row = Math.floor(index / columns);
    const column = index % columns;
    return new GridPosition(row, column);
  }

  /**
   * Converts this position to a linear index
   */
  toIndex(columns: number): number {
    return this.row * columns + this.column;
  }

  /**
   * Moves up one row with optional wrapping
   */
  moveUp(rows: number, wrap: boolean = true): GridPosition {
    if (this.row === 0) {
      return wrap ? new GridPosition(rows - 1, this.column) : this;
    }
    return new GridPosition(this.row - 1, this.column);
  }

  /**
   * Moves down one row with optional wrapping
   */
  moveDown(rows: number, wrap: boolean = true): GridPosition {
    if (this.row === rows - 1) {
      return wrap ? new GridPosition(0, this.column) : this;
    }
    return new GridPosition(this.row + 1, this.column);
  }

  /**
   * Moves left one column with optional wrapping
   */
  moveLeft(columns: number, wrap: boolean = true): GridPosition {
    if (this.column === 0) {
      return wrap ? new GridPosition(this.row, columns - 1) : this;
    }
    return new GridPosition(this.row, this.column - 1);
  }

  /**
   * Moves right one column with optional wrapping
   */
  moveRight(columns: number, wrap: boolean = true): GridPosition {
    if (this.column === columns - 1) {
      return wrap ? new GridPosition(this.row, 0) : this;
    }
    return new GridPosition(this.row, this.column + 1);
  }

  /**
   * Checks if this position equals another position
   */
  equals(other: GridPosition): boolean {
    return this.row === other.row && this.column === other.column;
  }

  /**
   * Validates that this position is within bounds
   */
  isValid(rows: number, columns: number): boolean {
    return (
      this.row >= 0 &&
      this.row < rows &&
      this.column >= 0 &&
      this.column < columns
    );
  }
}
