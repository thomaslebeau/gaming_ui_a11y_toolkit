import { GameButton } from "./presentation/components/GameButton";
import { GameMenu } from "./presentation/components/GameMenu";

function App() {
  const handleClick = () => {
    console.log("Button clicked!");
    alert("Button pressed! 🎮");
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
    </div>
  );
}

export default App;
