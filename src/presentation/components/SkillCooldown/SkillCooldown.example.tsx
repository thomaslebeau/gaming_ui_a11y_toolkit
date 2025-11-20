import { useState, useEffect, useCallback } from 'react';
import { SkillCooldown } from './SkillCooldown';
import { useSkillCooldown } from '../../hooks/useSkillCooldown';
import { useGamepadContext } from '../../contexts/GamepadContext';

/**
 * Example demonstrating the SkillCooldown component with full features:
 * - Basic usage with hook
 * - Charge system
 * - Hotkey display
 * - Gamepad support
 * - Accessibility features
 */
export const SkillCooldownExample = () => {
  // Example 1: Simple skill with 5s cooldown
  const fireballSkill = useSkillCooldown({
    cooldownDuration: 5000,
    skillName: 'Fireball',
    onReady: () => console.log('Fireball is ready!'),
  });

  const handleFireballCast = () => {
    console.log('Casting Fireball!');
    fireballSkill.activate();
  };

  // Example 2: Skill with charge system (3 charges)
  const dashSkill = useSkillCooldown({
    cooldownDuration: 3000,
    charges: { current: 3, max: 3 },
    skillName: 'Dash',
    onReady: () => console.log('Dash charge restored!'),
  });

  const handleDashCast = () => {
    console.log('Dashing!');
    dashSkill.activate();
  };

  // Example 3: Disabled skill
  const [isUltimateDisabled, setIsUltimateDisabled] = useState(true);

  const ultimateSkill = useSkillCooldown({
    cooldownDuration: 10000,
    isDisabled: isUltimateDisabled,
    skillName: 'Ultimate',
  });

  const handleUltimateCast = () => {
    console.log('Casting Ultimate!');
    ultimateSkill.activate();
  };

  // Toggle ultimate enabled state after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUltimateDisabled(false);
      console.log('Ultimate unlocked!');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Example 4: Heal skill with longer cooldown
  const healSkill = useSkillCooldown({
    cooldownDuration: 15000,
    skillName: 'Heal',
  });

  const handleHealCast = () => {
    console.log('Healing!');
    healSkill.activate();
  };

  // Gamepad support - map gamepad buttons to skills - utilise le Context centralisé
  const { onButtonPress: subscribeToButtonPress } = useGamepadContext();

  useEffect(() => {
    const lastButtonState = {
      button0: false, // A/Cross - Fireball
      button1: false, // B/Circle - Dash
      button2: false, // X/Square - Heal
      button3: false, // Y/Triangle - Ultimate
    };

    // S'abonne aux événements de pression de bouton via le Context centralisé
    const unsubscribe = subscribeToButtonPress((gamepadState) => {
      // Button 0 (A/Cross) - Fireball
      if (gamepadState.buttonIndex === 0 && !lastButtonState.button0) {
        lastButtonState.button0 = true;
        if (fireballSkill.isReady && !fireballSkill.isDisabled) {
          handleFireballCast();
        }
      } else if (gamepadState.buttonIndex !== 0) {
        lastButtonState.button0 = false;
      }

      // Button 1 (B/Circle) - Dash
      if (gamepadState.buttonIndex === 1 && !lastButtonState.button1) {
        lastButtonState.button1 = true;
        if (dashSkill.isReady && !dashSkill.isDisabled) {
          handleDashCast();
        }
      } else if (gamepadState.buttonIndex !== 1) {
        lastButtonState.button1 = false;
      }

      // Button 2 (X/Square) - Heal
      if (gamepadState.buttonIndex === 2 && !lastButtonState.button2) {
        lastButtonState.button2 = true;
        if (healSkill.isReady && !healSkill.isDisabled) {
          handleHealCast();
        }
      } else if (gamepadState.buttonIndex !== 2) {
        lastButtonState.button2 = false;
      }

      // Button 3 (Y/Triangle) - Ultimate
      if (gamepadState.buttonIndex === 3 && !lastButtonState.button3) {
        lastButtonState.button3 = true;
        if (ultimateSkill.isReady && !ultimateSkill.isDisabled) {
          handleUltimateCast();
        }
      } else if (gamepadState.buttonIndex !== 3) {
        lastButtonState.button3 = false;
      }
    });

    return unsubscribe;
  }, [
    subscribeToButtonPress,
    fireballSkill.isReady,
    fireballSkill.isDisabled,
    dashSkill.isReady,
    dashSkill.isDisabled,
    healSkill.isReady,
    healSkill.isDisabled,
    ultimateSkill.isReady,
    ultimateSkill.isDisabled,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Q - Fireball
      if (event.key === 'q' || event.key === 'Q') {
        event.preventDefault();
        if (fireballSkill.isReady && !fireballSkill.isDisabled) {
          handleFireballCast();
        }
      }

      // E - Dash
      if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        if (dashSkill.isReady && !dashSkill.isDisabled) {
          handleDashCast();
        }
      }

      // R - Ultimate
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        if (ultimateSkill.isReady && !ultimateSkill.isDisabled) {
          handleUltimateCast();
        }
      }

      // F - Heal
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        if (healSkill.isReady && !healSkill.isDisabled) {
          handleHealCast();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    fireballSkill.isReady,
    fireballSkill.isDisabled,
    dashSkill.isReady,
    dashSkill.isDisabled,
    healSkill.isReady,
    healSkill.isDisabled,
    ultimateSkill.isReady,
    ultimateSkill.isDisabled,
  ]);

  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>
        SkillCooldown Component Examples
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(5rem, max-content))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Fireball - Basic skill */}
        <div>
          <SkillCooldown
            icon="🔥"
            cooldownDuration={fireballSkill.cooldownDuration}
            remainingTime={fireballSkill.remainingTime}
            hotkey="Q"
            isReady={fireballSkill.isReady}
            isDisabled={fireballSkill.isDisabled}
            ariaLabel={fireballSkill.ariaDescription}
            announcement={fireballSkill.announcement}
            shouldAnnounce={fireballSkill.shouldAnnounce}
            onActivate={handleFireballCast}
          />
          <p style={{ color: '#fff', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Fireball (Q)
          </p>
        </div>

        {/* Dash - Charge system */}
        <div>
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
            isDisabled={dashSkill.isDisabled}
            ariaLabel={dashSkill.ariaDescription}
            announcement={dashSkill.announcement}
            shouldAnnounce={dashSkill.shouldAnnounce}
            onActivate={handleDashCast}
          />
          <p style={{ color: '#fff', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Dash (E)
          </p>
        </div>

        {/* Ultimate - Disabled initially */}
        <div>
          <SkillCooldown
            icon="💥"
            cooldownDuration={ultimateSkill.cooldownDuration}
            remainingTime={ultimateSkill.remainingTime}
            hotkey="R"
            isReady={ultimateSkill.isReady}
            isDisabled={ultimateSkill.isDisabled}
            ariaLabel={ultimateSkill.ariaDescription}
            announcement={ultimateSkill.announcement}
            shouldAnnounce={ultimateSkill.shouldAnnounce}
            onActivate={handleUltimateCast}
          />
          <p style={{ color: '#fff', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Ultimate (R) {isUltimateDisabled && '🔒'}
          </p>
        </div>

        {/* Heal - Longer cooldown */}
        <div>
          <SkillCooldown
            icon="💚"
            cooldownDuration={healSkill.cooldownDuration}
            remainingTime={healSkill.remainingTime}
            hotkey="F"
            isReady={healSkill.isReady}
            isDisabled={healSkill.isDisabled}
            ariaLabel={healSkill.ariaDescription}
            announcement={healSkill.announcement}
            shouldAnnounce={healSkill.shouldAnnounce}
            onActivate={handleHealCast}
          />
          <p style={{ color: '#fff', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Heal (F)
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#2a2a2a',
          padding: '1rem',
          borderRadius: '0.5rem',
          color: '#fff',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Controls & Features
        </h2>
        <ul style={{ lineHeight: '1.75' }}>
          <li>
            <strong>Keyboard:</strong> Q (Fireball), E (Dash), R (Ultimate), F
            (Heal)
          </li>
          <li>
            <strong>Gamepad:</strong> A/Cross (Fireball), B/Circle (Dash),
            X/Square (Heal), Y/Triangle (Ultimate)
          </li>
          <li>
            <strong>Mouse/Touch:</strong> Click or tap any skill
          </li>
          <li>
            <strong>Accessibility:</strong> Tab to navigate, Space/Enter to
            activate
          </li>
          <li>
            <strong>Screen Reader:</strong> Announces when skills become ready
          </li>
          <li>
            <strong>Features:</strong>
            <ul>
              <li>Radial cooldown overlay with countdown timer</li>
              <li>Pulsing glow when ready</li>
              <li>Charge system (Dash has 3 charges)</li>
              <li>Disabled state (Ultimate locked for 5s)</li>
              <li>High contrast mode support</li>
              <li>Reduced motion support</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SkillCooldownExample;
