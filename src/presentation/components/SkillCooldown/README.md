# SkillCooldown Component

A fully accessible, performant skill cooldown component for gaming UIs, built with React, TypeScript, and Clean Architecture.

## Features

- ✅ **Radial Cooldown Overlay**: SVG-based circular progress indicator
- ✅ **Countdown Timer**: Real-time countdown text (e.g., "3.5s")
- ✅ **Ready State Animation**: Pulsing glow effect when skill is ready
- ✅ **Disabled State**: Grayscale filter with reduced opacity
- ✅ **Charge System**: Support for multi-charge skills (e.g., 2/3 charges)
- ✅ **Hotkey Display**: Badge showing keyboard shortcut
- ✅ **Screen Reader Support**: ARIA live announcements when skill becomes ready
- ✅ **Keyboard Navigation**: Full Tab, Space, and Enter support
- ✅ **Gamepad Support**: Works with standard gamepad inputs
- ✅ **High Contrast Mode**: Bold borders and enhanced visibility
- ✅ **Reduced Motion**: Respects user's motion preferences
- ✅ **60fps Animations**: Optimized with `requestAnimationFrame` and GPU acceleration
- ✅ **Dark Mode**: Automatic dark theme support

## Architecture

This component follows Clean Architecture principles:

### Domain Layer
- **`SkillState.ts`**: Immutable entity handling cooldown calculations, charge management, and state logic

### Application Layer
- **`TrackSkillCooldown.ts`**: Use case orchestrating skill activation, cooldown updates, and state transitions

### Presentation Layer
- **`useSkillCooldown.ts`**: React hook managing state with automatic tick updates
- **`SkillCooldown.tsx`**: Pure presentational component
- **`SkillCooldown.module.css`**: CSS Modules with rem units and accessibility features

## Usage

### Basic Example

```tsx
import { SkillCooldown } from './components/SkillCooldown';
import { useSkillCooldown } from './hooks/useSkillCooldown';

function MyGameUI() {
  const fireballSkill = useSkillCooldown({
    cooldownDuration: 5000, // 5 seconds
    skillName: 'Fireball',
    onReady: () => console.log('Fireball ready!'),
  });

  return (
    <SkillCooldown
      icon="🔥"
      cooldownDuration={fireballSkill.cooldownDuration}
      remainingTime={fireballSkill.remainingTime}
      hotkey="Q"
      isReady={fireballSkill.isReady}
      ariaLabel={fireballSkill.ariaDescription}
      announcement={fireballSkill.announcement}
      shouldAnnounce={fireballSkill.shouldAnnounce}
      onActivate={() => {
        console.log('Casting Fireball!');
        fireballSkill.activate();
      }}
    />
  );
}
```

### With Charge System

```tsx
const dashSkill = useSkillCooldown({
  cooldownDuration: 3000,
  charges: { current: 3, max: 3 },
  skillName: 'Dash',
});

<SkillCooldown
  icon="⚡"
  cooldownDuration={dashSkill.cooldownDuration}
  remainingTime={dashSkill.remainingTime}
  charges={{
    current: dashSkill.currentCharges,
    max: dashSkill.maxCharges,
  }}
  hotkey="E"
  isReady={dashSkill.isReady}
  ariaLabel={dashSkill.ariaDescription}
  onActivate={() => dashSkill.activate()}
/>
```

### With Image Icon

```tsx
<SkillCooldown
  icon="/path/to/fireball-icon.png"
  cooldownDuration={5000}
  remainingTime={2300}
  hotkey="Q"
  isReady={false}
  ariaLabel="Fireball skill, 2.3 seconds remaining"
  onActivate={castFireball}
/>
```

### Disabled State

```tsx
const ultimateSkill = useSkillCooldown({
  cooldownDuration: 10000,
  isDisabled: true, // Locked until condition met
  skillName: 'Ultimate',
});

<SkillCooldown
  icon="💥"
  isDisabled={ultimateSkill.isDisabled}
  // ... other props
/>
```

## Props

### SkillCooldownProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `string \| ReactNode` | ✅ | Skill icon (URL string or React component) |
| `cooldownDuration` | `number` | ✅ | Total cooldown duration in milliseconds |
| `remainingTime` | `number` | ✅ | Remaining cooldown time in milliseconds |
| `ariaLabel` | `string` | ✅ | Accessible label for screen readers |
| `charges` | `{ current: number; max: number }` | ❌ | Optional charge system |
| `hotkey` | `string` | ❌ | Keyboard shortcut to display |
| `isReady` | `boolean` | ❌ | Whether skill is ready (default: `false`) |
| `isDisabled` | `boolean` | ❌ | Whether skill is disabled (default: `false`) |
| `onActivate` | `() => void` | ❌ | Callback when skill is activated |
| `announcement` | `string` | ❌ | Text for screen reader announcement |
| `shouldAnnounce` | `boolean` | ❌ | Whether to announce now |

### useSkillCooldown Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `cooldownDuration` | `number` | ✅ | Total cooldown duration in milliseconds |
| `skillName` | `string` | ❌ | Skill name for ARIA announcements |
| `initialRemainingTime` | `number` | ❌ | Initial remaining time (default: `0`) |
| `charges` | `{ current: number; max: number }` | ❌ | Charge system configuration |
| `isDisabled` | `boolean` | ❌ | Initial disabled state (default: `false`) |
| `onReady` | `() => void` | ❌ | Callback when skill becomes ready |
| `onActivate` | `() => void` | ❌ | Callback when skill is activated |

## Accessibility Features

### Screen Reader Support
- **ARIA live regions** announce when skills become ready
- **ARIA labels** describe current state (e.g., "Fireball ready" or "Fireball, 3.5s remaining")
- **Role="button"** with proper keyboard navigation

### Keyboard Navigation
- **Tab**: Navigate between skills
- **Space/Enter**: Activate focused skill
- **Focus indicators**: Clear visual outline

### Gamepad Support
See example file for gamepad button mapping

### High Contrast Mode
- Bold green border when ready
- Higher opacity cooldown overlay
- Stronger text shadows
- Removes glow effect in favor of border

### Reduced Motion
- Disables pulsing glow animation
- Removes transitions
- Maintains opacity for ready state

## Performance

- **60fps animations** using `requestAnimationFrame`
- **GPU acceleration** with `transform: translateZ(0)` and `will-change`
- **Optimized rendering** with `backface-visibility: hidden`
- **No layout thrashing** - uses transform/opacity for animations
- **Minimal re-renders** with React.memo and useCallback

## Styling

All styles use **rem units** for accessibility and use CSS variables for theming:

```css
--color-border-light
--color-neutral-800
--color-primary
--font-weight-bold
--timing-smooth
```

## Example Project

See `SkillCooldown.example.tsx` for a complete demo with:
- Multiple skills with different cooldowns
- Charge system
- Keyboard shortcuts (Q, E, R, F)
- Gamepad support (A, B, X, Y buttons)
- Disabled state handling

## Testing

Run the example:

```bash
npm run dev
# Navigate to the SkillCooldown example
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## License

Part of the Gaming A11y Toolkit
