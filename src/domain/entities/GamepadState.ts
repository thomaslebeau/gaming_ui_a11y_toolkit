// domain/entities/GamepadState.ts

export class GamepadState {
  readonly connected: boolean;
  readonly buttonPressed: boolean;      // Vrai SEULEMENT pour A, B, X, Y, Gâchettes... (Pas le D-Pad)
  readonly buttonIndex: number | null;  // Index du bouton pressé
  readonly axes: readonly number[];     // État brut des sticks
  readonly buttons: readonly GamepadButton[]; // État brut de tous les boutons

  constructor(
    connected: boolean,
    buttonPressed: boolean,
    buttonIndex: number | null,
    axes: readonly number[],
    buttons: readonly GamepadButton[]
  ) {
    this.connected = connected;
    this.buttonPressed = buttonPressed;
    this.buttonIndex = buttonIndex;
    this.axes = axes;
    this.buttons = buttons;
  }

  // --- FACTORIES (Création) ---

  // Créer un état déconnecté par défaut
  static createDisconnected(): GamepadState {
    return new GamepadState(false, false, null, [], []);
  }

  // Créer un état connecté vide
  static createConnected(): GamepadState {
    return new GamepadState(true, false, null, [], []);
  }

  /**
   * CRUCIAL : Convertit l'objet natif Gamepad en notre entité
   * C'est ici que le filtrage du D-Pad (boutons 12-15) opère pour éviter les conflits.
   */
  static fromGamepad(gamepad: Gamepad): GamepadState {
    // On copie les tableaux pour figer l'état (Snapshot) et éviter les mutations par référence
    const buttons = Array.from(gamepad.buttons);
    const axes = Array.from(gamepad.axes);
    
    // Fonction helper : Un bouton est une "Action" s'il est pressé ET qu'il n'est pas sur le D-Pad
    // Standard Mapping : 12=Haut, 13=Bas, 14=Gauche, 15=Droite
    const isActionPress = (b: GamepadButton, index: number) => {
      const isDPad = index >= 12 && index <= 15;
      console.log('is action press =>', index);
      return b.pressed && !isDPad; 
    };

    // On détermine si un bouton d'action est actif
    const buttonPressed = buttons.some((b, i) => isActionPress(b, i));

    // On trouve son index
    const buttonIndex = buttons.findIndex((b, i) => isActionPress(b, i));

    return new GamepadState(
      gamepad.connected,
      buttonPressed, // Sera FALSE si on appuie uniquement sur la croix directionnelle
      buttonIndex > -1 ? buttonIndex : null,
      axes,
      buttons // On passe TOUS les boutons bruts pour que getDpadDirection puisse les lire
    );
  }

  // --- LOGIQUE MÉTIER & NAVIGATION ---

  // Vérifie si un bouton d'action est actif (utile pour l'UI "Press Start")
  isButtonActive(): boolean {
    return this.connected && this.buttonPressed;
  }

  // Récupère la direction depuis la CROIX DIRECTIONNELLE (D-Pad)
  getDpadDirection(): { x: number; y: number } | null {
    if (!this.connected || this.buttons.length === 0) return null;
    
    
    let x = 0;
    let y = 0;
    
    // Mapping Standard W3C
    if (this.buttons[12]?.pressed) y = -1; // Haut
    if (this.buttons[13]?.pressed) y = 1;  // Bas
    if (this.buttons[14]?.pressed) x = -1; // Gauche
    if (this.buttons[15]?.pressed) x = 1;  // Droite
    
    return (x !== 0 || y !== 0) ? { x, y } : null;
  }

  /**
   * Récupère la direction depuis le STICK ANALOGIQUE (Gauche par défaut)
   * @param deadzone Seuil (0.0 à 1.0) pour ignorer le drift. Conseillé : 0.1 ou 0.15
   */
  getStickDirection(deadzone: number = 0.1): { x: number; y: number } | null {
    if (!this.connected || this.axes.length < 2) return null;
    
    const rawX = this.axes[0];
    const rawY = this.axes[1];

    // Application de la Deadzone : Si la valeur est trop faible, on la force à 0
    const x = Math.abs(rawX) > deadzone ? rawX : 0;
    const y = Math.abs(rawY) > deadzone ? rawY : 0;
    
    return (x !== 0 || y !== 0) ? { x, y } : null;
  }

  // --- TRANSITIONS D'ÉTAT MANUELLES (Optionnel, utile pour les tests) ---

  withButtonPress(buttonIndex: number): GamepadState {
    if (!this.connected) {
      throw new Error('Cannot press button on disconnected gamepad');
    }
    return new GamepadState(true, true, buttonIndex, this.axes, this.buttons);
  }

  withButtonRelease(): GamepadState {
    return new GamepadState(this.connected, false, null, this.axes, this.buttons);
  }

  disconnect(): GamepadState {
    return GamepadState.createDisconnected();
  }
}