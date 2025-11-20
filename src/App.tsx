import { useState, useEffect } from "react";
import { GameButton } from "./presentation/components/GameButton";
import { GameMenu } from "./presentation/components/GameMenu";
import { InventoryGrid } from "./presentation/components/InventoryGrid";
import { Minimap } from "./presentation/components/Minimap";
import type { InventoryItem } from "./domain/entities/InventoryState";
import { GamepadProvider } from "./presentation/contexts/GamepadContext";

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

  // Sample inventory items with simple colored icons
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: "potion-health",
      name: "Health Potion",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23cc3333'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E❤%3C/text%3E%3C/svg%3E",
      quantity: 5,
      slotIndex: 0,
    },
    {
      id: "potion-mana",
      name: "Mana Potion",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233366cc'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E✨%3C/text%3E%3C/svg%3E",
      quantity: 3,
      slotIndex: 1,
    },
    {
      id: "sword",
      name: "Iron Sword",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23666'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E⚔%3C/text%3E%3C/svg%3E",
      slotIndex: 4,
    },
    {
      id: "shield",
      name: "Wooden Shield",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23996633'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E🛡%3C/text%3E%3C/svg%3E",
      slotIndex: 5,
    },
    {
      id: "key",
      name: "Golden Key",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ccaa33'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E🔑%3C/text%3E%3C/svg%3E",
      slotIndex: 10,
    },
    {
      id: "coin",
      name: "Gold Coins",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ffcc00'/%3E%3Ctext x='50' y='60' font-size='40' text-anchor='middle' fill='white'%3E💰%3C/text%3E%3C/svg%3E",
      quantity: 99,
      slotIndex: 15,
    },
  ]);

  const handleItemSelect = (item: InventoryItem) => {
    console.log("Item selected:", item);
    alert(`Selected: ${item.name}`);
  };

  const handleItemMove = (fromIndex: number, toIndex: number) => {
    console.log(`Item moved from ${fromIndex} to ${toIndex}`);
    setInventoryItems((currentItems) => {
      return currentItems.map((item) => {
        if (item.slotIndex === fromIndex) {
          return { ...item, slotIndex: toIndex };
        }
        if (item.slotIndex === toIndex) {
          return { ...item, slotIndex: fromIndex };
        }
        return item;
      });
    });
  };

  // Minimap demo state - simulate player movement
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [playerRotation, setPlayerRotation] = useState(0);

  // Sample POIs for minimap
  const pointsOfInterest = [
    {
      id: "enemy1",
      type: "enemy" as const,
      position: { x: 30, y: 20 },
      label: "Goblin Scout",
    },
    {
      id: "enemy2",
      type: "enemy" as const,
      position: { x: -25, y: 35 },
      label: "Orc Warrior",
    },
    {
      id: "objective1",
      type: "objective" as const,
      position: { x: 50, y: -30 },
      label: "Ancient Artifact",
    },
    {
      id: "waypoint1",
      type: "waypoint" as const,
      position: { x: -40, y: -20 },
      label: "Camp Site",
    },
    {
      id: "ally1",
      type: "ally" as const,
      position: { x: 10, y: -15 },
      label: "Friendly NPC",
    },
  ];

  // Simulate player movement in a circle
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerPosition((prev) => {
        const angle = (Date.now() / 1000) % (2 * Math.PI);
        return {
          x: Math.cos(angle) * 15,
          y: Math.sin(angle) * 15,
        };
      });
      setPlayerRotation((prev) => (prev + 2) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handlePOIClick = (poi: any) => {
    console.log("POI clicked:", poi);
    alert(`Pinged: ${poi.label}`);
  };

  return (
    <GamepadProvider>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: "3rem",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1>Gaming A11y Toolkit</h1>
          <p>
            Try with gamepad (D-pad, A/B buttons) or keyboard (Arrow keys,
            Enter/Space/Escape)
          </p>
        </div>

        <GameButton onClick={handleClick} ariaLabel="Action button">
          Press Me
        </GameButton>
        <GameButton onClick={handleClick} ariaLabel="Action button 2">
          Press Me 2
        </GameButton>

        <GameMenu
          items={menuItems}
          defaultFocusIndex={0}
          ariaLabel="Main game menu"
        />

        {/* <div style={{ textAlign: "center" }}>
          <h2>InventoryGrid Demo</h2>
          <p style={{ maxWidth: "40rem", margin: "0 auto 1rem" }}>
            Navigate with arrows/D-pad. Press Enter/A to move items. Navigate to
            destination and press Enter/A again to place.
          </p>
          <InventoryGrid
            columns={4}
            rows={6}
            items={inventoryItems}
            onItemSelect={handleItemSelect}
            onItemMove={handleItemMove}
            wrapNavigation={true}
            ariaLabel="Player inventory"
          />
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

        <div style={{ textAlign: "center", marginBottom: "10rem" }}>
          <h2>Minimap Demo</h2>
          <p style={{ maxWidth: "40rem", margin: "0 auto 1rem" }}>
            Press <strong>M</strong> to toggle minimap. Use <strong>+/-</strong>{" "}
            to zoom, <strong>Tab</strong> to navigate POIs, <strong>Enter</strong>{" "}
            to select.
            <br />
            Player moves in a circle to demonstrate nearby POI detection.
          </p>
          <div style={{ position: "relative", height: "15rem" }}>
            <Minimap
              width={15}
              height={15}
              playerPosition={playerPosition}
              playerRotation={playerRotation}
              pointsOfInterest={pointsOfInterest}
              zoom={1.0}
              rotateWithPlayer={true}
              onPOIClick={handlePOIClick}
              ariaLabel="Game minimap showing nearby enemies and objectives"
              enableAudioPings={true}
            />
          </div>
        </div> */}
      </div>
    </GamepadProvider>
  );
}

export default App;
