import { useEffect } from 'react';
import { useGamepadContext } from '../contexts/GamepadContext';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';

/**
 * Hook simplifié qui retourne l'état du gamepad depuis le Context centralisé
 * et gère les callbacks de pression de bouton si fournis
 */
export const useGamepad = (onButtonPress?: () => void) => {
  const { adapter, gamepadState } = useGamepadContext();

  useEffect(() => {
    if (!onButtonPress) return;

    // Si onButtonPress est fourni, on crée juste le use case pour gérer le callback
    // L'adapter et l'état sont déjà gérés par le Context
    const useCase = new DetectGamepadConnection(adapter);

    // On n'a besoin que du callback de bouton, l'état est déjà géré par le Context
    const cleanup = useCase.execute(
      () => {}, // onConnected - ignoré car géré par le Context
      () => {}, // onDisconnected - ignoré car géré par le Context
      () => onButtonPress() // onButtonPress - c'est ce qui nous intéresse
    );

    return cleanup;
  }, [adapter, onButtonPress]);

  return gamepadState;
};