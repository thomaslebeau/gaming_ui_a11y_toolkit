import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';
import { GamepadState } from '../../domain/entities/GamepadState';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

type ButtonPressCallback = (state: GamepadState) => void;
type NavigationCallback = (direction: { x: number; y: number }) => void;

interface GamepadContextValue {
  adapter: IGamepadRepository;
  gamepadState: GamepadState;
  isConnected: boolean;
  onButtonPress: (callback: ButtonPressCallback) => () => void;
  onNavigation: (callback: NavigationCallback) => () => void;
}

const GamepadContext = createContext<GamepadContextValue | null>(null);

interface GamepadProviderProps {
  children: ReactNode;
}

export const GamepadProvider: React.FC<GamepadProviderProps> = ({ children }) => {
  // Instance unique de l'adapter, créée une seule fois
  const adapter = useMemo(() => new BrowserGamepadAdapter(), []);

  // Instance unique de DetectGamepadConnection
  const detectGamepad = useMemo(() => new DetectGamepadConnection(adapter), [adapter]);

  // État partagé du gamepad
  const [gamepadState, setGamepadState] = useState<GamepadState>(
    GamepadState.createDisconnected()
  );
  const [isConnected, setIsConnected] = useState(false);

  // Gestion des callbacks pour les événements
  const buttonPressCallbacks = useRef<Set<ButtonPressCallback>>(new Set());
  const navigationCallbacks = useRef<Set<NavigationCallback>>(new Set());

  // Méthodes pour s'abonner aux événements
  const onButtonPress = useCallback((callback: ButtonPressCallback) => {
    buttonPressCallbacks.current.add(callback);
    return () => {
      buttonPressCallbacks.current.delete(callback);
    };
  }, []);

  const onNavigation = useCallback((callback: NavigationCallback) => {
    navigationCallbacks.current.add(callback);
    return () => {
      navigationCallbacks.current.delete(callback);
    };
  }, []);

  useEffect(() => {
    // Initialise le use case avec les callbacks centralisés
    const cleanup = detectGamepad.execute(
      // onConnected
      (state) => {
        console.log('GamepadContext: gamepad connected');
        setGamepadState(state);
        setIsConnected(true);
      },
      // onDisconnected
      () => {
        console.log('GamepadContext: gamepad disconnected');
        setGamepadState(GamepadState.createDisconnected());
        setIsConnected(false);
      },
      // onButtonPress - notifie tous les abonnés
      (state) => {
        setGamepadState(state);
        buttonPressCallbacks.current.forEach((callback) => {
          callback(state);
        });
      },
      // onNavigation - notifie tous les abonnés
      (direction) => {
        navigationCallbacks.current.forEach((callback) => {
          callback(direction);
        });
      }
    );

    // Cleanup global au démontage du Provider
    return cleanup;
  }, [detectGamepad]);

  const value = useMemo(
    () => ({
      adapter,
      gamepadState,
      isConnected,
      onButtonPress,
      onNavigation,
    }),
    [adapter, gamepadState, isConnected, onButtonPress, onNavigation]
  );

  return (
    <GamepadContext.Provider value={value}>
      {children}
    </GamepadContext.Provider>
  );
};

/**
 * Hook pour accéder à l'adapter partagé et à l'état du gamepad
 */
export const useGamepadContext = (): GamepadContextValue => {
  const context = useContext(GamepadContext);

  if (!context) {
    throw new Error('useGamepadContext doit être utilisé dans un GamepadProvider');
  }

  return context;
};
