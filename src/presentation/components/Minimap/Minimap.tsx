import { useEffect, useRef } from 'react';
import { POI, Position } from '../../../domain/entities/POI';
import { useMinimap } from '../../hooks/useMinimap';
import styles from './Minimap.module.css';

export interface MinimapProps {
  /** Width of the minimap in rem */
  width: number;
  /** Height of the minimap in rem */
  height: number;
  /** Current player position in world coordinates */
  playerPosition: Position;
  /** Current player rotation in degrees (0 = East, 90 = North, etc.) */
  playerRotation?: number;
  /** Array of points of interest to display on the map */
  pointsOfInterest: Array<{
    id: string;
    type: 'enemy' | 'objective' | 'waypoint' | 'ally';
    position: Position;
    label: string;
  }>;
  /** Zoom level (0.5 to 2.0, default: 1.0) */
  zoom?: number;
  /** Whether the map rotates with player direction */
  rotateWithPlayer?: boolean;
  /** Callback when a POI is clicked */
  onPOIClick?: (poi: POI) => void;
  /** ARIA label for the minimap */
  ariaLabel?: string;
  /** Enable audio pings when POIs enter range */
  enableAudioPings?: boolean;
}

/**
 * Minimap component provides an accessible 2D map for game navigation.
 *
 * Features:
 * - Canvas-based rendering for performance
 * - Player position indicator (centered or free-roaming)
 * - Points of interest (POI): enemies, objectives, waypoints, allies
 * - Configurable zoom levels (0.5x to 2.0x)
 * - Optional rotation with player direction
 * - Screen reader announces nearby POIs with direction and distance
 * - Keyboard and gamepad support for toggling and navigation
 * - Click/select POI to focus or ping
 * - Audio pings when POIs enter range
 * - High contrast mode for POI icons
 * - Focus navigation through POIs with Tab/D-pad
 *
 * Controls:
 * - M key / Select button: Toggle minimap visibility
 * - +/= key: Zoom in
 * - -/_ key: Zoom out
 * - Tab / D-pad: Navigate through POIs
 * - Enter / A button: Select focused POI
 * - Click on POI: Select POI
 */
export const Minimap = ({
  width,
  height,
  playerPosition,
  playerRotation = 0,
  pointsOfInterest,
  zoom = 1.0,
  rotateWithPlayer = false,
  onPOIClick,
  ariaLabel = 'Game minimap',
  enableAudioPings = true,
}: MinimapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Convert POI data to domain entities
  const pois = pointsOfInterest.map(
    (poi) => new POI(poi.id, poi.type, poi.position, poi.label)
  );

  const {
    isVisible,
    zoom: currentZoom,
    visiblePOIs,
    focusedPOIId,
    worldToMinimap,
    onPOIClick: handlePOIClickFromHook,
    playerRotation: currentPlayerRotation,
    rotateWithPlayer: isRotatingWithPlayer,
  } = useMinimap({
    playerPosition,
    playerRotation,
    pointsOfInterest: pois,
    zoom,
    rotateWithPlayer,
    onPOIClick,
    enableAudioPings,
  });

  // Render minimap on canvas
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert rem to pixels (assuming 16px base font size)
    const remToPx = 16;
    const canvasWidth = width * remToPx;
    const canvasHeight = height * remToPx;

    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Save context state
    ctx.save();

    // Draw circular map background
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const mapRadius = Math.min(canvasWidth, canvasHeight) / 2 - 4;

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, mapRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Grid lines for reference
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical and horizontal lines
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - mapRadius);
    ctx.lineTo(centerX, centerY + mapRadius);
    ctx.moveTo(centerX - mapRadius, centerY);
    ctx.lineTo(centerX + mapRadius, centerY);
    ctx.stroke();

    // Draw visible POIs
    visiblePOIs.forEach((poi) => {
      const screenPos = worldToMinimap(poi.position, canvasWidth, canvasHeight);
      if (!screenPos) return; // POI outside visibility range

      const isFocused = poi.id === focusedPOIId;

      // POI color based on type
      const colors: Record<string, string> = {
        enemy: '#ff4444',
        objective: '#ffaa00',
        waypoint: '#00aaff',
        ally: '#44ff44',
      };
      const color = colors[poi.type] || '#ffffff';

      // Draw POI marker
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, isFocused ? 6 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw border for focused POI
      if (isFocused) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw icon based on type
      ctx.fillStyle = '#000';
      ctx.font = isFocused ? '10px Arial' : '8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const icons: Record<string, string> = {
        enemy: '×',
        objective: '!',
        waypoint: '▸',
        ally: '+',
      };
      const icon = icons[poi.type] || '•';
      ctx.fillText(icon, screenPos.x, screenPos.y);
    });

    // Draw player marker (always at center)
    ctx.save();
    ctx.translate(centerX, centerY);

    // Rotate player marker if rotating with player
    if (isRotatingWithPlayer) {
      ctx.rotate((currentPlayerRotation * Math.PI) / 180);
    }

    // Player triangle (pointing up/forward)
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fillStyle = '#00d9ff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Restore context state
    ctx.restore();
  }, [
    isVisible,
    width,
    height,
    visiblePOIs,
    focusedPOIId,
    worldToMinimap,
    currentPlayerRotation,
    isRotatingWithPlayer,
  ]);

  // Handle canvas click to select POI
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const remToPx = 16;
    const canvasWidth = width * remToPx;
    const canvasHeight = height * remToPx;

    // Convert click position to canvas coordinates
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // Find clicked POI
    for (const poi of visiblePOIs) {
      const screenPos = worldToMinimap(poi.position, canvasWidth, canvasHeight);
      if (!screenPos) continue;

      const dx = clickX - screenPos.x;
      const dy = clickY - screenPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if click is within POI marker
      if (distance <= 8) {
        handlePOIClickFromHook(poi);
        break;
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.minimapContainer}>
      <canvas
        ref={canvasRef}
        className={styles.minimapCanvas}
        onClick={handleCanvasClick}
        role="img"
        aria-label={ariaLabel}
        style={{
          width: `${width}rem`,
          height: `${height}rem`,
        }}
      />
      <div className={styles.controls}>
        <span className={styles.zoomIndicator}>
          Zoom: {Math.round(currentZoom * 100)}%
        </span>
        <span className={styles.hint}>Press M to toggle</span>
      </div>
    </div>
  );
};
