/**
 * Gaming UI A11y Toolkit - GameMenu Example
 *
 * Example demonstrating the GameMenu component with gamepad navigation
 */

import { useState } from 'react';
import { GameMenu } from '../src/components/GameMenu';
import type { GameMenuItem } from '../src/types/menu.types';
import '../src/App.css';

function GameMenuExample() {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);

  /**
   * Main menu items
   */
  const mainMenuItems: GameMenuItem[] = [
    {
      id: 'start',
      label: 'Start Game',
      icon: '🎮',
      onSelect: () => {
        setSelectedAction('Starting game...');
        setTimeout(() => setGameStarted(true), 1000);
      },
    },
    {
      id: 'continue',
      label: 'Continue',
      icon: '▶️',
      onSelect: () => {
        setSelectedAction('Continuing saved game...');
      },
      disabled: !gameStarted,
    },
    {
      id: 'options',
      label: 'Options',
      icon: '⚙️',
      onSelect: () => {
        setSelectedAction('Opening options menu...');
      },
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      onSelect: () => {
        setSelectedAction('Viewing achievements...');
      },
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: '📊',
      onSelect: () => {
        setSelectedAction('Loading leaderboard...');
      },
    },
    {
      id: 'quit',
      label: 'Quit Game',
      icon: '🚪',
      onSelect: () => {
        setSelectedAction('Quitting game...');
        setTimeout(() => setGameStarted(false), 1000);
      },
    },
  ];

  /**
   * Handle selection change
   */
  const handleSelectionChange = (index: number) => {
    console.log('Selected item index:', index);
  };

  return (
    <div className="app">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '2rem',
        padding: '2rem',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: '3rem',
            margin: '0 0 1rem 0',
            background: 'linear-gradient(135deg, #00d9ff 0%, #0066ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Gaming UI A11y Toolkit
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#e0e0e0',
            margin: 0,
          }}>
            GameMenu Component Example
          </p>
        </div>

        <GameMenu
          title="Main Menu"
          items={mainMenuItems}
          initialSelectedIndex={0}
          enableHapticFeedback={true}
          onSelectionChange={handleSelectionChange}
        />

        {selectedAction && (
          <div style={{
            padding: '1rem 2rem',
            background: 'rgba(0, 217, 255, 0.1)',
            border: '2px solid #00d9ff',
            borderRadius: '8px',
            color: '#00d9ff',
            fontSize: '1.1rem',
            fontWeight: 600,
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            {selectedAction}
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          maxWidth: '600px',
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#00d9ff',
            fontSize: '1.2rem',
          }}>
            Navigation Instructions:
          </h3>
          <ul style={{
            margin: 0,
            padding: '0 0 0 1.5rem',
            color: '#e0e0e0',
            lineHeight: '1.8',
          }}>
            <li><strong>Keyboard:</strong> Use Arrow Up/Down to navigate, Enter or Space to select</li>
            <li><strong>Gamepad D-Pad:</strong> Press Up/Down to navigate menu items</li>
            <li><strong>Gamepad Left Stick:</strong> Move Up/Down to navigate menu items</li>
            <li><strong>Gamepad A Button:</strong> Press to select the highlighted menu item</li>
            <li>Connect a gamepad to see the gamepad indicator appear</li>
            <li>The "Continue" option is disabled until you start a game</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GameMenuExample;
