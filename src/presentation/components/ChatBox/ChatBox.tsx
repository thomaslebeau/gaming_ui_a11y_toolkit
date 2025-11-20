import { useEffect, useRef } from 'react';
import { ChatMessage } from '../../../domain/entities/ChatMessage';
import { VirtualKeyboard } from '../VirtualKeyboard/VirtualKeyboard';
import styles from './ChatBox.module.css';

export interface ChatBoxProps {
  messages: Array<{
    id: string;
    author: string;
    content: string;
    type: 'player' | 'system' | 'team' | 'enemy';
    timestamp: Date;
  }>;
  onSendMessage: (content: string) => void;
  maxMessages?: number;
  showTimestamps?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  remainingChars?: number;
  showVirtualKeyboard?: boolean;
  onToggleVirtualKeyboard?: () => void;
  isInputFocused?: boolean;
  onInputFocus?: (focused: boolean) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

/**
 * ChatBox Component
 *
 * Gaming chat interface with accessibility features and gamepad support.
 * Displays scrollable message history with color-coded message types.
 *
 * Features:
 * - Scrollable message history (auto-scroll to bottom)
 * - Color-coded message bubbles by type
 * - Optional timestamps
 * - Character limit with counter
 * - Virtual keyboard for gamepad text input (Y button)
 * - Toggle visibility (Enter key / D-pad Down)
 * - Screen reader announcements for new messages
 * - Full keyboard and gamepad navigation
 */
export const ChatBox = ({
  messages,
  onSendMessage,
  maxMessages = 50,
  showTimestamps = false,
  isVisible = true,
  onToggleVisibility,
  placeholder = 'Type a message...',
  ariaLabel = 'Chat messages',
  inputValue = '',
  onInputChange,
  remainingChars = 200,
  showVirtualKeyboard = false,
  onToggleVirtualKeyboard,
  isInputFocused = false,
  onInputFocus,
  inputRef: externalInputRef,
  messagesEndRef: externalMessagesEndRef,
}: ChatBoxProps) => {
  // Local refs if not provided
  const localInputRef = useRef<HTMLInputElement>(null);
  const localMessagesEndRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Use external refs if provided, otherwise use local refs
  const inputRef = externalInputRef || localInputRef;
  const messagesEndRef = externalMessagesEndRef || localMessagesEndRef;

  // Convert plain message objects to ChatMessage entities for rendering
  const chatMessages = messages.map((msg) => new ChatMessage(msg));

  // Announce new messages to screen readers
  const lastMessageRef = useRef<ChatMessage | null>(null);

  useEffect(() => {
    if (chatMessages.length > 0) {
      const latestMessage = chatMessages[chatMessages.length - 1];

      // Only announce if it's a new message
      if (lastMessageRef.current?.id !== latestMessage.id) {
        lastMessageRef.current = latestMessage;

        // Update ARIA live region for screen reader announcement
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = latestMessage.getAriaAnnouncement();
        }
      }
    }
  }, [chatMessages]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onInputChange) {
      onInputChange(e.target.value);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();

    if (trimmed.length > 0) {
      onSendMessage(trimmed);
    }
  };

  // Handle virtual keyboard input
  const handleVirtualKeyInput = (char: string) => {
    if (onInputChange) {
      onInputChange(inputValue + char);
    }
  };

  // Handle virtual keyboard backspace
  const handleVirtualKeyBackspace = () => {
    if (onInputChange && inputValue.length > 0) {
      onInputChange(inputValue.slice(0, -1));
    }
  };

  // Handle virtual keyboard submit
  const handleVirtualKeySubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      onSendMessage(trimmed);
      if (onToggleVirtualKeyboard) {
        onToggleVirtualKeyboard();
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Y key toggles virtual keyboard when input is focused
      if (event.key === 'y' && isInputFocused && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          onToggleVirtualKeyboard?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInputFocused, onToggleVirtualKeyboard]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className={styles.chatBox} role="complementary" aria-label={ariaLabel}>
        {/* Messages list */}
        <div className={styles.messagesContainer} role="log" aria-live="polite" aria-atomic="false">
          <div className={styles.messages}>
            {chatMessages.slice(-maxMessages).map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[`message--${message.getColorClass()}`]}`}
                role="article"
                aria-label={message.getAriaAnnouncement()}
              >
                {/* Author and timestamp */}
                <div className={styles.messageHeader}>
                  <span className={styles.author}>{message.author}</span>
                  {showTimestamps && (
                    <span className={styles.timestamp} aria-label={message.getAccessibleTime()}>
                      {message.getFormattedTime()}
                    </span>
                  )}
                </div>

                {/* Message content */}
                <div className={styles.content}>{message.content}</div>
              </div>
            ))}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Empty state */}
          {chatMessages.length === 0 && (
            <div className={styles.emptyState}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Input form */}
        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => onInputFocus?.(true)}
              onBlur={() => onInputFocus?.(false)}
              placeholder={placeholder}
              maxLength={200}
              aria-label="Chat message input"
              aria-describedby="char-counter"
            />

            {/* Character counter */}
            <span
              id="char-counter"
              className={`${styles.charCounter} ${
                remainingChars < 20 ? styles['charCounter--warning'] : ''
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {remainingChars}
            </span>
          </div>

          {/* Action buttons */}
          <div className={styles.actions}>
            {/* Virtual keyboard toggle button */}
            <button
              type="button"
              className={styles.keyboardButton}
              onClick={onToggleVirtualKeyboard}
              aria-label="Toggle virtual keyboard"
              aria-pressed={showVirtualKeyboard}
              title="Virtual keyboard (Y)"
            >
              ⌨
            </button>

            {/* Send button */}
            <button
              type="submit"
              className={styles.sendButton}
              disabled={inputValue.trim().length === 0}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </form>

        {/* Visibility toggle hint */}
        {onToggleVisibility && (
          <div className={styles.hint}>
            <span className={styles.srOnly}>
              Press Enter or gamepad D-pad Down to toggle chat visibility
            </span>
            <span aria-hidden="true">Enter: Toggle • Y: Keyboard</span>
          </div>
        )}
      </div>

      {/* Virtual keyboard overlay */}
      {showVirtualKeyboard && (
        <VirtualKeyboard
          isVisible={showVirtualKeyboard}
          onClose={() => onToggleVirtualKeyboard?.()}
          onInput={handleVirtualKeyInput}
          onBackspace={handleVirtualKeyBackspace}
          onSubmit={handleVirtualKeySubmit}
          ariaLabel="Virtual keyboard for chat input"
        />
      )}

      {/* ARIA live region for new message announcements */}
      <div
        ref={liveRegionRef}
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
};
