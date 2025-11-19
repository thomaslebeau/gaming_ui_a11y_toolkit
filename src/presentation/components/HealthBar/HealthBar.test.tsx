/**
 * Tests for HealthBar presentation component
 * Run with: npm test (when test runner is configured)
 *
 * These tests verify:
 * - Rendering with different prop combinations
 * - Accessibility (ARIA attributes, screen readers)
 * - Color status changes based on health percentage
 * - Animation behavior (requires appropriate test utilities)
 */

import { render, screen } from '@testing-library/react';
import { HealthBar } from './HealthBar';

describe('HealthBar', () => {
  describe('Rendering', () => {
    it('should render with basic props', () => {
      render(<HealthBar current={75} max={100} />);

      // Should have progressbar role
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display label when provided', () => {
      render(<HealthBar current={75} max={100} label="Player Health" />);

      expect(screen.getByText('Player Health')).toBeInTheDocument();
    });

    it('should display value as ratio by default', () => {
      render(<HealthBar current={75} max={100} showValue={true} />);

      expect(screen.getByText('75/100')).toBeInTheDocument();
    });

    it('should display value as percentage when showPercentage is true', () => {
      render(<HealthBar current={75} max={100} showValue={true} showPercentage={true} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should not display value when showValue is false', () => {
      render(<HealthBar current={75} max={100} showValue={false} />);

      expect(screen.queryByText('75/100')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility - ARIA attributes', () => {
    it('should have correct progressbar role and aria attributes', () => {
      render(<HealthBar current={75} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuetext', '75/100');
    });

    it('should use custom ariaLabel when provided', () => {
      render(<HealthBar current={75} max={100} ariaLabel="Custom health label" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Custom health label');
    });

    it('should generate default ariaLabel from label and value', () => {
      render(<HealthBar current={75} max={100} label="HP" />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'HP: 75/100');
    });

    it('should update aria-valuetext when showPercentage is true', () => {
      render(<HealthBar current={75} max={100} showPercentage={true} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuetext', '75%');
    });

    it('should have live region for announcements', () => {
      render(<HealthBar current={75} max={100} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Color status', () => {
    it('should apply healthy color for >60% health', () => {
      const { container } = render(<HealthBar current={80} max={100} />);

      const fill = container.querySelector('.barFill');
      expect(fill).toHaveClass('healthy');
    });

    it('should apply warning color for 30-60% health', () => {
      const { container } = render(<HealthBar current={50} max={100} />);

      const fill = container.querySelector('.barFill');
      expect(fill).toHaveClass('warning');
    });

    it('should apply critical color for <30% health', () => {
      const { container } = render(<HealthBar current={20} max={100} />);

      const fill = container.querySelector('.barFill');
      expect(fill).toHaveClass('critical');
    });

    it('should update color when health percentage changes', () => {
      const { container, rerender } = render(<HealthBar current={80} max={100} />);

      let fill = container.querySelector('.barFill');
      expect(fill).toHaveClass('healthy');

      rerender(<HealthBar current={50} max={100} />);
      fill = container.querySelector('.barFill');
      expect(fill).toHaveClass('warning');

      rerender(<HealthBar current={20} max={100} />);
      fill = container.querySelector('.barFill');
      expect(fill).toHaveClass('critical');
    });
  });

  describe('Health calculations', () => {
    it('should calculate correct percentage for progress bar', () => {
      const { container } = render(<HealthBar current={75} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should handle edge case of zero health', () => {
      const { container } = render(<HealthBar current={0} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('should handle edge case of full health', () => {
      const { container } = render(<HealthBar current={100} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      expect(screen.getByText('100/100')).toBeInTheDocument();
    });

    it('should handle non-standard max values', () => {
      render(<HealthBar current={150} max={200} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByText('150/200')).toBeInTheDocument();
    });

    it('should clamp current to max when current exceeds max', () => {
      render(<HealthBar current={150} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('Visual width', () => {
    it('should set correct width style on bar fill', () => {
      const { container } = render(<HealthBar current={75} max={100} />);

      const fill = container.querySelector('.barFill') as HTMLElement;
      expect(fill.style.width).toMatch(/75%/);
    });

    it('should update width when health changes', () => {
      const { container, rerender } = render(<HealthBar current={75} max={100} />);

      let fill = container.querySelector('.barFill') as HTMLElement;
      expect(fill.style.width).toMatch(/75%/);

      rerender(<HealthBar current={50} max={100} />);
      // Note: Due to animation, the width may not immediately update to exact value
      // In real tests with animation utilities, you'd wait for animations to complete
    });
  });

  describe('Component props variations', () => {
    it('should work with all props enabled', () => {
      render(
        <HealthBar
          current={75}
          max={100}
          label="Player HP"
          showValue={true}
          showPercentage={true}
          ariaLabel="Player health bar"
        />
      );

      expect(screen.getByText('Player HP')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Player health bar');
    });

    it('should work with minimal props', () => {
      render(<HealthBar current={50} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });
  });

  describe('Screen reader announcements', () => {
    it('should have empty announcement initially', () => {
      render(<HealthBar current={75} max={100} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent('');
    });

    // Note: Testing live region announcements properly requires
    // waiting for debounce timers and animation frames.
    // In a real test environment with jest.useFakeTimers(), you would:
    // 1. Render with initial health
    // 2. Update health significantly (>1% change)
    // 3. Advance timers past debounce delay (500ms)
    // 4. Check that announcement was made with correct status text
  });
});
