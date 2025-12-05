/**
 * Gaming UI A11y Toolkit - Global Selection Demo
 *
 * Demonstration of the global selection system with multiple menus
 * Shows a header menu and a central menu working together
 */

import React, { useState } from 'react';
import { FocusProvider, useFocusable, useFocusContext } from '../index';
import './GlobalSelectionDemo.css';

/**
 * Header Menu Component
 * Horizontal menu at the top of the page
 */
const HeaderMenu: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const headerItems = [
    { id: 'header-library', label: '📚 Library', icon: '📚' },
    { id: 'header-store', label: '🛒 Store', icon: '🛒' },
    { id: 'header-community', label: '👥 Community', icon: '👥' },
    { id: 'header-profile', label: '👤 Profile', icon: '👤' },
    { id: 'header-settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  return (
    <header className="header-menu">
      <div className="header-logo">🎮 GameHub</div>
      <nav className="header-nav">
        {headerItems.map((item, index) => {
          const focusable = useFocusable({
            id: item.id,
            group: 'header',
            onActivate: () => setSelectedItem(item.label),
            autoFocus: index === 0, // Auto-focus first item
            priority: 100, // Higher priority for header
          });

          return (
            <button
              key={item.id}
              {...focusable.focusProps}
              className={`header-button ${focusable.isFocused ? 'focused' : ''}`}
            >
              <span className="header-icon">{item.icon}</span>
              <span className="header-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
      {selectedItem && (
        <div className="header-status">
          Selected: <strong>{selectedItem}</strong>
        </div>
      )}
    </header>
  );
};

/**
 * Central Menu Component
 * Main vertical menu in the center area
 */
const CentralMenu: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const menuItems = [
    { id: 'menu-new-game', label: 'New Game', icon: '🆕', description: 'Start a new game' },
    { id: 'menu-continue', label: 'Continue', icon: '▶️', description: 'Resume your progress' },
    { id: 'menu-load-game', label: 'Load Game', icon: '📂', description: 'Load a saved game' },
    { id: 'menu-multiplayer', label: 'Multiplayer', icon: '🌐', description: 'Play with friends' },
    { id: 'menu-challenges', label: 'Challenges', icon: '🏆', description: 'Complete challenges' },
    { id: 'menu-achievements', label: 'Achievements', icon: '⭐', description: 'View your achievements' },
  ];

  return (
    <div className="central-menu-container">
      <h2 className="central-menu-title">Main Menu</h2>
      <nav className="central-menu">
        {menuItems.map((item) => {
          const focusable = useFocusable({
            id: item.id,
            group: 'main-menu',
            onActivate: () => setSelectedGame(item.label),
          });

          return (
            <div
              key={item.id}
              {...focusable.focusProps}
              className={`central-menu-item ${focusable.isFocused ? 'focused' : ''}`}
            >
              <div className="menu-item-icon">{item.icon}</div>
              <div className="menu-item-content">
                <div className="menu-item-label">{item.label}</div>
                <div className="menu-item-description">{item.description}</div>
              </div>
              {focusable.isFocused && (
                <div className="menu-item-indicator">→</div>
              )}
            </div>
          );
        })}
      </nav>
      {selectedGame && (
        <div className="central-menu-selection">
          <strong>Action:</strong> {selectedGame}
        </div>
      )}
    </div>
  );
};

/**
 * Quick Actions Panel
 * Additional focusable elements in a side panel
 */
const QuickActionsPanel: React.FC = () => {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const quickActions = [
    { id: 'quick-favorites', label: 'Favorites', icon: '❤️' },
    { id: 'quick-recent', label: 'Recent', icon: '🕐' },
    { id: 'quick-downloads', label: 'Downloads', icon: '⬇️' },
    { id: 'quick-friends', label: 'Friends', icon: '👫' },
  ];

  return (
    <aside className="quick-actions-panel">
      <h3 className="panel-title">Quick Access</h3>
      <div className="quick-actions">
        {quickActions.map((action) => {
          const focusable = useFocusable({
            id: action.id,
            group: 'quick-actions',
            onActivate: () => setLastAction(action.label),
          });

          return (
            <button
              key={action.id}
              {...focusable.focusProps}
              className={`quick-action-button ${focusable.isFocused ? 'focused' : ''}`}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          );
        })}
      </div>
      {lastAction && (
        <div className="panel-status">
          Opened: <strong>{lastAction}</strong>
        </div>
      )}
    </aside>
  );
};

/**
 * Game Cards Grid
 * Grid of game cards that can be focused
 */
interface GameCardProps {
  id: string;
  title: string;
  genre: string;
  rating: string;
  image: string;
  onSelect: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, genre, rating, image, onSelect }) => {
  const focusable = useFocusable({
    id,
    group: 'game-cards',
    onActivate: onSelect,
  });

  return (
    <div
      {...focusable.focusProps}
      className={`game-card ${focusable.isFocused ? 'focused' : ''}`}
    >
      <div className="game-card-image">{image}</div>
      <div className="game-card-content">
        <h4 className="game-card-title">{title}</h4>
        <div className="game-card-info">
          <span className="game-genre">{genre}</span>
          <span className="game-rating">{rating} ⭐</span>
        </div>
      </div>
      {focusable.isFocused && (
        <div className="game-card-overlay">
          <div className="overlay-text">Press Enter to Launch</div>
        </div>
      )}
    </div>
  );
};

const GameCardsGrid: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    { id: 'game-1', title: 'Cyber Quest', genre: 'RPG', rating: '4.8', image: '🎮' },
    { id: 'game-2', title: 'Speed Racer', genre: 'Racing', rating: '4.5', image: '🏎️' },
    { id: 'game-3', title: 'Puzzle Master', genre: 'Puzzle', rating: '4.9', image: '🧩' },
    { id: 'game-4', title: 'Space Battle', genre: 'Action', rating: '4.7', image: '🚀' },
    { id: 'game-5', title: 'Farm Life', genre: 'Simulation', rating: '4.6', image: '🌾' },
    { id: 'game-6', title: 'Mystery Island', genre: 'Adventure', rating: '4.8', image: '🏝️' },
  ];

  return (
    <div className="game-cards-section">
      <h3 className="section-title">Featured Games</h3>
      <div className="game-cards-grid">
        {games.map((game) => (
          <GameCard
            key={game.id}
            {...game}
            onSelect={() => setSelectedGame(game.title)}
          />
        ))}
      </div>
      {selectedGame && (
        <div className="game-selection-display">
          <strong>Launching:</strong> {selectedGame}
        </div>
      )}
    </div>
  );
};

