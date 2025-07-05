import { useState } from "react";
import GalaxyScene from "./components/GalaxyScene";
import HUDOverlay from "./components/HUDOverlay";
import MoonDetailDrawer from "./components/MoonDetailDrawer";
import RocketLoader from "./components/RocketLoader";
import { OrbitData, Moon } from "./constants";
import "./index.css";

// For camera focus target in GalaxyScene
interface CameraFocusTarget {
  name: string; // Name of the moon or planet
  type: "planet" | "moon";
  planetName?: string; // Name of the parent planet if type is 'moon'
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMoonDetailDrawerOpen, setIsMoonDetailDrawerOpen] = useState(false);
  const [selectedMoonData, setSelectedMoonData] = useState<Moon | null>(null);
  // Store the parent planet of the selected moon for context (e.g., camera positioning)
  const [currentPlanetForMoon, setCurrentPlanetForMoon] =
    useState<OrbitData | null>(null);

  const [cameraFocusTarget, setCameraFocusTarget] =
    useState<CameraFocusTarget | null>(null);

  // Consistent navbar height class, passed to drawers that need to offset by it
  const navBarHeightClass = "h-16";

  // Called by HUDOverlay when a moon is selected from a dropdown (desktop) or accordion (mobile)
  const handleMoonSelection = (moonData: Moon, planetData: OrbitData) => {
    console.log(
      "handleMoonSelection called with moonData:",
      moonData,
      "planetData:",
      planetData
    );
    setSelectedMoonData(moonData);
    setCurrentPlanetForMoon(planetData); // Store parent planet context
    setIsMoonDetailDrawerOpen(true);

    // Set camera focus target to the selected moon
    // GalaxyScene will need logic to handle focusing on a moon, potentially using planetData for context
    setCameraFocusTarget({
      name: moonData.name,
      type: "moon",
      planetName: planetData.name,
    });
  };

  const handleCloseMoonDetailDrawer = () => {
    setIsMoonDetailDrawerOpen(false);
    // Delay clearing data to allow for exit animations
    setTimeout(() => {
      setSelectedMoonData(null);
      setCurrentPlanetForMoon(null);
    }, 300); // Match animation duration (approx)
  };

  return (
    <>
      {isLoading ? (
        <RocketLoader onFinish={() => setIsLoading(false)} />
      ) : (
        <div className="!w-screen !h-screen bg-black overflow-hidden m-0">
          <HUDOverlay onMoonSelect={handleMoonSelection} />
          <GalaxyScene
            selectedItem={cameraFocusTarget}
            onMoonSelect={handleMoonSelection}
          />
          <MoonDetailDrawer
            isOpen={isMoonDetailDrawerOpen}
            onClose={handleCloseMoonDetailDrawer}
            moonData={selectedMoonData}
            navBarHeightClass={navBarHeightClass}
          />
        </div>
      )}
    </>
  );
}

export default App;
