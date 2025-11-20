import { GamepadProvider, useGamepadContext } from "./presentation/contexts/GamepadContext";

function GamepadStatus() {
  const { isConnected, gamepadName } = useGamepadContext();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "2rem" }}>🎮 Détection de Manette</h1>

      <div
        style={{
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: isConnected ? "#4CAF50" : "#f44336",
          color: "white",
          fontSize: "1.5rem",
          textAlign: "center",
          minWidth: "300px",
        }}
      >
        <div style={{ marginBottom: "1rem", fontSize: "3rem" }}>
          {isConnected ? "✅" : "❌"}
        </div>
        <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          {isConnected ? "Manette Connectée" : "Aucune Manette"}
        </div>
        {isConnected && gamepadName && (
          <div style={{ fontSize: "1rem", opacity: 0.9, marginTop: "1rem" }}>
            {gamepadName}
          </div>
        )}
      </div>

      {!isConnected && (
        <p style={{ marginTop: "2rem", color: "#666", textAlign: "center" }}>
          Connectez une manette ou appuyez sur un bouton pour la détecter
        </p>
      )}
    </div>
  );
}

function App() {
  return (
    <GamepadProvider>
      <GamepadStatus />
    </GamepadProvider>
  );
}

export default App;
