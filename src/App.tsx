import { useState } from "react";
import GalaxyScene from "./components/GalaxyScene";
import HUDOverlay from "./components/HUDOverlay";
import MoonDetailDrawer from "./components/MoonDetailDrawer";
import RocketLoader from "./components/RocketLoader";
import { OrbitData, Moon } from "./constants";
import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";

// For camera focus target in GalaxyScene
interface CameraFocusTarget {
  name: string; // Name of the moon or planet
  type: "planet" | "moon";
  planetName?: string; // Name of the parent planet if type is 'moon'
}

function App() {
  const [isRocketAnimDone, setIsRocketAnimDone] = useState(false);
  const [isMoonDetailDrawerOpen, setIsMoonDetailDrawerOpen] = useState(false);
  const [selectedMoonData, setSelectedMoonData] = useState<Moon | null>(null);
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
    }, 300); // Match animation duration (approx)
  };

  // Use useProgress to track GalaxyScene asset loading
  const { progress } = useProgress();
  const isGalaxyLoaded = progress === 100;
  const isLoading = !(isRocketAnimDone && isGalaxyLoaded);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            style={{
              position: "absolute",
              width: "100vw",
              height: "100vh",
              zIndex: 20,
            }}
          >
            <RocketLoader
              onFinish={() => setIsRocketAnimDone(true)}
              loadingProgress={progress}
            />
          </motion.div>
        ) : (
          <motion.div
            key="galaxy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.2 } }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              width: "100vw",
              height: "100vh",
              zIndex: 10,
            }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hidden Canvas to trigger asset preloading for GalaxyScene */}
      <div style={{ display: "none" }}>
        <GalaxyScene selectedItem={null} />
      </div>
    </>
  );
}

export default App;
