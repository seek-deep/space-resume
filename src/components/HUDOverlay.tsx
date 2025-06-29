import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import { orbits, OrbitData } from "../constants"; // Import OrbitData type

interface HUDOverlayProps {
  onNavigateToPlanet: (planetName: string) => void;
  onFocusCamera: (item: { name: string; type: "planet" | "moon" }) => void; // Kept if direct camera focus is needed
}

export default function HUDOverlay({ onNavigateToPlanet, onFocusCamera }: HUDOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mobileMenuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -20,
      transition: {
        delay: i * 0.03,
        ease: "easeInOut"
      }
    })
  };


  useEffect(() => {
    const audio = new Audio(
      "/audios/Interstellar Main Theme - Extra Extended - Soundtrack by  Hans Zimmer.mp3"
    );
    audio.loop = true;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch((err) => {
        console.error("Audio playback failed:", err);
      });
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

  const navItems = orbits.filter(
    (item: OrbitData) => !item.isAsteroidBelt
  );

  const handlePlanetClick = (planetName: string) => {
    onNavigateToPlanet(planetName); // This will open the drawer via App.tsx
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-black/70 backdrop-blur-md p-4 text-white z-20 hidden md:flex justify-center items-center space-x-2">
        {navItems.map((planet) => (
          <button
            key={planet.name}
            className="px-5 py-2.5 text-sm font-medium bg-gray-800/70 rounded-lg hover:bg-blue-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
            onClick={() => handlePlanetClick(planet.name)}
          >
            {planet.name}
          </button>
        ))}
      </nav>

      {/* Mobile Navigation Bar (Title and Hamburger) */}
      <div className="fixed top-0 left-0 w-full p-4 text-white z-20 md:hidden flex justify-between items-center bg-black/70 backdrop-blur-md">
        <span className="text-lg font-semibold tracking-wider">SPACE RESUME</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-gray-700/80 hover:bg-blue-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMobileMenuOpen ? "close" : "open"}
              initial={{ rotate: isMobileMenuOpen ? -90 : 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: isMobileMenuOpen ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
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

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-10 pt-20 p-6 md:hidden flex flex-col items-center space-y-3" // z-10 so it's under the top bar (z-20)
          >
            {navItems.map((planet, index) => (
              <motion.button
                key={planet.name}
                custom={index}
                variants={mobileMenuItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-xs px-6 py-3.5 text-md font-medium bg-gray-800/80 rounded-lg hover:bg-blue-600/90 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                onClick={() => handlePlanetClick(planet.name)}
              >
                {planet.name}
              </motion.button>
            ))}
             {/* Close button is now the X icon in the top bar for mobile */}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
