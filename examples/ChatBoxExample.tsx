import { useState } from 'react';
import { ChatBox } from '../src/presentation/components/ChatBox/ChatBox';
import { useChatBox } from '../src/presentation/hooks/useChatBox';
import type { ChatMessageType } from '../src/domain/entities/ChatMessage';

/**
 * ChatBox Example
 *
 * Demonstrates how to use the ChatBox component with the useChatBox hook.
 * This example shows:
 * - Basic usage with the useChatBox hook
 * - Custom profanity filter
 * - Adding system messages
 * - Controlling visibility
 */
export const ChatBoxExample = () => {
  // Custom profanity filter (optional)
  const profanityFilter = (text: string) => {
    // Replace profanity with asterisks
    return text.replace(/\b(badword|profanity)\b/gi, (match) => '*'.repeat(match.length));
  };

  // Use the chatBox hook
  const chatBox = useChatBox({
    maxMessages: 50,
    profanityFilter,
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Add some demo messages on mount
  useState(() => {
    // System welcome message
    chatBox.sendMessage(
      'Welcome to the game! Press Enter to toggle chat visibility.',
      'System',
      'system'
    );

    // Team message
    setTimeout(() => {
      chatBox.sendMessage('Hey team, ready to start?', 'TeamMate', 'team');
    }, 1000);

    // Enemy message
    setTimeout(() => {
      chatBox.sendMessage('You will never win!', 'Enemy', 'enemy');
    }, 2000);
  });

  // Handle send message (wraps the hook's sendMessage with default author)
  const handleSendMessage = (content: string) => {
    chatBox.sendMessage(content, 'Player', 'player');
  };

  // Add a system message button
  const addSystemMessage = () => {
    chatBox.sendMessage('A new player has joined the game.', 'System', 'system');
  };

  // Add a team message button
  const addTeamMessage = () => {
    chatBox.sendMessage('Great job, team!', 'TeamMate', 'team');
  };

  // Add an enemy message button
  const addEnemyMessage = () => {
    chatBox.sendMessage('Prepare to lose!', 'Enemy', 'enemy');
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: '1rem' }}>ChatBox Component Example</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={chatBox.toggleVisibility}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#00d9ff',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {chatBox.isVisible ? 'Hide Chat' : 'Show Chat'} (Enter)
        </button>

        <button
          onClick={addSystemMessage}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ffc107',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Add System Message
        </button>

        <button
          onClick={addTeamMessage}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4caf50',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Add Team Message
        </button>

        <button
          onClick={addEnemyMessage}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Add Enemy Message
        </button>
      </div>

      <div style={{ color: '#e0e0e0', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Features:</h2>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ Press <strong>Enter</strong> to toggle chat visibility</li>
          <li>✅ Press <strong>Y</strong> to open virtual keyboard (gamepad support)</li>
          <li>✅ Press <strong>Escape</strong> to close keyboard or chat</li>
          <li>✅ Color-coded messages: Player (cyan), System (yellow), Team (green), Enemy (red)</li>
          <li>✅ Character limit: 200 characters with counter</li>
          <li>✅ Screen reader announces new messages (ARIA live polite)</li>
          <li>✅ Auto-scroll to latest message</li>
          <li>✅ Profanity filter (try typing "badword" or "profanity")</li>
          <li>✅ Gamepad navigation support</li>
        </ul>
      </div>

      {/* ChatBox Component */}
      <ChatBox
        messages={chatBox.messages.map((msg) => msg.toData())}
        onSendMessage={handleSendMessage}
        maxMessages={50}
        showTimestamps={true}
        isVisible={chatBox.isVisible}
        onToggleVisibility={chatBox.toggleVisibility}
        placeholder="Type a message... (200 chars max)"
        ariaLabel="Game chat messages"
        inputValue={chatBox.inputValue}
        onInputChange={chatBox.handleInputChange}
        remainingChars={chatBox.remainingChars}
        showVirtualKeyboard={chatBox.showVirtualKeyboard}
        onToggleVirtualKeyboard={chatBox.toggleVirtualKeyboard}
        isInputFocused={chatBox.isInputFocused}
        onInputFocus={chatBox.setIsInputFocused}
        inputRef={chatBox.inputRef}
        messagesEndRef={chatBox.messagesEndRef}
      />

      {/* Instructions */}
      <div
        style={{
          color: '#e0e0e0',
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Keyboard Shortcuts:</h3>
        <ul style={{ lineHeight: '1.6', marginBottom: 0 }}>
          <li><strong>Enter</strong> - Toggle chat visibility (when not focused on input)</li>
          <li><strong>Y</strong> - Toggle virtual keyboard</li>
          <li><strong>Escape</strong> - Close virtual keyboard or chat</li>
        </ul>

        <h3>Gamepad Controls:</h3>
        <ul style={{ lineHeight: '1.6', marginBottom: 0 }}>
          <li><strong>D-pad Down</strong> - Toggle chat visibility</li>
          <li><strong>Y button</strong> - Toggle virtual keyboard</li>
          <li><strong>B button</strong> - Close virtual keyboard or chat</li>
          <li><strong>D-pad / Left stick</strong> - Navigate virtual keyboard</li>
          <li><strong>A button</strong> - Select key on virtual keyboard</li>
        </ul>
      </div>
    </div>
  );
};
