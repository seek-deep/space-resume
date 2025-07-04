import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react"; // MenuIcon and XIcon removed
import { orbits, OrbitData, Moon } from "../constants";
import "./BurgerMenu.css"; // Import custom burger menu styles

interface HUDOverlayProps {
  onMoonSelect: (moonData: Moon, planetData: OrbitData) => void;
}

const navBarHeightClass = "h-16"; // e.g., 4rem or 64px. Used for styling and offsetting.
const navBarPaddingTopClass = "pt-16"; // Equivalent padding class

export default function HUDOverlay({ onMoonSelect }: HUDOverlayProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeMobileAccordion, setActiveMobileAccordion] = useState<
    string | null
  >(null);

  const dropdownContainerRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});

  useEffect(() => {
    // Audio setup
    const audio = new Audio(
      "/audios/Interstellar Main Theme - Extra Extended - Soundtrack by  Hans Zimmer.mp3"
    );
    audio.loop = true;
    audioRef.current = audio;
    const playAudio = () => {
      if (audioRef.current?.paused) {
        // Play only if paused, to avoid interrupting if already playing
        audioRef.current
          .play()
          .catch((err) => console.error("Audio playback failed:", err));
      }
      window.removeEventListener("click", playAudio); // Play only on first click
    };
    window.addEventListener("click", playAudio);

    // Click outside to close desktop dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        // Check if the click is outside ALL dropdown containers (trigger + menu)
        const isInsideAnyDropdown = Object.values(
          dropdownContainerRefs.current
        ).some((ref) => ref?.contains(event.target as Node));
        if (!isInsideAnyDropdown) {
          setActiveDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.removeEventListener("click", playAudio);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const navPlanets = orbits.filter(
    (item) => !item.isAsteroidBelt && item.moons && item.moons.length > 0
  );

  const toggleDropdown = (planetName: string) => {
    setActiveDropdown(activeDropdown === planetName ? null : planetName);
  };

  const handleDesktopMoonClick = (moon: Moon, planet: OrbitData) => {
    console.log("handleDesktopMoonClick", moon, planet);
    setActiveDropdown(null); // Close dropdown
    onMoonSelect(moon, planet);
  };

  const toggleMobileAccordion = (planetName: string) => {
    setActiveMobileAccordion(
      activeMobileAccordion === planetName ? null : planetName
    );
  };

  const handleMobileMoonClick = (moon: Moon, planet: OrbitData) => {
    console.log("handleMobileMoonClick", moon, planet);
    setIsMobileNavOpen(false); // Close mobile nav drawer
    setActiveMobileAccordion(null); // Reset accordion
    onMoonSelect(moon, planet); // Trigger moon detail view in App.tsx
  };

  const mobileNavDrawerVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring" as const, damping: 28, stiffness: 220 },
    },
    exit: { x: "-100%", transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] as const } },
  };

  const mobileAccordionContentVariants = {
    collapsed: { height: 0, opacity: 0, marginTop: 0 },
    open: { height: "auto", opacity: 1, marginTop: "0.25rem" },
  };

  const dropdownMenuVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.12, ease: [0.42, 0, 0.58, 1] as const },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.98,
      transition: { duration: 0.1, ease: [0.42, 0, 0.58, 1] as const },
    },
  };

  return (
    <>
      {/* Desktop Navigation Bar with Dropdowns */}
      <nav
        className={`fixed top-0 left-0 right-0 w-full ${navBarHeightClass} bg-[rgba(0,0,0,0.4)] backdrop-blur-md border-b border-white/10 text-white z-30 hidden md:flex justify-center items-center gap-x-6 px-6 shadow-md`}
      >
        {navPlanets.map((planet) => (
          <div
            key={planet.name}
            className="relative"
            ref={(el) => {
              dropdownContainerRefs.current[planet.name] = el;
            }}
          >
            <button
              onClick={() => toggleDropdown(planet.name)}
              className="px-4 py-2.5 text-sm font-medium bg-gray-700/60 hover:bg-blue-600/70 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors duration-150 flex items-center space-x-1.5"
            >
              <span>{planet.name}</span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  activeDropdown === planet.name ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {activeDropdown === planet.name && (
                <motion.div
                  variants={dropdownMenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-60 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-2xl py-1.5 z-40 border border-gray-700/50"
                >
                  {planet.moons?.map((moon) => (
                    <button
                      key={moon.name}
                      onClick={() => handleDesktopMoonClick(moon, planet)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-blue-500/80 hover:text-white transition-colors duration-100"
                    >
                      {moon.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Mobile Top Bar (Title & Custom SVG Hamburger) */}
      <div
        className={`fixed top-0 left-0 w-full ${navBarHeightClass} text-white z-30 flex md:hidden items-center px-4 shadow-lg`} // Removed justify-between as the burger is the main item here now
      >
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className={`menu ${
            isMobileNavOpen ? "opened" : ""
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 z-40`} // Removed p-2, menu class handles padding. Kept focus/rounded.
          aria-label="Main Menu"
          aria-expanded={isMobileNavOpen}
        >
          <svg width="30" height="30" viewBox="0 0 100 100"> {/* Adjusted size for practical use */}
            <path
              className="line line1"
              d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.239173,81.668997 C 79.512265,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
            />
            <path className="line line2" d="M 20,50 H 80" />
            <path
              className="line line3"
              d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 C 94.543142,22.019327 90.966081,18.329754 85.239173,18.331003 C 79.512265,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
            />
          </svg>
        </button>
        {/* Optionally, add a title here if needed, e.g., <h1 className="text-xl ml-4">Title</h1> */}
      </div>

      {/* Mobile Left-Side Navigation Drawer with Accordions */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            variants={mobileNavDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-0 left-0 w-4/5 max-w-[300px] h-full bg-gray-800/90 backdrop-blur-xl shadow-2xl z-20 ${navBarPaddingTopClass} p-4 flex flex-col text-white`}
          >
            <h2 className="text-xl font-bold text-blue-300 mb-4 px-1.5">
              Explore Sections
            </h2>
            <div className="flex-grow overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-thumb-gray-600/80 scrollbar-track-gray-700/50">
              {navPlanets.map((planet) => (
                <div
                  key={planet.name}
                  className="rounded-lg bg-gray-700/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleMobileAccordion(planet.name)}
                    className="w-full flex justify-between items-center px-3.5 py-3 text-left text-[1.05rem] font-medium hover:bg-blue-600/60 focus:outline-none transition-colors duration-150"
                  >
                    <span>{planet.name}</span>
                    <ChevronDown
                      size={22}
                      className={`transition-transform duration-200 ${
                        activeMobileAccordion === planet.name
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {activeMobileAccordion === planet.name && (
                      <motion.div
                        variants={mobileAccordionContentVariants}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="bg-gray-600/30" // Slightly different bg for accordion content
                      >
                        <div className="pt-1 pb-1.5 px-1.5 space-y-0.5">
                          {planet.moons?.map((moon) => (
                            <button
                              key={moon.name}
                              onClick={() =>
                                handleMobileMoonClick(moon, planet)
                              }
                              className="block w-full text-left pl-4 pr-2 py-2 text-[0.95rem] text-gray-100 hover:bg-blue-500/50 hover:text-white rounded-md transition-colors duration-100"
                            >
                              {moon.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
