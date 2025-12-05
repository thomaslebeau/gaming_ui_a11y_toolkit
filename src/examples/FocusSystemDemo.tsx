/**
 * Gaming UI A11y Toolkit - Focus System Demo
 *
 * Example demonstrating the global focus management system
 */

import React, { useState } from 'react';
import { FocusProvider, useFocusable, useFocusContext } from '../index';
import './FocusSystemDemo.css';

/**
 * Individual focusable card component
 */
interface CardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  onSelect?: () => void;
}

const FocusableCard: React.FC<CardProps> = ({ id, title, description, icon, onSelect }) => {
  const focusable = useFocusable({
    id,
    group: 'cards',
    onActivate: onSelect,
  });

  return (
    <div
      {...focusable.focusProps}
      className={`focus-card ${focusable.isFocused ? 'focused' : ''}`}
    >
      <div className="card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {focusable.isFocused && <div className="focus-indicator">⭐ Focused</div>}
    </div>
  );
};

/**
 * Navigation menu with focusable buttons
 */
const NavigationMenu: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const menuItems = [
    { id: 'home', label: '🏠 Home', action: 'home' },
    { id: 'settings', label: '⚙️ Settings', action: 'settings' },
    { id: 'profile', label: '👤 Profile', action: 'profile' },
    { id: 'help', label: '❓ Help', action: 'help' },
  ];

  return (
    <nav className="navigation-menu">
      <h2>Navigation</h2>
      <div className="menu-items">
        {menuItems.map((item) => {
          const focusable = useFocusable({
            id: item.id,
            group: 'menu',
            onActivate: () => setSelectedItem(item.action),
            autoFocus: item.id === 'home', // Auto-focus first item
          });

          return (
            <button
              key={item.id}
              {...focusable.focusProps}
              className={`menu-button ${focusable.isFocused ? 'focused' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {selectedItem && (
        <div className="selected-item">
          Selected: <strong>{selectedItem}</strong>
        </div>
      )}
    </nav>
  );
};

/**
 * Grid of focusable items
 */
const ItemGrid: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const cards = [
    { id: 'card-1', title: 'Action', description: 'Fast-paced gameplay', icon: '⚔️' },
    { id: 'card-2', title: 'Adventure', description: 'Epic journeys', icon: '🗺️' },
    { id: 'card-3', title: 'Puzzle', description: 'Mind-bending challenges', icon: '🧩' },
    { id: 'card-4', title: 'Racing', description: 'High-speed thrills', icon: '🏎️' },
    { id: 'card-5', title: 'RPG', description: 'Role-playing worlds', icon: '🐉' },
    { id: 'card-6', title: 'Strategy', description: 'Tactical gameplay', icon: '♟️' },
    { id: 'card-7', title: 'Sports', description: 'Athletic competition', icon: '⚽' },
    { id: 'card-8', title: 'Simulation', description: 'Realistic experiences', icon: '✈️' },
  ];

  return (
    <div className="item-grid-section">
      <h2>Game Categories</h2>
      <div className="item-grid">
        {cards.map((card) => (
          <FocusableCard
            key={card.id}
            {...card}
            onSelect={() => setSelectedCard(card.title)}
          />
        ))}
      </div>
      {selectedCard && (
        <div className="selection-display">
          <strong>Selected:</strong> {selectedCard}
        </div>
      )}
    </div>
  );
};

/**
 * Status display showing focus context state
 */
const StatusDisplay: React.FC = () => {
  const { focusedId, isGamepadConnected } = useFocusContext();

  return (
    <div className="status-display">
      <div className="status-item">
        <span className="status-label">Gamepad:</span>
        <span className={`status-value ${isGamepadConnected ? 'connected' : 'disconnected'}`}>
          {isGamepadConnected ? '✅ Connected' : '❌ Disconnected'}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">Focused Element:</span>
        <span className="status-value">{focusedId || 'None'}</span>
      </div>
    </div>
  );
};

/**
 * Main demo component
 */
const FocusSystemDemoContent: React.FC = () => {
  return (
    <div className="focus-demo">
      <header className="demo-header">
        <h1>🎮 Global Focus Management System</h1>
        <p className="demo-description">
          Navigate using arrow keys, Tab, or gamepad D-Pad/Left Stick. Activate with Enter/Space or A button.
        </p>
        <StatusDisplay />
      </header>

      <div className="demo-content">
        <aside className="demo-sidebar">
          <NavigationMenu />
        </aside>

        <main className="demo-main">
          <ItemGrid />
        </main>
      </div>

      <footer className="demo-footer">
        <p>
          <strong>Controls:</strong> Arrow Keys / D-Pad (Navigate) • Tab/Shift+Tab (Sequential) • Enter/Space/A Button (Activate)
        </p>
      </footer>
    </div>
  );
};

/**
 * Demo wrapped with FocusProvider
 */
export const FocusSystemDemo: React.FC = () => {
  return (
    <FocusProvider
      enableHapticFeedback={true}
      navigationMode="spatial"
      joystickDeadzone={0.5}
    >
      <FocusSystemDemoContent />
    </FocusProvider>
  );
};

export default FocusSystemDemo;
