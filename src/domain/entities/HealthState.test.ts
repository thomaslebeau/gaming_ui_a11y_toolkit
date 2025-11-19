/**
 * Tests for HealthState domain entity
 * Run with: npm test (when test runner is configured)
 */

import { HealthState } from './HealthState';

describe('HealthState', () => {
  describe('constructor', () => {
    it('should create a valid health state', () => {
      const health = new HealthState(75, 100);
      expect(health.current).toBe(75);
      expect(health.max).toBe(100);
    });

    it('should clamp current health to max', () => {
      const health = new HealthState(150, 100);
      expect(health.current).toBe(100);
    });

    it('should throw error for non-positive max health', () => {
      expect(() => new HealthState(50, 0)).toThrow('Maximum health must be greater than 0');
      expect(() => new HealthState(50, -10)).toThrow('Maximum health must be greater than 0');
    });

    it('should throw error for negative current health', () => {
      expect(() => new HealthState(-10, 100)).toThrow('Current health cannot be negative');
    });
  });

  describe('createFull', () => {
    it('should create health state at maximum', () => {
      const health = HealthState.createFull(100);
      expect(health.current).toBe(100);
      expect(health.max).toBe(100);
      expect(health.isFull()).toBe(true);
    });
  });

  describe('fromPercentage', () => {
    it('should create health state from percentage', () => {
      const health = HealthState.fromPercentage(75, 100);
      expect(health.current).toBe(75);
      expect(health.max).toBe(100);
    });

    it('should clamp percentage to 0-100 range', () => {
      const healthOver = HealthState.fromPercentage(150, 100);
      expect(healthOver.current).toBe(100);

      const healthUnder = HealthState.fromPercentage(-50, 100);
      expect(healthUnder.current).toBe(0);
    });
  });

  describe('getPercentage', () => {
    it('should calculate correct percentage', () => {
      expect(new HealthState(75, 100).getPercentage()).toBe(75);
      expect(new HealthState(50, 200).getPercentage()).toBe(25);
      expect(new HealthState(0, 100).getPercentage()).toBe(0);
      expect(new HealthState(100, 100).getPercentage()).toBe(100);
    });

    it('should handle edge case of zero max health', () => {
      // This should not happen due to constructor validation, but test the method logic
      const health = { current: 0, max: 0, getPercentage: HealthState.prototype.getPercentage };
      expect(health.getPercentage.call(health)).toBe(0);
    });
  });

  describe('getColorStatus', () => {
    it('should return "healthy" for >60% health', () => {
      expect(new HealthState(100, 100).getColorStatus()).toBe('healthy');
      expect(new HealthState(61, 100).getColorStatus()).toBe('healthy');
      expect(new HealthState(80, 100).getColorStatus()).toBe('healthy');
    });

    it('should return "warning" for 30-60% health', () => {
      expect(new HealthState(60, 100).getColorStatus()).toBe('warning');
      expect(new HealthState(50, 100).getColorStatus()).toBe('warning');
      expect(new HealthState(30, 100).getColorStatus()).toBe('warning');
    });

    it('should return "critical" for <30% health', () => {
      expect(new HealthState(29, 100).getColorStatus()).toBe('critical');
      expect(new HealthState(10, 100).getColorStatus()).toBe('critical');
      expect(new HealthState(0, 100).getColorStatus()).toBe('critical');
    });
  });

  describe('isFull', () => {
    it('should return true when health is at maximum', () => {
      expect(new HealthState(100, 100).isFull()).toBe(true);
    });

    it('should return false when health is not at maximum', () => {
      expect(new HealthState(99, 100).isFull()).toBe(false);
      expect(new HealthState(0, 100).isFull()).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true when health is zero', () => {
      expect(new HealthState(0, 100).isEmpty()).toBe(true);
    });

    it('should return false when health is not zero', () => {
      expect(new HealthState(1, 100).isEmpty()).toBe(false);
      expect(new HealthState(100, 100).isEmpty()).toBe(false);
    });
  });

  describe('updateCurrent', () => {
    it('should return new state with updated current health', () => {
      const health = new HealthState(75, 100);
      const updated = health.updateCurrent(50);

      expect(updated.current).toBe(50);
      expect(updated.max).toBe(100);
      expect(health.current).toBe(75); // Original unchanged (immutable)
    });

    it('should clamp to max when updating', () => {
      const health = new HealthState(75, 100);
      const updated = health.updateCurrent(150);
      expect(updated.current).toBe(100);
    });
  });

  describe('updateMax', () => {
    it('should maintain percentage when updating max', () => {
      const health = new HealthState(75, 100); // 75%
      const updated = health.updateMax(200);

      expect(updated.max).toBe(200);
      expect(updated.current).toBe(150); // Still 75%
    });

    it('should handle rounding correctly', () => {
      const health = new HealthState(33, 100); // 33%
      const updated = health.updateMax(50);
      expect(updated.current).toBe(17); // Rounded from 16.5
    });
  });

  describe('takeDamage', () => {
    it('should reduce current health by damage amount', () => {
      const health = new HealthState(100, 100);
      const damaged = health.takeDamage(25);

      expect(damaged.current).toBe(75);
      expect(damaged.max).toBe(100);
    });

    it('should not go below zero', () => {
      const health = new HealthState(50, 100);
      const damaged = health.takeDamage(75);
      expect(damaged.current).toBe(0);
    });

    it('should be immutable', () => {
      const health = new HealthState(100, 100);
      health.takeDamage(25);
      expect(health.current).toBe(100); // Original unchanged
    });
  });

  describe('heal', () => {
    it('should increase current health by heal amount', () => {
      const health = new HealthState(50, 100);
      const healed = health.heal(25);

      expect(healed.current).toBe(75);
      expect(healed.max).toBe(100);
    });

    it('should not exceed maximum', () => {
      const health = new HealthState(80, 100);
      const healed = health.heal(30);
      expect(healed.current).toBe(100);
    });

    it('should be immutable', () => {
      const health = new HealthState(50, 100);
      health.heal(25);
      expect(health.current).toBe(50); // Original unchanged
    });
  });

  describe('toRatioString', () => {
    it('should format as current/max', () => {
      expect(new HealthState(75, 100).toRatioString()).toBe('75/100');
      expect(new HealthState(0, 100).toRatioString()).toBe('0/100');
      expect(new HealthState(100, 100).toRatioString()).toBe('100/100');
    });
  });

  describe('toPercentageString', () => {
    it('should format as percentage with % symbol', () => {
      expect(new HealthState(75, 100).toPercentageString()).toBe('75%');
      expect(new HealthState(0, 100).toPercentageString()).toBe('0%');
      expect(new HealthState(100, 100).toPercentageString()).toBe('100%');
    });

    it('should round to nearest integer', () => {
      expect(new HealthState(33, 100).toPercentageString()).toBe('33%');
      expect(new HealthState(67, 100).toPercentageString()).toBe('67%');
    });
  });

  describe('immutability', () => {
    it('should maintain immutability across all operations', () => {
      const original = new HealthState(75, 100);

      original.takeDamage(25);
      original.heal(25);
      original.updateCurrent(50);
      original.updateMax(200);

      // Original should be unchanged
      expect(original.current).toBe(75);
      expect(original.max).toBe(100);
    });
  });
});
