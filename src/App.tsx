import { useState, useEffect, useCallback } from "react";
import type { GamepadData, GamepadConnectionEvent } from "./types/Gamepad.type";
import "./App.css";

function App() {
  const [gamepads, setGamepads] = useState<GamepadData[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const updateGamepadState = useCallback(() => {
    const connectedGamepads = navigator.getGamepads();
    const activeGamepads: GamepadData[] = [];

    for (let i = 0; i < connectedGamepads.length; i++) {
      const gamepad = connectedGamepads[i];
      if (gamepad) {
        activeGamepads.push({
          index: gamepad.index,
          id: gamepad.id,
          buttons: gamepad.buttons.map((button) => ({
            pressed: button.pressed,
            value: button.value,
          })),
          axes: [...gamepad.axes],
        });
      }
    }

    setGamepads(activeGamepads);
    setIsConnected(activeGamepads.length > 0);
  }, []);

  useEffect(() => {
    const handleGamepadConnected = (e: Event) => {
      const event = e as GamepadConnectionEvent;
      console.log("Gamepad connected:", event.gamepad);
      updateGamepadState();
    };

    const handleGamepadDisconnected = (e: Event) => {
      const event = e as GamepadConnectionEvent;
      console.log("Gamepad disconnected:", event.gamepad);
      updateGamepadState();
    };

    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    // Animation loop to continuously read gamepad state
    let animationId: number;
    const gameLoop = () => {
      updateGamepadState();
      animationId = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
      cancelAnimationFrame(animationId);
    };
  }, [updateGamepadState]);

  return (
    <div className="app">
      <h1>🎮 Gamepad Detector</h1>

      <div className="connection-status">
        <div
          className={`status-indicator ${
            isConnected ? "connected" : "disconnected"
          }`}
        >
          {isConnected ? "✅ Gamepad Connected" : "❌ No Gamepad Detected"}
        </div>
        {!isConnected && (
          <p className="instruction">
            Press any button on your gamepad to connect it
          </p>
        )}
      </div>

      {gamepads.map((gamepad) => (
        <div key={gamepad.index} className="gamepad-info">
          <h2>Gamepad {gamepad.index}</h2>
          <p className="gamepad-id">{gamepad.id}</p>

          <div className="controls-container">
            <div className="buttons-section">
              <h3>Buttons</h3>
              <div className="buttons-grid">
                {gamepad.buttons.map((button, btnIndex) => (
                  <div
                    key={btnIndex}
                    className={`button ${button.pressed ? "pressed" : ""}`}
                  >
                    <span className="button-label">B{btnIndex}</span>
                    <span className="button-value">
                      {button.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="axes-section">
              <h3>Axes (Sticks)</h3>
              <div className="axes-container">
                <div className="stick-display">
                  <h4>Left Stick</h4>
                  <div className="stick-box">
                    <div
                      className="stick-position"
                      style={{
                        transform: `translate(${gamepad.axes[0] * 40}px, ${
                          gamepad.axes[1] * 40
                        }px)`,
                      }}
                    />
                  </div>
                  <div className="axes-values">
                    <span>X: {(gamepad.axes[0] || 0).toFixed(2)}</span>
                    <span>Y: {(gamepad.axes[1] || 0).toFixed(2)}</span>
                  </div>
                </div>

                {gamepad.axes.length > 2 && (
                  <div className="stick-display">
                    <h4>Right Stick</h4>
                    <div className="stick-box">
                      <div
                        className="stick-position"
                        style={{
                          transform: `translate(${gamepad.axes[2] * 40}px, ${
                            gamepad.axes[3] * 40
                          }px)`,
                        }}
                      />
                    </div>
                    <div className="axes-values">
                      <span>X: {(gamepad.axes[2] || 0).toFixed(2)}</span>
                      <span>Y: {(gamepad.axes[3] || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
