import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';
import { GamepadState } from '../../domain/entities/GamepadState';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

interface GamepadContextValue {
  adapter: IGamepadRepository;
  gamepadState: GamepadState;
  isConnected: boolean;
}

const GamepadContext = createContext<GamepadContextValue | null>(null);

interface GamepadProviderProps {
  children: ReactNode;
}

export const GamepadProvider: React.FC<GamepadProviderProps> = ({ children }) => {
  // Instance unique de l'adapter, créée une seule fois
  const adapter = useMemo(() => new BrowserGamepadAdapter(), []);

  // État partagé du gamepad
  const [gamepadState, setGamepadState] = useState<GamepadState>(
    GamepadState.createDisconnected()
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Écoute des connexions/déconnexions au niveau global
    adapter.onConnect((state) => {
      setGamepadState(state);
      setIsConnected(true);
    });

    adapter.onDisconnect(() => {
      setGamepadState(GamepadState.createDisconnected());
      setIsConnected(false);
    });

    // Cleanup global au démontage du Provider
    return () => {
      adapter.cleanup();
    };
  }, [adapter]);

  const value = useMemo(
    () => ({
      adapter,
      gamepadState,
      isConnected,
    }),
    [adapter, gamepadState, isConnected]
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
