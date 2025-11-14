import { GameButton } from "./presentation/components/GameButton";

function App() {
  const handleClick = () => {
    console.log("Button clicked!");
    alert("Button pressed! 🎮");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: "1rem",
        flexDirection: "column",
      }}
    >
      <h1>Gaming A11y Toolkit - GameButton Demo</h1>
      <p>Try with gamepad (A button) or keyboard (Enter/Space)</p>

      <GameButton onClick={handleClick} ariaLabel="Action button">
        Press Me
      </GameButton>

      <GameButton onClick={handleClick}>Another Button</GameButton>

      <GameButton onClick={handleClick} disabled>
        Disabled Button
      </GameButton>
    </div>
  );
}

export default App;