/**
 * Status Display
 * Shows the current focus state and connection status
 */
const StatusDisplay: React.FC = () => {
  const { focusedId, isGamepadConnected } = useFocusContext();

  return (
    <div className="global-status-display">
      <div className="status-item">
        <span className="status-icon">🎮</span>
        <span className="status-label">Gamepad:</span>
        <span className={`status-badge ${isGamepadConnected ? 'connected' : 'disconnected'}`}>
          {isGamepadConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
      <div className="status-item">
        <span className="status-icon">🎯</span>
        <span className="status-label">Focus:</span>
        <span className="status-value">{focusedId || 'None'}</span>
      </div>
    </div>
  );
};

/**
 * Main Demo Content
 */
const GlobalSelectionDemoContent: React.FC = () => {
  return (
    <div className="global-selection-demo">
      {/* Header Menu */}
      <HeaderMenu />

      {/* Main Content Area */}
      <div className="demo-layout">
        {/* Sidebar with Central Menu */}
        <aside className="sidebar">
          <CentralMenu />
          <QuickActionsPanel />
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="welcome-banner">
            <h1>🎮 Global Selection System Demo</h1>
            <p className="demo-subtitle">
              Navigate between different menus and elements using arrow keys, Tab, or gamepad
            </p>
            <StatusDisplay />
          </div>

          <GameCardsGrid />
        </main>
      </div>

      {/* Footer with Controls */}
      <footer className="demo-footer">
        <div className="controls-section">
          <div className="control-group">
            <strong>Keyboard:</strong>
            <span className="control-hint">Arrow Keys = Navigate</span>
            <span className="control-hint">Tab/Shift+Tab = Sequential</span>
            <span className="control-hint">Enter/Space = Activate</span>
          </div>
          <div className="control-group">
            <strong>Gamepad:</strong>
            <span className="control-hint">D-Pad/Left Stick = Navigate</span>
            <span className="control-hint">A Button = Activate</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * Global Selection Demo wrapped with FocusProvider
 */
export const GlobalSelectionDemo: React.FC = () => {
  return (
    <FocusProvider
      enableHapticFeedback={true}
      navigationMode="spatial"
      joystickDeadzone={0.5}
      navigationDelay={150}
    >
      <GlobalSelectionDemoContent />
    </FocusProvider>
  );
};

export default GlobalSelectionDemo;
