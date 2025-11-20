import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BrowserGamepadAdapter } from '../../infrastructure/adapters/BrowserGamepadAdapter';
import { DetectGamepadConnection } from '../../application/useCases/DetectGamepadConnection';

interface GamepadContextValue {
  isConnected: boolean;
  gamepadName: string | null;
}

const GamepadContext = createContext<GamepadContextValue | null>(null);

interface GamepadProviderProps {
  children: ReactNode;
}

export const GamepadProvider: React.FC<GamepadProviderProps> = ({ children }) => {
  const adapter = useMemo(() => new BrowserGamepadAdapter(), []);
  const detectGamepad = useMemo(() => new DetectGamepadConnection(adapter), [adapter]);

  const [isConnected, setIsConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎮 GamepadProvider: Initialisation de la détection');

    const cleanup = detectGamepad.execute(
      // onConnected
      (name) => {
        console.log('✅ Manette connectée:', name);
        setIsConnected(true);
        setGamepadName(name);
      },
      // onDisconnected
      () => {
        console.log('❌ Manette déconnectée');
        setIsConnected(false);
        setGamepadName(null);
      }
    );

    return () => {
      console.log('🧹 GamepadProvider: Cleanup');
      cleanup();
    };
  }, [detectGamepad]);

  const value = useMemo(
    () => ({
      isConnected,
      gamepadName,
    }),
    [isConnected, gamepadName]
  );

  return (
    <GamepadContext.Provider value={value}>
      {children}
    </GamepadContext.Provider>
  );
};

export const useGamepadContext = (): GamepadContextValue => {
  const context = useContext(GamepadContext);

  if (!context) {
    throw new Error('useGamepadContext doit être utilisé dans un GamepadProvider');
  }

  return context;
};
