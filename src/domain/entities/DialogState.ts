/**
 * DialogState Entity
 *
 * Represents the state of a dialog modal in the gaming UI.
 * Encapsulates business logic for dialog visibility and content management.
 */
export class DialogState {
  readonly isOpen: boolean;
  readonly title?: string;
  readonly content: string;
  readonly characterName?: string;

  constructor(
    isOpen: boolean,
    content: string,
    title?: string,
    characterName?: string
  ) {
    if (!content || content.trim().length === 0) {
      throw new Error('Dialog content cannot be empty');
    }

    this.isOpen = isOpen;
    this.content = content;
    this.title = title;
    this.characterName = characterName;
  }

  /**
   * Factory method to create an open dialog state
   */
  static createOpen(
    content: string,
    title?: string,
    characterName?: string
  ): DialogState {
    return new DialogState(true, content, title, characterName);
  }

  /**
   * Factory method to create a closed dialog state
   */
  static createClosed(): DialogState {
    return new DialogState(false, '');
  }

  /**
   * Creates a new DialogState with the dialog closed
   * Returns a new instance (immutable operation)
   */
  close(): DialogState {
    return new DialogState(false, this.content, this.title, this.characterName);
  }

  /**
   * Creates a new DialogState with the dialog open
   * Returns a new instance (immutable operation)
   */
  open(): DialogState {
    return new DialogState(true, this.content, this.title, this.characterName);
  }

  /**
   * Checks if the dialog has a character associated with it
   */
  hasCharacter(): boolean {
    return !!this.characterName;
  }

  /**
   * Gets the content formatted with line breaks
   * Useful for rendering subtitle-style text
   */
  getFormattedContent(): string[] {
    return this.content.split('\n').filter(line => line.trim().length > 0);
  }
}
