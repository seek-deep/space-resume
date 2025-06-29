import { useState } from "react";
import GalaxyScene from "./components/GalaxyScene";
import HUDOverlay from "./components/HUDOverlay";
import DetailDrawer from "./components/DetailDrawer"; // Import DetailDrawer
import { OrbitData } from "./constants"; // Import OrbitData type for planet data
import "./index.css";

// For camera focus, if needed separately
interface CameraFocusItem {
  name: string;
  type: "planet" | "moon";
}

function App() {
  // State for the Detail Drawer (left-side on desktop, bottom-sheet on mobile)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedPlanetData, setSelectedPlanetData] = useState<OrbitData | null>(null);

  // State for camera focus target (optional, can be tied to selectedPlanetData)
  const [cameraFocusTarget, setCameraFocusTarget] = useState<CameraFocusItem | null>(null);

  // Define the navbar height class to be passed down
  // This should match the class used in HUDOverlay.tsx and for DetailDrawer calculations
  const navBarHeightClass = "h-16"; // Corresponds to 4rem or 64px

  // Called by HUDOverlay when a planet is selected
  const handlePlanetSelection = (planetData: OrbitData) => {
    setSelectedPlanetData(planetData);
    setIsDetailDrawerOpen(true);
    // Optionally, set camera focus when a planet is selected for the drawer
    setCameraFocusTarget({ name: planetData.name, type: "planet" });
  };

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false);
    // Consider adding a small delay before resetting selectedPlanetData to allow exit animation
    setTimeout(() => {
      setSelectedPlanetData(null);
    }, 300); // Adjust delay to match animation duration
  };

  return (
    <div className="!w-screen !h-screen bg-black overflow-hidden m-0">
      <HUDOverlay
        onPlanetSelect={handlePlanetSelection}
      />
      <GalaxyScene
        selectedItem={cameraFocusTarget}
      />
      <DetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={handleCloseDetailDrawer}
        planetData={selectedPlanetData}
        navBarHeightClass={navBarHeightClass}
      />
    </div>
  );
}

export default App;
