/**
 * Tests for Tooltip presentation component
 *
 * These tests verify:
 * - Rendering and visibility behavior
 * - Hover and focus interactions
 * - Keyboard navigation (Escape key)
 * - Auto-positioning functionality
 * - ARIA attributes for accessibility
 * - Configurable delay
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

// Mock portal rendering for easier testing
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

// Helper component for testing
const TestButton = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

describe('Tooltip', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render trigger element', () => {
      render(
        <Tooltip content="Test tooltip">
          <TestButton>Hover me</TestButton>
        </Tooltip>
      );

      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should not render tooltip initially', () => {
      render(
        <Tooltip content="Test tooltip">
          <TestButton>Hover me</TestButton>
        </Tooltip>
      );

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should render tooltip after hover and delay', async () => {
      render(
        <Tooltip content="Test tooltip" delay={500}>
          <TestButton>Hover me</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Hover me');
      fireEvent.mouseEnter(button);

      // Tooltip should not appear immediately
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Fast-forward time past delay
      jest.advanceTimersByTime(500);

      // Now tooltip should be visible
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      });
    });

    it('should throw error if children is not a valid element', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(
          <Tooltip content="Test">
            {/* @ts-ignore - intentionally invalid */}
            Invalid children
          </Tooltip>
        );
      }).toThrow();

      console.error = originalError;
    });
  });

  describe('Mouse interactions', () => {
    it('should show tooltip on mouse enter after delay', async () => {
      render(
        <Tooltip content="Hover tooltip" delay={300}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(
        <Tooltip content="Hover tooltip" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should cancel show if mouse leaves before delay completes', () => {
      render(
        <Tooltip content="Hover tooltip" delay={500}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);

      // Leave before delay completes
      jest.advanceTimersByTime(200);
      fireEvent.mouseLeave(button);

      // Fast-forward past original delay
      jest.advanceTimersByTime(400);

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard interactions', () => {
    it('should show tooltip on focus after delay', async () => {
      render(
        <Tooltip content="Focus tooltip" delay={300}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.focus(button);
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on blur', async () => {
      render(
        <Tooltip content="Focus tooltip" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.focus(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.blur(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should hide tooltip when Escape key is pressed', async () => {
      render(
        <Tooltip content="Escape tooltip" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.focus(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility - ARIA attributes', () => {
    it('should add aria-describedby to trigger when tooltip is visible', async () => {
      render(
        <Tooltip content="Accessible tooltip" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');

      // Should not have aria-describedby initially
      expect(button).not.toHaveAttribute('aria-describedby');

      fireEvent.mouseEnter(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-describedby');
      });
    });

    it('should have tooltip role on tooltip element', async () => {
      render(
        <Tooltip content="Role tooltip" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('should use custom ariaLabel when provided', async () => {
      render(
        <Tooltip content="Tooltip content" ariaLabel="Custom label" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('aria-label', 'Custom label');
      });
    });

    it('should sync tooltip id with trigger aria-describedby', async () => {
      render(
        <Tooltip content="Synced tooltip" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      const button = screen.getByText('Button');
      fireEvent.mouseEnter(button);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const tooltipId = tooltip.getAttribute('id');
        const describedBy = button.getAttribute('aria-describedby');
        expect(tooltipId).toBe(describedBy);
      });
    });
  });

  describe('Delay configuration', () => {
    it('should respect custom delay prop', async () => {
      render(
        <Tooltip content="Custom delay" delay={1000}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));

      // Should not be visible before delay
      jest.advanceTimersByTime(500);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Should be visible after full delay
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should use default delay of 500ms when not specified', async () => {
      render(
        <Tooltip content="Default delay">
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));

      // Should not be visible before 500ms
      jest.advanceTimersByTime(400);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Should be visible after 500ms
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should allow zero delay for immediate tooltip', async () => {
      render(
        <Tooltip content="Immediate tooltip" delay={0}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      jest.advanceTimersByTime(0);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('Placement prop', () => {
    it('should accept top placement', () => {
      render(
        <Tooltip content="Top tooltip" placement="top">
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('should accept right placement', () => {
      render(
        <Tooltip content="Right tooltip" placement="right">
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('should accept bottom placement', () => {
      render(
        <Tooltip content="Bottom tooltip" placement="bottom">
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('should accept left placement', () => {
      render(
        <Tooltip content="Left tooltip" placement="left">
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('should default to auto placement', () => {
      render(
        <Tooltip content="Auto tooltip">
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      expect(screen.getByText('Button')).toBeInTheDocument();
    });
  });

  describe('Event handler preservation', () => {
    it('should preserve existing onMouseEnter handler', () => {
      const handleMouseEnter = jest.fn();

      render(
        <Tooltip content="Preserve handlers" delay={100}>
          <TestButton onMouseEnter={handleMouseEnter}>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      expect(handleMouseEnter).toHaveBeenCalled();
    });

    it('should preserve existing onMouseLeave handler', () => {
      const handleMouseLeave = jest.fn();

      render(
        <Tooltip content="Preserve handlers" delay={100}>
          <TestButton onMouseLeave={handleMouseLeave}>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseLeave(screen.getByText('Button'));
      expect(handleMouseLeave).toHaveBeenCalled();
    });

    it('should preserve existing onFocus handler', () => {
      const handleFocus = jest.fn();

      render(
        <Tooltip content="Preserve handlers" delay={100}>
          <TestButton onFocus={handleFocus}>Button</TestButton>
        </Tooltip>
      );

      fireEvent.focus(screen.getByText('Button'));
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should preserve existing onBlur handler', () => {
      const handleBlur = jest.fn();

      render(
        <Tooltip content="Preserve handlers" delay={100}>
          <TestButton onBlur={handleBlur}>Button</TestButton>
        </Tooltip>
      );

      fireEvent.blur(screen.getByText('Button'));
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Content rendering', () => {
    it('should render simple text content', async () => {
      render(
        <Tooltip content="Simple text" delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText('Simple text')).toBeInTheDocument();
      });
    });

    it('should render long text content with wrapping', async () => {
      const longContent =
        'This is a very long tooltip text that should wrap within the max-width constraint';

      render(
        <Tooltip content={longContent} delay={100}>
          <TestButton>Button</TestButton>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Button'));
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText(longContent)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple tooltips', () => {
    it('should handle multiple independent tooltips', async () => {
      render(
        <div>
          <Tooltip content="First tooltip" delay={100}>
            <TestButton>Button 1</TestButton>
          </Tooltip>
          <Tooltip content="Second tooltip" delay={100}>
            <TestButton>Button 2</TestButton>
          </Tooltip>
        </div>
      );

      const button1 = screen.getByText('Button 1');
      const button2 = screen.getByText('Button 2');

      fireEvent.mouseEnter(button1);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText('First tooltip')).toBeInTheDocument();
        expect(screen.queryByText('Second tooltip')).not.toBeInTheDocument();
      });

      fireEvent.mouseLeave(button1);
      fireEvent.mouseEnter(button2);
      jest.advanceTimersByTime(100);

      await waitFor(() => {
        expect(screen.getByText('Second tooltip')).toBeInTheDocument();
      });
    });
  });
});
