# ChatBox Component

A fully accessible gaming chat interface with gamepad support, virtual keyboard, and screen reader announcements.

## Features

✅ **Scrollable Message History** - Auto-scroll to latest messages (max 50 by default)
✅ **Color-Coded Messages** - Visual distinction for player, system, team, and enemy messages
✅ **Gamepad Support** - Full navigation and text input via virtual keyboard
✅ **Virtual Keyboard** - On-screen keyboard for gamepad text input (Y button to toggle)
✅ **Screen Reader Support** - ARIA live announcements for new messages (polite)
✅ **Character Limit** - 200 character maximum with visual counter
✅ **Profanity Filter** - Optional callback for custom content filtering
✅ **Keyboard Shortcuts** - Enter toggles visibility, Escape closes
✅ **Timestamps** - Optional display of message timestamps
✅ **Clean Architecture** - Domain entities, use cases, and presentation layers

## Architecture

```
domain/
  └── entities/
      └── ChatMessage.ts          # Message entity with validation

application/
  └── useCases/
      └── SendChatMessage.ts      # Send message use case

presentation/
  ├── components/
  │   ├── ChatBox/
  │   │   ├── ChatBox.tsx         # Main component
  │   │   ├── ChatBox.module.css  # Styles
  │   │   └── index.ts
  │   └── VirtualKeyboard/
  │       ├── VirtualKeyboard.tsx # Gamepad keyboard
  │       ├── VirtualKeyboard.module.css
  │       └── index.ts
  └── hooks/
      └── useChatBox.ts           # Main hook
```

## Basic Usage

### Simple Example (Controlled Component)

```tsx
import { ChatBox } from './presentation/components/ChatBox';
import { ChatMessageType } from './domain/entities/ChatMessage';

function MyGame() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      author: 'Player',
      content,
      type: 'player' as ChatMessageType,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <ChatBox
      messages={messages}
      onSendMessage={handleSendMessage}
      inputValue={inputValue}
      onInputChange={setInputValue}
    />
  );
}
```

### Advanced Example (With useChatBox Hook)

```tsx
import { ChatBox } from './presentation/components/ChatBox';
import { useChatBox } from './presentation/hooks/useChatBox';

function MyGame() {
  const profanityFilter = (text: string) => {
    return text.replace(/badword/gi, '***');
  };

  const chatBox = useChatBox({
    maxMessages: 100,
    profanityFilter,
    onError: (error) => console.error('Chat error:', error),
  });

  const handleSendMessage = (content: string) => {
    chatBox.sendMessage(content, 'Player', 'player');
  };

  return (
    <ChatBox
      messages={chatBox.messages.map(msg => msg.toData())}
      onSendMessage={handleSendMessage}
      showTimestamps={true}
      isVisible={chatBox.isVisible}
      onToggleVisibility={chatBox.toggleVisibility}
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
  );
}
```

## Props

### ChatBoxProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `Array<ChatMessageData>` | Required | Array of messages to display |
| `onSendMessage` | `(content: string) => void` | Required | Callback when message is sent |
| `maxMessages` | `number` | `50` | Maximum messages to display |
| `showTimestamps` | `boolean` | `false` | Show timestamps on messages |
| `isVisible` | `boolean` | `true` | Control chat visibility |
| `onToggleVisibility` | `() => void` | - | Callback to toggle visibility |
| `placeholder` | `string` | `"Type a message..."` | Input placeholder text |
| `ariaLabel` | `string` | `"Chat messages"` | Accessible label for chat |
| `inputValue` | `string` | `""` | Controlled input value |
| `onInputChange` | `(value: string) => void` | - | Input change handler |
| `remainingChars` | `number` | `200` | Remaining character count |
| `showVirtualKeyboard` | `boolean` | `false` | Show virtual keyboard overlay |
| `onToggleVirtualKeyboard` | `() => void` | - | Toggle virtual keyboard |
| `isInputFocused` | `boolean` | `false` | Input focus state |
| `onInputFocus` | `(focused: boolean) => void` | - | Focus change handler |
| `inputRef` | `RefObject<HTMLInputElement>` | - | Ref to input element |
| `messagesEndRef` | `RefObject<HTMLDivElement>` | - | Ref to messages end anchor |

## Message Types

Messages are color-coded by type:

