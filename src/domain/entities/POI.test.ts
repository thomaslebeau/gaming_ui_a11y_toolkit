/**
 * Tests for POI (Point of Interest) domain entity
 */

import { POI } from './POI';

describe('POI', () => {
  describe('constructor', () => {
    it('should create a valid POI', () => {
      const poi = new POI('poi1', 'enemy', { x: 10, y: 20 }, 'Enemy Guard');
      expect(poi.id).toBe('poi1');
      expect(poi.type).toBe('enemy');
      expect(poi.position).toEqual({ x: 10, y: 20 });
      expect(poi.label).toBe('Enemy Guard');
    });
  });

  describe('distanceTo', () => {
    it('should calculate correct distance to another position', () => {
      const poi = new POI('poi1', 'enemy', { x: 0, y: 0 }, 'Origin');

      // Distance to self should be 0
      expect(poi.distanceTo({ x: 0, y: 0 })).toBe(0);

      // Pythagorean theorem: 3-4-5 triangle
      expect(poi.distanceTo({ x: 3, y: 4 })).toBe(5);

      // Negative coordinates
      expect(poi.distanceTo({ x: -3, y: -4 })).toBe(5);
    });

    it('should handle floating point distances', () => {
      const poi = new POI('poi1', 'waypoint', { x: 0, y: 0 }, 'Start');
      const distance = poi.distanceTo({ x: 1, y: 1 });
      expect(distance).toBeCloseTo(Math.sqrt(2), 5);
    });
  });

  describe('angleTo', () => {
    it('should calculate correct angle from position', () => {
      const poi = new POI('poi1', 'objective', { x: 10, y: 0 }, 'East Point');
      const fromPos = { x: 0, y: 0 };

      // East (right) should be 0 degrees
      expect(poi.angleTo(fromPos)).toBeCloseTo(0, 1);
    });

    it('should handle angles in all quadrants', () => {
      const fromPos = { x: 0, y: 0 };

      // North (up) - 90 degrees
      const north = new POI('n', 'waypoint', { x: 0, y: -10 }, 'North');
      expect(north.angleTo(fromPos)).toBeCloseTo(90, 1);

      // West (left) - 180 degrees
      const west = new POI('w', 'waypoint', { x: -10, y: 0 }, 'West');
      expect(west.angleTo(fromPos)).toBeCloseTo(180, 1);

      // South (down) - 270 degrees
      const south = new POI('s', 'waypoint', { x: 0, y: 10 }, 'South');
      expect(south.angleTo(fromPos)).toBeCloseTo(270, 1);
    });
  });

  describe('directionFrom', () => {
    it('should return correct cardinal directions', () => {
      const fromPos = { x: 0, y: 0 };

      const east = new POI('e', 'enemy', { x: 10, y: 0 }, 'East');
      expect(east.directionFrom(fromPos)).toBe('E');

      const north = new POI('n', 'enemy', { x: 0, y: -10 }, 'North');
      expect(north.directionFrom(fromPos)).toBe('N');

      const west = new POI('w', 'enemy', { x: -10, y: 0 }, 'West');
      expect(west.directionFrom(fromPos)).toBe('W');

      const south = new POI('s', 'enemy', { x: 0, y: 10 }, 'South');
      expect(south.directionFrom(fromPos)).toBe('S');
    });

    it('should return correct intercardinal directions', () => {
      const fromPos = { x: 0, y: 0 };

      const northeast = new POI('ne', 'ally', { x: 10, y: -10 }, 'Northeast');
      expect(northeast.directionFrom(fromPos)).toBe('NE');

      const northwest = new POI('nw', 'ally', { x: -10, y: -10 }, 'Northwest');
      expect(northwest.directionFrom(fromPos)).toBe('NW');

      const southeast = new POI('se', 'ally', { x: 10, y: 10 }, 'Southeast');
      expect(southeast.directionFrom(fromPos)).toBe('SE');

      const southwest = new POI('sw', 'ally', { x: -10, y: 10 }, 'Southwest');
      expect(southwest.directionFrom(fromPos)).toBe('SW');
    });
  });

  describe('isWithinRange', () => {
    it('should correctly identify POIs within range', () => {
      const poi = new POI('poi1', 'objective', { x: 10, y: 0 }, 'Objective');
      const position = { x: 0, y: 0 };

      expect(poi.isWithinRange(position, 15)).toBe(true);
      expect(poi.isWithinRange(position, 10)).toBe(true);
      expect(poi.isWithinRange(position, 5)).toBe(false);
    });

    it('should handle edge case of exact distance', () => {
      const poi = new POI('poi1', 'waypoint', { x: 3, y: 4 }, 'Point');
      const position = { x: 0, y: 0 };

      // Distance is exactly 5
      expect(poi.isWithinRange(position, 5)).toBe(true);
      expect(poi.isWithinRange(position, 4.99)).toBe(false);
    });
  });

  describe('getAccessibleDescription', () => {
    it('should format a complete accessible description', () => {
      const poi = new POI('poi1', 'enemy', { x: 10, y: 0 }, 'Goblin');
      const fromPos = { x: 0, y: 0 };

      const description = poi.getAccessibleDescription(fromPos);
      expect(description).toContain('Enemy');
      expect(description).toContain('Goblin');
      expect(description).toContain('10 meters');
      expect(description).toContain('E'); // Direction
    });

    it('should capitalize POI type in description', () => {
      const ally = new POI('ally1', 'ally', { x: 5, y: 0 }, 'Teammate');
      const description = ally.getAccessibleDescription({ x: 0, y: 0 });
      expect(description).toContain('Ally');
    });

    it('should include distance and direction', () => {
      const poi = new POI('obj1', 'objective', { x: 0, y: -20 }, 'Flag');
      const description = poi.getAccessibleDescription({ x: 0, y: 0 });

      expect(description).toMatch(/\d+ meters/);
      expect(description).toContain('N'); // North direction
    });
  });

  describe('withPosition', () => {
    it('should return new POI with updated position', () => {
      const original = new POI('poi1', 'waypoint', { x: 10, y: 20 }, 'Point A');
      const updated = original.withPosition({ x: 30, y: 40 });

      expect(updated.position).toEqual({ x: 30, y: 40 });
      expect(updated.id).toBe('poi1');
      expect(updated.type).toBe('waypoint');
      expect(updated.label).toBe('Point A');

      // Original should be unchanged (immutable)
      expect(original.position).toEqual({ x: 10, y: 20 });
    });
  });

  describe('equals', () => {
    it('should return true for POIs with same id', () => {
      const poi1 = new POI('poi1', 'enemy', { x: 10, y: 20 }, 'Enemy A');
      const poi2 = new POI('poi1', 'enemy', { x: 30, y: 40 }, 'Enemy B');

      expect(poi1.equals(poi2)).toBe(true);
    });

    it('should return false for POIs with different ids', () => {
      const poi1 = new POI('poi1', 'enemy', { x: 10, y: 20 }, 'Enemy A');
      const poi2 = new POI('poi2', 'enemy', { x: 10, y: 20 }, 'Enemy A');

      expect(poi1.equals(poi2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should maintain immutability across operations', () => {
      const original = new POI('poi1', 'objective', { x: 10, y: 20 }, 'Objective');

      // Perform operations that return new POIs
      original.withPosition({ x: 50, y: 60 });
      original.distanceTo({ x: 100, y: 100 });
      original.getAccessibleDescription({ x: 0, y: 0 });

      // Original should be unchanged
      expect(original.position).toEqual({ x: 10, y: 20 });
      expect(original.id).toBe('poi1');
      expect(original.type).toBe('objective');
      expect(original.label).toBe('Objective');
    });
  });

  describe('all POI types', () => {
    it('should handle all supported POI types', () => {
      const types = ['enemy', 'objective', 'waypoint', 'ally'] as const;

      types.forEach((type) => {
        const poi = new POI(`id-${type}`, type, { x: 0, y: 0 }, `Test ${type}`);
        expect(poi.type).toBe(type);

        const description = poi.getAccessibleDescription({ x: 0, y: 0 });
        expect(description).toContain(type.charAt(0).toUpperCase() + type.slice(1));
      });
    });
  });
});
