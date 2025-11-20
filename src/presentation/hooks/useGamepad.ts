import { useEffect, useRef } from 'react';
import { useGamepadContext } from '../contexts/GamepadContext';

/**
 * Hook simplifié qui retourne l'état du gamepad depuis le Context centralisé
 * et gère les callbacks de pression de bouton si fournis
 */
export const useGamepad = (onButtonPress?: () => void) => {
  const { gamepadState, onButtonPress: subscribeToButtonPress } = useGamepadContext();

  // Use ref to capture latest callback without triggering re-subscription
  const callbackRef = useRef(onButtonPress);

  // Update ref on every render
  useEffect(() => {
    callbackRef.current = onButtonPress;
  });

  useEffect(() => {
    if (!callbackRef.current) return;

    // S'abonne aux événements de pression de bouton via le Context centralisé
    const unsubscribe = subscribeToButtonPress(() => {
      callbackRef.current?.();
    });

    return unsubscribe;
  }, [subscribeToButtonPress]); // Only re-subscribe if subscribeToButtonPress changes

  return gamepadState;
};