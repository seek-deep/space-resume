import { useState } from "react";
import GalaxyScene from "./components/GalaxyScene";
import HUDOverlay from "./components/HUDOverlay";
import DetailDrawer from "./components/DetailDrawer"; // Import DetailDrawer
import { orbits, OrbitData, Moon } from "./constants"; // Import OrbitData and Moon
import "./index.css";

// This interface might still be useful for camera focusing if we keep that distinct
interface NavigationItem {
  name: string;
  type: "planet" | "moon"; // "planet" for camera focus, "moon" if HUD directly navigates to a moon detail
  description?: string; // Only for moons, if passed directly
}

function App() {
  // State for camera focus target (from original navigation logic)
  const [cameraFocusTarget, setCameraFocusTarget] = useState<NavigationItem | null>(null);

  // State for the Detail Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerPlanetData, setDrawerPlanetData] = useState<OrbitData | null>(null);

  // This function is called from HUDOverlay when a planet/main section is clicked
  const handleOpenPlanetDrawer = (planetName: string) => {
    const planet = orbits.find(p => p.name === planetName && !p.isAsteroidBelt);
    if (planet) {
      setDrawerPlanetData(planet);
      setIsDrawerOpen(true);
      // Optionally, also set camera focus if desired
      setCameraFocusTarget({ name: planet.name, type: "planet" });
    }
  };

  // This function can be used if HUD needs to navigate to a specific moon detail
  // or if camera focus needs to be set for other reasons.
  // For now, HUDOverlay calls handleOpenPlanetDrawer for planets.
  const handleCameraNavigation = (item: NavigationItem) => {
    setCameraFocusTarget(item);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Optionally, reset drawerPlanetData to null after a delay for exit animation
    // setTimeout(() => setDrawerPlanetData(null), 300); // Example delay
  };

  return (
    <div className="!w-screen !h-screen bg-black overflow-hidden m-0">
      <HUDOverlay
        onNavigateToPlanet={handleOpenPlanetDrawer}
        onFocusCamera={handleCameraNavigation} // If HUD still needs to independently focus camera
      />
      <GalaxyScene selectedItem={cameraFocusTarget} />
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        planetData={drawerPlanetData}
      />
    </div>
  );
}

export default App;
