/**
 * ChatMessage entity represents a single chat message in the gaming chat system.
 * Immutable entity following clean architecture principles.
 * Handles validation, sanitization, and business logic for chat messages.
 */

export type ChatMessageType = 'player' | 'system' | 'team' | 'enemy';

export interface ChatMessageData {
  id: string;
  author: string;
  content: string;
  type: ChatMessageType;
  timestamp: Date;
}

export class ChatMessage {
  readonly id: string;
  readonly author: string;
  readonly content: string;
  readonly type: ChatMessageType;
  readonly timestamp: Date;

  private static readonly MAX_CONTENT_LENGTH = 200;
  private static readonly MIN_CONTENT_LENGTH = 1;

  // Simple profanity list - can be extended or replaced with external service
  private static readonly PROFANITY_PATTERNS = [
    /\b(badword1|badword2)\b/gi, // Placeholder patterns
  ];

  constructor(data: ChatMessageData) {
    // Validate inputs
    this.validateId(data.id);
    this.validateAuthor(data.author);
    this.validateContent(data.content);
    this.validateType(data.type);
    this.validateTimestamp(data.timestamp);

    this.id = data.id;
    this.author = this.sanitizeAuthor(data.author);
    this.content = this.sanitizeContent(data.content);
    this.type = data.type;
    this.timestamp = data.timestamp;
  }

  /**
   * Creates a new ChatMessage with validated and sanitized data
   */
  static create(
    author: string,
    content: string,
    type: ChatMessageType,
    profanityFilter?: (text: string) => string
  ): ChatMessage {
    const id = this.generateId();
    const timestamp = new Date();

    let sanitizedContent = content.trim();

    // Apply profanity filter if provided
    if (profanityFilter) {
      sanitizedContent = profanityFilter(sanitizedContent);
    } else {
      // Use default profanity filtering
      sanitizedContent = this.applyDefaultProfanityFilter(sanitizedContent);
    }

    return new ChatMessage({
      id,
      author,
      content: sanitizedContent,
      type,
      timestamp,
    });
  }

  /**
   * Creates a system message (e.g., notifications, server messages)
   */
  static createSystemMessage(content: string): ChatMessage {
    return ChatMessage.create('System', content, 'system');
  }

  /**
   * Validates message ID
   */
  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('Message ID cannot be empty');
    }
  }

  /**
   * Validates author name
   */
  private validateAuthor(author: string): void {
    if (!author || author.trim().length === 0) {
      throw new Error('Author name cannot be empty');
    }
    if (author.trim().length > 50) {
      throw new Error('Author name cannot exceed 50 characters');
    }
  }

  /**
   * Validates message content
   */
  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    if (content.length < ChatMessage.MIN_CONTENT_LENGTH) {
      throw new Error(
        `Message content must be at least ${ChatMessage.MIN_CONTENT_LENGTH} character(s)`
      );
    }
    if (content.length > ChatMessage.MAX_CONTENT_LENGTH) {
      throw new Error(
        `Message content cannot exceed ${ChatMessage.MAX_CONTENT_LENGTH} characters`
      );
    }
  }

  /**
   * Validates message type
   */
  private validateType(type: ChatMessageType): void {
    const validTypes: ChatMessageType[] = ['player', 'system', 'team', 'enemy'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid message type: ${type}`);
    }
  }

  /**
   * Validates timestamp
   */
  private validateTimestamp(timestamp: Date): void {
    if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      throw new Error('Invalid timestamp');
    }
  }

  /**
   * Sanitizes author name (removes excessive whitespace, trims)
   */
  private sanitizeAuthor(author: string): string {
    return author.trim().replace(/\s+/g, ' ');
  }

  /**
   * Sanitizes message content (removes excessive whitespace, prevents XSS)
   */
  private sanitizeContent(content: string): string {
    // Trim and normalize whitespace
    let sanitized = content.trim().replace(/\s+/g, ' ');

    // Remove potential HTML/script tags to prevent XSS
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove zero-width characters and other invisible unicode
    sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');

    return sanitized;
  }

  /**
   * Applies default profanity filter to content
   */
  private static applyDefaultProfanityFilter(content: string): string {
    let filtered = content;

    for (const pattern of this.PROFANITY_PATTERNS) {
      filtered = filtered.replace(pattern, (match) => '*'.repeat(match.length));
    }

    return filtered;
  }

  /**
   * Generates a unique message ID
   */
  private static generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Formats timestamp for display (HH:MM format)
   */
  getFormattedTime(): string {
    const hours = this.timestamp.getHours().toString().padStart(2, '0');
    const minutes = this.timestamp.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Formats timestamp for accessibility (e.g., "10:30 AM")
   */
  getAccessibleTime(): string {
    return this.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Returns a screen reader friendly announcement
   */
  getAriaAnnouncement(): string {
    return `${this.type} message from ${this.author} at ${this.getAccessibleTime()}: ${this.content}`;
  }

  /**
   * Checks if message is from system
   */
  isSystemMessage(): boolean {
    return this.type === 'system';
  }

  /**
   * Checks if message is from player
   */
  isPlayerMessage(): boolean {
    return this.type === 'player';
  }

  /**
   * Checks if message is from team
   */
  isTeamMessage(): boolean {
    return this.type === 'team';
  }

  /**
   * Checks if message is from enemy
   */
  isEnemyMessage(): boolean {
    return this.type === 'enemy';
  }

  /**
   * Returns color class suffix for styling
   */
  getColorClass(): string {
    return this.type;
  }

  /**
   * Converts to plain data object
   */
  toData(): ChatMessageData {
    return {
      id: this.id,
      author: this.author,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp,
    };
  }
}
