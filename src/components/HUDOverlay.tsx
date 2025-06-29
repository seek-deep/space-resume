import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { orbits, OrbitData } from "../constants";

interface HUDOverlayProps {
  onPlanetSelect: (planetData: OrbitData) => void;
  // onCameraFocus: (item: { name: string; type: "planet" | "moon" }) => void; // Retain if camera focus is still a separate concern
}

export default function HUDOverlay({ onPlanetSelect }: HUDOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const audio = new Audio(
      "/audios/Interstellar Main Theme - Extra Extended - Soundtrack by  Hans Zimmer.mp3"
    );
    audio.loop = true;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch((err) => console.error("Audio playback failed:", err));
      window.removeEventListener("click", playAudio);
    };

    window.addEventListener("click", playAudio);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.removeEventListener("click", playAudio);
    };
  }, []);

  const navItems = orbits.filter((item) => !item.isAsteroidBelt);

  const handleDesktopPlanetClick = (planet: OrbitData) => {
    onPlanetSelect(planet);
  };

  const handleMobilePlanetClick = (planet: OrbitData) => {
    setIsMobileNavOpen(false); // Close mobile nav drawer first
    onPlanetSelect(planet); // Then trigger action in App.tsx (which will open bottom sheet)
  };

  const mobileNavVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" },
  };

  const mobileNavItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 + 0.2, type: "spring", stiffness: 120 },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  };

  const navBarHeight = "h-16"; // Standard height for the navbar, e.g., 4rem or 64px

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 w-full ${navBarHeight} bg-black/70 backdrop-blur-md text-white z-30 hidden md:flex justify-center items-center space-x-3 px-6 shadow-lg`}
      >
        {navItems.map((planet) => (
          <button
            key={planet.name}
            className="px-4 py-2 text-sm font-medium bg-gray-800/60 hover:bg-blue-600/70 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-60 transition-all duration-200 ease-in-out transform hover:scale-105"
            onClick={() => handleDesktopPlanetClick(planet)}
          >
            {planet.name}
          </button>
        ))}
      </nav>

      {/* Mobile Top Bar (Title & Hamburger) */}
      <div
        className={`fixed top-0 left-0 w-full ${navBarHeight} bg-black/70 backdrop-blur-md text-white z-30 flex md:hidden justify-between items-center px-4 shadow-lg`}
      >
        <span className="text-lg font-semibold tracking-wider">SPACE RESUME</span>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-md bg-gray-700/70 hover:bg-blue-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors z-40" // z-40 to be above mobile nav drawer
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMobileNavOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileNavOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Left-Side Navigation Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            variants={mobileNavVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 150 }}
            className={`fixed top-0 left-0 w-3/4 max-w-xs h-full bg-gray-900/90 backdrop-blur-lg shadow-2xl z-20 pt-${navBarHeight} p-6 flex flex-col space-y-3`} // z-20, below mobile top bar. pt for navbar height.
          >
            <h2 className="text-xl font-semibold text-blue-300 mb-4 px-2">Navigation</h2>
            {navItems.map((planet, index) => (
              <motion.button
                key={planet.name}
                custom={index}
                variants={mobileNavItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full px-4 py-3 text-left text-md font-medium bg-gray-800/70 rounded-lg hover:bg-blue-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                onClick={() => handleMobilePlanetClick(planet)}
              >
                {planet.name}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
