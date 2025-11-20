import type { IGamepadRepository } from '../../domain/ports/IGamepadRepository';

/**
 * Use case simplifié : détecte uniquement la connexion et déconnexion d'une manette
 */
export class DetectGamepadConnection {
  private repository: IGamepadRepository;

  constructor(repository: IGamepadRepository) {
    this.repository = repository;
  }

  /**
   * Lance la détection de connexion/déconnexion de manette
   * @param onConnected - Callback appelé quand une manette est connectée (reçoit le nom de la manette)
   * @param onDisconnected - Callback appelé quand la manette est déconnectée
   * @returns Fonction de cleanup pour arrêter la détection
   */
  execute(
    onConnected: (gamepadName: string) => void,
    onDisconnected: () => void
  ): () => void {
    console.log('🔍 DetectGamepadConnection: Démarrage de la détection');

    // Écoute l'événement de connexion
    this.repository.onConnect((state) => {
      const gamepadName = state.id || 'Manette inconnue';
      console.log(`🎮 Manette détectée: ${gamepadName}`);
      onConnected(gamepadName);
    });

    // Écoute l'événement de déconnexion
    this.repository.onDisconnect(() => {
      console.log('🔌 Manette déconnectée');
      onDisconnected();
    });

    // Retourne la fonction de cleanup
    return () => {
      console.log('🧹 DetectGamepadConnection: Cleanup');
      this.repository.cleanup();
    };
  }
}
