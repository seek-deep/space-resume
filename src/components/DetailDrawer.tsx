// src/components/DetailDrawer.tsx
import React, { useState } from "react"; // Import useState
import { motion, AnimatePresence } from "framer-motion";
import { OrbitData, Moon } from "../constants"; // Assuming these types are exported

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planetData: OrbitData | null;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  planetData,
}) => {
  const [expandedMoon, setExpandedMoon] = useState<string | null>(null); // State for expanded moon

  if (!planetData) return null;

  const toggleMoon = (moonName: string) => {
    setExpandedMoon(expandedMoon === moonName ? null : moonName);
  };

  // Reset expanded moon when drawer closes or planetData changes
  React.useEffect(() => {
    if (!isOpen || !planetData) {
      setExpandedMoon(null);
    }
  }, [isOpen, planetData]);

  // Desktop: Slide in from right
  const desktopVariants = {
    hidden: { x: "100%" },
    visible: { x: 0 },
    exit: { x: "100%" },
  };

  // Mobile: Slide up from bottom
  const mobileVariants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" },
  };

  const transition = { type: "spring", damping: 30, stiffness: 220 }; // Adjusted stiffness

  const renderMoonContent = (moon: Moon, isDesktop: boolean) => (
    <div key={moon.name} className="mb-3">
      <button
        onClick={() => toggleMoon(moon.name)}
        className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex justify-between items-center ${
          expandedMoon === moon.name ? "bg-blue-500 bg-opacity-30" : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        <h4 className={`${isDesktop ? 'text-lg' : 'text-md'} font-medium text-amber-300`}>{moon.name}</h4>
        <motion.span
            animate={{ rotate: expandedMoon === moon.name ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-teal-300"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {expandedMoon === moon.name && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: '0.5rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`overflow-hidden ${isDesktop ? 'text-sm' : 'text-xs'} text-gray-300 pl-3 pr-3 pb-3 bg-gray-800 rounded-b-lg`}
          >
            <p className="whitespace-pre-line pt-2 border-t border-gray-700">{moon.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden"
          />

          {/* Drawer Content - Desktop (Right Side) */}
          <motion.div
            key="desktop-drawer"
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="fixed top-0 right-0 w-full md:w-2/5 lg:w-1/3 xl:w-1/4 h-full bg-gray-900 bg-opacity-80 backdrop-blur-lg text-white p-6 shadow-2xl z-40 overflow-y-auto hidden md:flex md:flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-300">{planetData.name}</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 p-1 rounded-full hover:bg-white hover:bg-opacity-10"
                aria-label="Close panel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              <h3 className="text-xl font-semibold mt-2 mb-3 text-teal-300">Details & Sections:</h3>
              {planetData.moons && planetData.moons.length > 0 ? (
                planetData.moons.map((moon: Moon) => renderMoonContent(moon, true))
              ) : (
                <p className="text-gray-400 italic">No further details available for this section.</p>
              )}
            </div>
          </motion.div>

          {/* Drawer Content - Mobile (Bottom Sheet) */}
          <motion.div
            key="mobile-drawer"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="fixed bottom-0 left-0 right-0 w-full max-h-[85vh] bg-gray-900 bg-opacity-90 backdrop-blur-lg text-white pt-4 pb-6 px-5 shadow-2xl z-40 overflow-hidden rounded-t-2xl md:hidden flex flex-col"
          >
            <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-3 shrink-0"></div> {/* Handlebar */}
            <div className="flex justify-between items-center mb-3 shrink-0">
                <h2 className="text-2xl font-bold text-blue-300 text-center flex-grow pl-8">{planetData.name}</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 p-1 rounded-full hover:bg-white hover:bg-opacity-10"
                  aria-label="Close panel"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
            <div className="overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {/* <h3 className="text-lg font-semibold mt-1 mb-2 text-teal-300">Details:</h3> */}
              {planetData.moons && planetData.moons.length > 0 ? (
                planetData.moons.map((moon: Moon) => renderMoonContent(moon, false))
              ) : (
                <p className="text-gray-400 italic">No further details available for this section.</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailDrawer;
