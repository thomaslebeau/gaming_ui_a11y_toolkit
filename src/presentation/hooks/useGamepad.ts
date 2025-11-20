import { useEffect } from 'react';
import { useGamepadContext } from '../contexts/GamepadContext';

/**
 * Hook simplifié qui retourne l'état du gamepad depuis le Context centralisé
 * et gère les callbacks de pression de bouton si fournis
 */
export const useGamepad = (onButtonPress?: () => void) => {
  const { gamepadState, onButtonPress: subscribeToButtonPress } = useGamepadContext();

  useEffect(() => {
    if (!onButtonPress) return;

    // S'abonne aux événements de pression de bouton via le Context centralisé
    const unsubscribe = subscribeToButtonPress(() => {
      onButtonPress();
    });

    return unsubscribe;
  }, [subscribeToButtonPress, onButtonPress]);

  return gamepadState;
};