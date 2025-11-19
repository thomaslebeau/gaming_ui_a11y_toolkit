import { ChatMessage, ChatMessageType } from '../../domain/entities/ChatMessage';

/**
 * SendChatMessage Use Case
 *
 * Orchestrates the process of creating and sending a chat message.
 * Handles validation, sanitization, and applies optional profanity filtering.
 *
 * Responsibilities:
 * - Create validated ChatMessage entities
 * - Apply profanity filtering (optional callback)
 * - Invoke callback to notify message was sent
 * - Handle errors gracefully
 */
export class SendChatMessage {
  private profanityFilter?: (text: string) => string;

  constructor(profanityFilter?: (text: string) => string) {
    this.profanityFilter = profanityFilter;
  }

  /**
   * Executes the send message use case
   *
   * @param author - The author of the message
   * @param content - The message content
   * @param type - The type of message (player, team, system, enemy)
   * @param onSuccess - Callback invoked when message is successfully created
   * @param onError - Callback invoked when an error occurs
   * @returns The created ChatMessage or null if failed
   */
  execute(
    author: string,
    content: string,
    type: ChatMessageType,
    onSuccess: (message: ChatMessage) => void,
    onError?: (error: Error) => void
  ): ChatMessage | null {
    try {
      // Create and validate message using domain entity
      const message = ChatMessage.create(author, content, type, this.profanityFilter);

      // Notify success
      onSuccess(message);

      return message;
    } catch (error) {
      // Handle errors
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');

      if (onError) {
        onError(errorObj);
      } else {
        // Log error if no error handler provided
        console.error('Failed to send chat message:', errorObj.message);
      }

      return null;
    }
  }

  /**
   * Creates a system message (convenience method)
   *
   * @param content - The message content
   * @param onSuccess - Callback invoked when message is successfully created
   * @param onError - Callback invoked when an error occurs
   * @returns The created ChatMessage or null if failed
   */
  executeSystemMessage(
    content: string,
    onSuccess: (message: ChatMessage) => void,
    onError?: (error: Error) => void
  ): ChatMessage | null {
    return this.execute('System', content, 'system', onSuccess, onError);
  }

  /**
   * Validates message content before sending (pre-flight check)
   * Useful for providing real-time validation feedback to users
   *
   * @param content - The message content to validate
   * @returns Object with validation result and error message if invalid
   */
  validateContent(content: string): { valid: boolean; error?: string } {
    try {
      // Try to create a temporary message to check validation
      ChatMessage.create('Temp', content, 'player', this.profanityFilter);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid message content',
      };
    }
  }

  /**
   * Gets the maximum allowed message length
   */
  getMaxLength(): number {
    return 200; // Match ChatMessage.MAX_CONTENT_LENGTH
  }

  /**
   * Gets the minimum allowed message length
   */
  getMinLength(): number {
    return 1; // Match ChatMessage.MIN_CONTENT_LENGTH
  }

  /**
   * Checks if content length is within limits
   */
  isValidLength(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.length >= this.getMinLength() && trimmed.length <= this.getMaxLength();
  }

  /**
   * Gets remaining characters for message
   */
  getRemainingCharacters(content: string): number {
    return this.getMaxLength() - content.length;
  }
}
