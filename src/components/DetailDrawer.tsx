// src/components/DetailDrawer.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrbitData, Moon } from "../constants";

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planetData: OrbitData | null;
  navBarHeightClass?: string; // e.g., "h-16", used for desktop top offset
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  planetData,
  navBarHeightClass = "h-16", // Default to h-16 (4rem)
}) => {
  const [expandedMoon, setExpandedMoon] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setExpandedMoon(null); // Reset accordion when drawer closes
    }
  }, [isOpen]);

  // Determine the rem value for navbar height (assuming 1rem = 16px, h-16 = 4rem)
  // This is a common Tailwind setup. If base font size differs, this calculation might need adjustment
  // or the value should be passed as a direct numerical prop.
  const navBarRemHeight = navBarHeightClass === "h-16" ? "4rem" : "4rem"; // Defaulting to 4rem, make more robust if other heights are used

  if (!planetData) return null;

  const toggleMoon = (moonName: string) => {
    setExpandedMoon(expandedMoon === moonName ? null : moonName);
  };

  // Desktop: Slide in from left, below navbar
  const desktopVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  // Mobile: Slide up from bottom
  const mobileVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  };

  const accordionTransition = { duration: 0.3, ease: "easeInOut" };
  const drawerTransition = { type: "spring", damping: 30, stiffness: 250 };

  const renderMoonAccordion = (moon: Moon, isDesktop: boolean) => (
    <div key={moon.name} className="mb-2.5">
      <button
        onClick={() => toggleMoon(moon.name)}
        className={`w-full text-left p-3.5 rounded-lg transition-colors duration-200 flex justify-between items-center ${
          expandedMoon === moon.name ? "bg-blue-600/40" : "bg-gray-700/60 hover:bg-gray-600/70"
        }`}
      >
        <h4 className={`${isDesktop ? 'text-md' : 'text-base'} font-semibold text-amber-300`}>{moon.name}</h4>
        <motion.span
          animate={{ rotate: expandedMoon === moon.name ? 180 : 0 }}
          transition={{ duration: 0.25 }} className="text-teal-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {expandedMoon === moon.name && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: "0.25rem" }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={accordionTransition}
            className={`overflow-hidden ${isDesktop ? 'text-sm' : 'text-xs'} text-gray-200 pl-3 pr-3 pb-3 bg-gray-700/50 rounded-b-lg`}
          >
            <p className="whitespace-pre-line pt-2.5 mt-1 border-t border-gray-600">{moon.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Mobile Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-30 md:hidden" // z-30 for mobile backdrop
          />

          {/* Desktop: Left-Side Drawer (Below Navbar) */}
          <motion.div
            key="desktop-detail-drawer"
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
            className={`fixed left-0 w-full md:w-2/5 lg:w-1/3 xl:w-1/4 bg-gray-900/80 backdrop-blur-xl text-white p-6 shadow-2xl z-20 hidden md:flex flex-col`}
            style={{ top: navBarRemHeight, height: `calc(100vh - ${navBarRemHeight})` }}
          >
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h2 className="text-2xl font-bold text-blue-300">{planetData.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-1.5 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {planetData.moons && planetData.moons.length > 0 ? (
                planetData.moons.map((moon) => renderMoonAccordion(moon, true))
              ) : (
                <p className="text-gray-400 italic">No further details for this section.</p>
              )}
            </div>
          </motion.div>

          {/* Mobile: Bottom Sheet Drawer */}
          <motion.div
            key="mobile-detail-drawer"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
            className="fixed bottom-0 left-0 right-0 w-full max-h-[85vh] bg-gray-900/90 backdrop-blur-xl text-white pt-4 pb-5 px-5 shadow-2xl z-40 rounded-t-2xl md:hidden flex flex-col" // z-40 for mobile
          >
            <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-3 shrink-0 cursor-grab" onTouchStart={onClose} /> {/* Handlebar */}
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-bold text-blue-300 text-center flex-grow pl-7">{planetData.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-1.5 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {planetData.moons && planetData.moons.length > 0 ? (
                planetData.moons.map((moon) => renderMoonAccordion(moon, false))
              ) : (
                <p className="text-gray-400 italic">No further details for this section.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailDrawer;
