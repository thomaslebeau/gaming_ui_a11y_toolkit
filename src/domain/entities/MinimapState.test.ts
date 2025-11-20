/**
 * Tests for MinimapState domain entity
 */

import { MinimapState } from './MinimapState';
import { POI } from './POI';

describe('MinimapState', () => {
  const defaultPlayerPos = { x: 0, y: 0 };
  const testPOIs = [
    new POI('poi1', 'enemy', { x: 10, y: 0 }, 'Enemy 1'),
    new POI('poi2', 'objective', { x: 0, y: 20 }, 'Objective'),
    new POI('poi3', 'waypoint', { x: 150, y: 0 }, 'Far Waypoint'),
  ];

  describe('constructor and create', () => {
    it('should create a valid minimap state', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs, 1.0, false);

      expect(state.playerPosition).toEqual(defaultPlayerPos);
      expect(state.playerRotation).toBe(0);
      expect(state.pointsOfInterest).toEqual(testPOIs);
      expect(state.zoom).toBe(1.0);
      expect(state.rotateWithPlayer).toBe(false);
      expect(state.isVisible).toBe(true);
    });

    it('should clamp zoom to valid range', () => {
      const tooLow = new MinimapState(defaultPlayerPos, 0, [], 0.3);
      expect(tooLow.zoom).toBe(0.5);

      const tooHigh = new MinimapState(defaultPlayerPos, 0, [], 3.0);
      expect(tooHigh.zoom).toBe(2.0);

      const valid = new MinimapState(defaultPlayerPos, 0, [], 1.5);
      expect(valid.zoom).toBe(1.5);
    });
  });

  describe('updatePlayerPosition', () => {
    it('should return new state with updated player position', () => {
      const state = MinimapState.create(defaultPlayerPos);
      const newPos = { x: 50, y: 100 };
      const updated = state.updatePlayerPosition(newPos);

      expect(updated.playerPosition).toEqual(newPos);
      expect(state.playerPosition).toEqual(defaultPlayerPos); // Original unchanged
    });
  });

  describe('updatePlayerRotation', () => {
    it('should return new state with updated rotation', () => {
      const state = MinimapState.create(defaultPlayerPos, 0);
      const updated = state.updatePlayerRotation(90);

      expect(updated.playerRotation).toBe(90);
      expect(state.playerRotation).toBe(0); // Original unchanged
    });
  });

  describe('updatePOIs', () => {
    it('should return new state with updated POIs', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, []);
      const updated = state.updatePOIs(testPOIs);

      expect(updated.pointsOfInterest).toEqual(testPOIs);
      expect(state.pointsOfInterest).toEqual([]); // Original unchanged
    });
  });

  describe('zoom operations', () => {
    it('should set zoom level', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, [], 1.0);
      const zoomed = state.setZoom(1.5);

      expect(zoomed.zoom).toBe(1.5);
      expect(state.zoom).toBe(1.0); // Original unchanged
    });

    it('should zoom in by step', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, [], 1.0);
      const zoomed = state.zoomIn(0.25);

      expect(zoomed.zoom).toBe(1.25);
    });

    it('should zoom out by step', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, [], 1.0);
      const zoomed = state.zoomOut(0.25);

      expect(zoomed.zoom).toBe(0.75);
    });

    it('should not exceed zoom limits', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, [], 2.0);
      const zoomedIn = state.zoomIn(0.5);
      expect(zoomedIn.zoom).toBe(2.0); // Clamped to max

      const state2 = MinimapState.create(defaultPlayerPos, 0, [], 0.5);
      const zoomedOut = state2.zoomOut(0.5);
      expect(zoomedOut.zoom).toBe(0.5); // Clamped to min
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle visibility state', () => {
      const state = MinimapState.create(defaultPlayerPos);
      expect(state.isVisible).toBe(true);

      const hidden = state.toggleVisibility();
      expect(hidden.isVisible).toBe(false);

      const visible = hidden.toggleVisibility();
      expect(visible.isVisible).toBe(true);
    });
  });

  describe('POI focus operations', () => {
    it('should focus a POI by id', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);
      const focused = state.focusPOI('poi2');

      expect(focused.focusedPOIId).toBe('poi2');
      expect(state.focusedPOIId).toBeNull(); // Original unchanged
    });

    it('should focus next POI in list', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);

      const first = state.focusNextPOI();
      expect(first.focusedPOIId).toBe('poi1');

      const second = first.focusNextPOI();
      expect(second.focusedPOIId).toBe('poi2');

      const third = second.focusNextPOI();
      expect(third.focusedPOIId).toBe('poi3');

      // Should wrap around
      const wrapped = third.focusNextPOI();
      expect(wrapped.focusedPOIId).toBe('poi1');
    });

    it('should focus previous POI in list', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);

      const first = state.focusPreviousPOI();
      expect(first.focusedPOIId).toBe('poi3'); // Wraps to end

      const second = first.focusPreviousPOI();
      expect(second.focusedPOIId).toBe('poi2');

      const third = second.focusPreviousPOI();
      expect(third.focusedPOIId).toBe('poi1');
    });

    it('should handle empty POI list', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, []);

      const next = state.focusNextPOI();
      expect(next.focusedPOIId).toBeNull();

      const prev = state.focusPreviousPOI();
      expect(prev.focusedPOIId).toBeNull();
    });

    it('should get focused POI', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);
      const focused = state.focusPOI('poi2');

      const poi = focused.getFocusedPOI();
      expect(poi).not.toBeNull();
      expect(poi?.id).toBe('poi2');
      expect(poi?.label).toBe('Objective');
    });

    it('should return null for unfocused state', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);
      expect(state.getFocusedPOI()).toBeNull();
    });
  });

  describe('getVisiblePOIs', () => {
    it('should return POIs within visibility range', () => {
      const state = new MinimapState(
        defaultPlayerPos,
        0,
        testPOIs,
        1.0,
        false,
        50 // Visibility range
      );

      const visible = state.getVisiblePOIs();
      expect(visible.length).toBe(2); // poi1 (10 units) and poi2 (20 units)
      expect(visible[0].id).toBe('poi1'); // Closer one first
      expect(visible[1].id).toBe('poi2');
    });

    it('should return empty array when no POIs in range', () => {
      const state = new MinimapState(
        defaultPlayerPos,
        0,
        testPOIs,
        1.0,
        false,
        5 // Very small range
      );

      const visible = state.getVisiblePOIs();
      expect(visible.length).toBe(0);
    });

    it('should sort POIs by distance', () => {
      const pois = [
        new POI('far', 'enemy', { x: 100, y: 0 }, 'Far'),
        new POI('near', 'enemy', { x: 10, y: 0 }, 'Near'),
        new POI('mid', 'enemy', { x: 50, y: 0 }, 'Mid'),
      ];

      const state = new MinimapState(defaultPlayerPos, 0, pois, 1.0, false, 200);
      const visible = state.getVisiblePOIs();

      expect(visible[0].id).toBe('near');
      expect(visible[1].id).toBe('mid');
      expect(visible[2].id).toBe('far');
    });
  });

  describe('getNearestPOIs', () => {
    it('should return nearest N POIs', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);
      const nearest = state.getNearestPOIs(2);

      expect(nearest.length).toBe(2);
      expect(nearest[0].id).toBe('poi1');
      expect(nearest[1].id).toBe('poi2');
    });

    it('should default to 3 POIs', () => {
      const manyPOIs = [
        new POI('p1', 'enemy', { x: 10, y: 0 }, 'P1'),
        new POI('p2', 'enemy', { x: 20, y: 0 }, 'P2'),
        new POI('p3', 'enemy', { x: 30, y: 0 }, 'P3'),
        new POI('p4', 'enemy', { x: 40, y: 0 }, 'P4'),
      ];

      const state = MinimapState.create(defaultPlayerPos, 0, manyPOIs);
      const nearest = state.getNearestPOIs();

      expect(nearest.length).toBe(3);
    });
  });

  describe('worldToMinimap', () => {
    it('should convert world coordinates to minimap coordinates', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, [], 1.0, false);
      const mapWidth = 200;
      const mapHeight = 200;

      // Position at player should be at center
      const center = state.worldToMinimap(defaultPlayerPos, mapWidth, mapHeight);
      expect(center).not.toBeNull();
      expect(center?.x).toBe(100);
      expect(center?.y).toBe(100);

      // Position to the right of player
      const right = state.worldToMinimap({ x: 10, y: 0 }, mapWidth, mapHeight);
      expect(right).not.toBeNull();
      expect(right!.x).toBeGreaterThan(100);
      expect(right?.y).toBe(100);
    });

    it('should return null for positions outside visibility', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, [], 1.0, false);
      const farPos = { x: 10000, y: 10000 };

      const result = state.worldToMinimap(farPos, 200, 200);
      expect(result).toBeNull();
    });

    it('should apply zoom correctly', () => {
      const state1x = MinimapState.create(defaultPlayerPos, 0, [], 1.0, false);
      const state2x = MinimapState.create(defaultPlayerPos, 0, [], 2.0, false);

      const pos = { x: 10, y: 0 };
      const result1x = state1x.worldToMinimap(pos, 200, 200);
      const result2x = state2x.worldToMinimap(pos, 200, 200);

      expect(result1x).not.toBeNull();
      expect(result2x).not.toBeNull();

      // 2x zoom should show position further from center
      expect(Math.abs(result2x!.x - 100)).toBeGreaterThan(Math.abs(result1x!.x - 100));
    });
  });

  describe('getNewPOIsInRange', () => {
    it('should detect POIs that newly entered range', () => {
      const state = new MinimapState(
        defaultPlayerPos,
        0,
        testPOIs,
        1.0,
        false,
        50,
        true,
        null,
        new Set(['poi1']) // Only poi1 was previously in range
      );

      const newPOIs = state.getNewPOIsInRange();
      expect(newPOIs.length).toBe(1);
      expect(newPOIs[0].id).toBe('poi2'); // poi2 is now in range but wasn't before
    });

    it('should return empty array when no new POIs', () => {
      const state = new MinimapState(
        defaultPlayerPos,
        0,
        testPOIs,
        1.0,
        false,
        50,
        true,
        null,
        new Set(['poi1', 'poi2']) // Both already tracked
      );

      const newPOIs = state.getNewPOIsInRange();
      expect(newPOIs.length).toBe(0);
    });
  });

  describe('getAccessibleSummary', () => {
    it('should create accessible summary for nearby POIs', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, testPOIs);
      const summary = state.getAccessibleSummary();

      expect(summary).toContain('Minimap');
      expect(summary).toContain('nearby');
    });

    it('should indicate when no POIs are nearby', () => {
      const state = MinimapState.create(defaultPlayerPos, 0, []);
      const summary = state.getAccessibleSummary();

      expect(summary).toContain('No points of interest nearby');
    });

    it('should include POI descriptions', () => {
      const nearPOIs = [
        new POI('poi1', 'enemy', { x: 10, y: 0 }, 'Goblin'),
      ];
      const state = MinimapState.create(defaultPlayerPos, 0, nearPOIs);
      const summary = state.getAccessibleSummary();

      expect(summary).toContain('Enemy');
      expect(summary).toContain('Goblin');
    });
  });

  describe('immutability', () => {
    it('should maintain immutability across all operations', () => {
      const original = MinimapState.create(defaultPlayerPos, 0, testPOIs, 1.0, false);

      // Perform various operations
      original.updatePlayerPosition({ x: 100, y: 100 });
      original.updatePlayerRotation(90);
      original.updatePOIs([]);
      original.zoomIn();
      original.zoomOut();
      original.toggleVisibility();
      original.focusNextPOI();
      original.focusPreviousPOI();

      // Original should be unchanged
      expect(original.playerPosition).toEqual(defaultPlayerPos);
      expect(original.playerRotation).toBe(0);
      expect(original.pointsOfInterest).toEqual(testPOIs);
      expect(original.zoom).toBe(1.0);
      expect(original.isVisible).toBe(true);
      expect(original.focusedPOIId).toBeNull();
    });
  });
});