- **player** - Cyan (`#00d9ff`) - Messages from the player
- **system** - Yellow (`#ffc107`) - System notifications
- **team** - Green (`#4caf50`) - Team chat messages
- **enemy** - Red (`#f44336`) - Enemy/opponent messages

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Toggle chat visibility (when not focused on input) |
| **Y** | Toggle virtual keyboard |
| **Escape** | Close virtual keyboard or chat |
| **Arrow Keys** | Navigate virtual keyboard |
| **Enter/Space** | Select key on virtual keyboard |

## Gamepad Controls

| Button/Axis | Action |
|-------------|--------|
| **D-pad Down** (Button 13) | Toggle chat visibility |
| **Y button** (Button 3) | Toggle virtual keyboard |
| **B button** (Button 1) | Close virtual keyboard or chat |
| **D-pad / Left stick** | Navigate virtual keyboard |
| **A button** (Button 0) | Select key on virtual keyboard |

## Accessibility Features

### Screen Reader Support

- **ARIA Live Region** - New messages announced with `aria-live="polite"`
- **Message Announcements** - Format: `"{type} message from {author} at {time}: {content}"`
- **Semantic HTML** - Proper roles (`log`, `article`, `complementary`)
- **Keyboard Navigation** - Full keyboard accessibility

### Visual Accessibility

- **High Contrast Mode** - Enhanced borders and colors
- **Reduced Motion** - Respects `prefers-reduced-motion`
- **Custom Scrollbar** - Visible scroll indicator
- **Focus Indicators** - Clear focus outlines with gaming cyan color

### Gamepad Accessibility

- **Virtual Keyboard** - Full text input without physical keyboard
- **Visual Feedback** - Selected key highlights
- **Alternative Controls** - Multiple ways to perform actions

## Profanity Filtering

### Custom Filter

```tsx
const profanityFilter = (text: string): string => {
  const badWords = ['word1', 'word2', 'word3'];
  let filtered = text;

  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, match => '*'.repeat(match.length));
  });

  return filtered;
};

const chatBox = useChatBox({ profanityFilter });
```

### External Service

```tsx
const profanityFilter = async (text: string): Promise<string> => {
  const response = await fetch('/api/filter', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  const { filtered } = await response.json();
  return filtered;
};
```

## ChatMessage Entity

The `ChatMessage` domain entity provides validation and sanitization:

```tsx
import { ChatMessage } from './domain/entities/ChatMessage';

// Create a message
const message = ChatMessage.create('Player', 'Hello!', 'player');

// Create a system message
const systemMsg = ChatMessage.createSystemMessage('Player joined');

// Validation
message.isPlayerMessage(); // true
message.getFormattedTime(); // "14:30"
message.getAccessibleTime(); // "2:30 PM"
message.getAriaAnnouncement(); // "player message from Player at 2:30 PM: Hello!"
```

## SendChatMessage Use Case

The `SendChatMessage` use case handles message creation with validation:

```tsx
import { SendChatMessage } from './application/useCases/SendChatMessage';

const useCase = new SendChatMessage(profanityFilter);

// Send a message
useCase.execute(
  'Player',
  'Hello world!',
  'player',
  (message) => console.log('Success:', message),
  (error) => console.error('Error:', error)
);

// Validate before sending
const validation = useCase.validateContent('Hi');
if (validation.valid) {
  // Send message
}

// Get character limits
useCase.getMaxLength(); // 200
useCase.getMinLength(); // 1
useCase.getRemainingCharacters('Hello'); // 195
```

## Styling

The component uses CSS Modules with design tokens:

- **Width**: `20rem` (320px)
- **Height**: `15rem` (240px)
- **Background**: Translucent dark with backdrop blur
- **All sizes in rem** for accessibility

### Customization

Override styles by importing and extending the CSS module:

```css
/* MyCustomChat.module.css */
@import '../ChatBox/ChatBox.module.css';

.chatBox {
  width: 25rem;
  height: 20rem;
}
```

## Testing

### Unit Tests

```tsx
import { ChatMessage } from './domain/entities/ChatMessage';

describe('ChatMessage', () => {
  it('should create valid message', () => {
    const message = ChatMessage.create('Player', 'Hello', 'player');
    expect(message.content).toBe('Hello');
  });

  it('should sanitize HTML', () => {
    const message = ChatMessage.create('Player', '<script>alert()</script>', 'player');
    expect(message.content).not.toContain('<script>');
  });

  it('should enforce max length', () => {
    const longText = 'a'.repeat(300);
    expect(() => {
      ChatMessage.create('Player', longText, 'player');
    }).toThrow();
  });
});
```

## Examples

See `/examples/ChatBoxExample.tsx` for a complete working example.

## License

Part of the Gaming UI A11y Toolkit
