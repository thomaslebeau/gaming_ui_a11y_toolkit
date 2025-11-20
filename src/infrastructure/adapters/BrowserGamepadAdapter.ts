import { GamepadState } from '../../domain/entities/GamepadState';
import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

export class BrowserGamepadAdapter implements IGamepadRepository {
  // Stockage des références exactes pour pouvoir les supprimer (removeEventListener)
  private handleConnect: (e: GamepadEvent) => void;
  private handleDisconnect: (e: GamepadEvent) => void;

  // Callbacks de l'application
  private onConnectCallback: ((state: GamepadState) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  constructor() {
    console.log('init BrowserGamepadAdapter')
    // 1. On prépare les handlers une seule fois avec le bon contexte 'this'
    this.handleConnect = (e: GamepadEvent) => {
      console.log('🎮 Adapter: Connected', e.gamepad.id);
      if (this.onConnectCallback) {
        // Important : On utilise la version corrigée de l'entité
        this.onConnectCallback(GamepadState.fromGamepad(e.gamepad));
      }
    };

    this.handleDisconnect = () => {
      console.log('🎮 Adapter: Disconnected');
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    };

    // 2. On active l'écoute globale immédiatement
    this.startListening();
  }

  private startListening(): void {
    window.addEventListener('gamepadconnected', this.handleConnect);
    window.addEventListener('gamepaddisconnected', this.handleDisconnect);
  }

  onConnect(callback: (state: GamepadState) => void): void {
    this.onConnectCallback = callback;
    console.log("on Connect");
    
    // Vérification immédiate au cas où la manette est déjà là avant le chargement de la page
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[0];
    if (gamepad && gamepad.connected) {
      callback(GamepadState.fromGamepad(gamepad));
    }
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  // Votre excellente idée : retourner une fonction d'arrêt spécifique au polling
  pollButtons(callback: (state: GamepadState) => void): () => void {
    let animationId: number;
    let isPolling = true;

    const poll = () => {
      if (!isPolling) return;

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gamepad = gamepads[0];

      if (gamepad && gamepad.connected) {
        // C'est ICI que la magie opère grâce à GamepadState corrigé
        const state = GamepadState.fromGamepad(gamepad);
        callback(state);
      }

      animationId = requestAnimationFrame(poll);
    };

    poll();

    // Cleanup function pour le polling uniquement
    return () => {
      isPolling = false;
      cancelAnimationFrame(animationId);
    };
  }

  // Nettoyage global (quand on quitte l'application ou le module)
  cleanup(): void {
    window.removeEventListener('gamepadconnected', this.handleConnect);
    window.removeEventListener('gamepaddisconnected', this.handleDisconnect);
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    console.log('🎮 Adapter: Global cleanup done');
  }
}