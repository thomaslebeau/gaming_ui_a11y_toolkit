import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatMessageType } from '../../domain/entities/ChatMessage';
import { SendChatMessage } from '../../application/useCases/SendChatMessage';
import { useGamepad } from './useGamepad';

export interface UseChatBoxOptions {
  maxMessages?: number;
  profanityFilter?: (text: string) => string;
  onError?: (error: Error) => void;
}

export interface UseChatBoxReturn {
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  showVirtualKeyboard: boolean;
  toggleVirtualKeyboard: () => void;
  sendMessage: (content: string, author: string, type: ChatMessageType) => void;
  handleInputChange: (value: string) => void;
  handleSubmit: () => void;
  remainingChars: number;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}

/**
 * useChatBox Hook
 *
 * Custom hook for managing chat box state and interactions.
 * Handles message management, gamepad input, virtual keyboard, and accessibility.
 *
 * Features:
 * - Message history with max limit
 * - Input validation and character counting
 * - Gamepad support (Y button for keyboard, Enter/D-pad Down for visibility)
 * - Auto-scroll to latest message
 * - Focus management
 * - Profanity filtering (optional)
 */
export const useChatBox = (options: UseChatBoxOptions = {}): UseChatBoxReturn => {
  const {
    maxMessages = 50,
    profanityFilter,
    onError,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use case
  const sendMessageUseCase = useRef(new SendChatMessage(profanityFilter)).current;

  // Gamepad support
  const gamepadState = useGamepad();

  // Calculate remaining characters
  const remainingChars = sendMessageUseCase.getRemainingCharacters(inputValue);

  /**
   * Scrolls to the bottom of the message list
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Adds a message to the chat
   */
  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        const updated = [...prev, message];
        // Limit to max messages
        if (updated.length > maxMessages) {
          return updated.slice(updated.length - maxMessages);
        }
        return updated;
      });
    },
    [maxMessages]
  );

  /**
   * Sends a chat message
   */
  const sendMessage = useCallback(
    (content: string, author: string, type: ChatMessageType) => {
      sendMessageUseCase.execute(
        author,
        content,
        type,
        (message) => {
          addMessage(message);
        },
        onError
      );
    },
    [sendMessageUseCase, addMessage, onError]
  );

  /**
   * Handles input value changes
   */
  const handleInputChange = useCallback(
    (value: string) => {
      // Enforce max length
      if (value.length <= sendMessageUseCase.getMaxLength()) {
        setInputValue(value);
      }
    },
    [sendMessageUseCase]
  );

  /**
   * Handles message submission
   */
  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      return; // Don't send empty messages
    }

    // Note: In real implementation, author would come from user context
    sendMessage(trimmed, 'Player', 'player');
    setInputValue('');

    // Keep focus on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [inputValue, sendMessage]);

  /**
   * Toggles chat visibility
   */
  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => {
      const newVisibility = !prev;

      // Focus input when opening
      if (newVisibility) {
        setTimeout(() => {
          inputRef.current?.focus();
          setIsInputFocused(true);
        }, 100);
      } else {
        setIsInputFocused(false);
        setShowVirtualKeyboard(false); // Close keyboard when hiding chat
      }

      return newVisibility;
    });
  }, []);

  /**
   * Toggles virtual keyboard
   */
  const toggleVirtualKeyboard = useCallback(() => {
    setShowVirtualKeyboard((prev) => !prev);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Gamepad input handling
  useEffect(() => {
    if (!gamepadState.connected || !gamepadState.buttonPressed) {
      return;
    }

    const buttonIndex = gamepadState.buttonIndex;

    // Y button (index 3) - toggle virtual keyboard
    if (buttonIndex === 3 && isVisible) {
      toggleVirtualKeyboard();
    }

    // D-pad Down (index 13) - toggle chat visibility
    if (buttonIndex === 13) {
      toggleVisibility();
    }
  }, [
    gamepadState.connected,
    gamepadState.buttonPressed,
    gamepadState.buttonIndex,
    isVisible,
    toggleVisibility,
    toggleVirtualKeyboard,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Enter key toggles chat visibility (when not focused on input)
      if (event.key === 'Enter' && !isInputFocused) {
        event.preventDefault();
        toggleVisibility();
      }

      // Escape closes virtual keyboard or chat
      if (event.key === 'Escape') {
        if (showVirtualKeyboard) {
          setShowVirtualKeyboard(false);
        } else if (isVisible) {
          toggleVisibility();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInputFocused, isVisible, showVirtualKeyboard, toggleVisibility]);

  return {
    messages,
    inputValue,
    setInputValue,
    isVisible,
    toggleVisibility,
    showVirtualKeyboard,
    toggleVirtualKeyboard,
    sendMessage,
    handleInputChange,
    handleSubmit,
    remainingChars,
    isInputFocused,
    setIsInputFocused,
    messagesEndRef,
    inputRef,
  };
};
