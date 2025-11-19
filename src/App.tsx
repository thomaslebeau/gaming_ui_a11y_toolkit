import { useState } from "react";
import { GameButton } from "./presentation/components/GameButton";
import { GameMenu } from "./presentation/components/GameMenu";
import { QTE } from "./presentation/components/QTE";

function App() {
  const [qteKey, setQteKey] = useState(0);
  const [qteMessage, setQteMessage] = useState("");

  const handleClick = () => {
    console.log("Button clicked!");
    alert("Button pressed! 🎮");
  };

  const handleQTESuccess = () => {
    console.log("QTE Success!");
    setQteMessage("✓ Success! Great timing!");
    setTimeout(() => {
      setQteKey((prev) => prev + 1);
      setQteMessage("");
    }, 2000);
  };

  const handleQTEFailure = () => {
    console.log("QTE Failed!");
    setQteMessage("✗ Failed! Try again!");
    setTimeout(() => {
      setQteKey((prev) => prev + 1);
      setQteMessage("");
    }, 2000);
  };

  const menuItems = [
    {
      id: "new-game",
      label: "New Game",
      onClick: () => alert("New Game selected!"),
    },
    {
      id: "continue",
      label: "Continue",
      onClick: () => alert("Continue selected!"),
    },
    {
      id: "settings",
      label: "Settings",
      onClick: () => alert("Settings selected!"),
    },
    {
      id: "credits",
      label: "Credits",
      onClick: () => alert("Credits selected!"),
      disabled: true,
    },
    {
      id: "quit",
      label: "Quit",
      onClick: () => alert("Quit selected!"),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: "3rem",
        flexDirection: "column",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Gaming A11y Toolkit</h1>
        <p>
          Try with gamepad (D-pad Up/Down, A button) or keyboard (Arrow
          keys, Enter/Space)
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <h2>GameMenu Demo</h2>
        <GameMenu
          items={menuItems}
          defaultFocusIndex={0}
          ariaLabel="Main game menu"
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <h2>GameButton Demo</h2>
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <GameButton onClick={handleClick} ariaLabel="Action button">
            Press Me
          </GameButton>

          <GameButton onClick={handleClick}>Another Button</GameButton>

          <GameButton onClick={handleClick} disabled>
            Disabled Button
          </GameButton>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <h2>QTE Demo (Quick Time Event)</h2>
        <p style={{ marginBottom: "1rem", color: "#e0e0e0" }}>
          Press the button shown before time runs out! <br />
          Supports gamepad (A/B/X/Y) and keyboard (Space/Enter)
        </p>
        <QTE
          key={qteKey}
          buttonPrompt="Space"
          duration={5000}
          onSuccess={handleQTESuccess}
          onFailure={handleQTEFailure}
          difficulty="normal"
          showTimer={true}
          practiceMode={false}
        />
        {qteMessage && (
          <div
            style={{
              marginTop: "1rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: qteMessage.includes("Success") ? "#4caf50" : "#f44336",
            }}
          >
            {qteMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
