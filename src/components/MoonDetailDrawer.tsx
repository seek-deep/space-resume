// src/components/MoonDetailDrawer.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon } from "../constants"; // Assuming Moon type is exported from constants

interface MoonDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moonData: Moon | null;
  navBarHeightClass?: string; // e.g., "h-16"
}

const MoonDetailDrawer: React.FC<MoonDetailDrawerProps> = ({
  isOpen,
  onClose,
  moonData,
  navBarHeightClass = "h-16", // Default to h-16 (4rem)
}) => {
  // Determine the rem value for navbar height (assuming 1rem = 16px for Tailwind's default base font size)
  // h-16 in Tailwind is typically 4rem.
  const navBarRemHeight = navBarHeightClass === "h-16" ? "4rem" : "4rem"; // Defaulting, make more robust if other heights are possible
  console.log("MoonDetailDrawer rendered with moonData:", moonData);
  if (!moonData) return null;

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

  const drawerTransition = { type: "spring", damping: 28, stiffness: 220 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for Mobile Bottom Sheet */}
          <motion.div
            key="moon-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-30 md:hidden" // z-30 for mobile backdrop
          />

          {/* Desktop: Left-Side Drawer (Below Navbar) */}
          <motion.div
            key="desktop-moon-detail-drawer"
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
            className={`fixed left-0 w-full md:w-2/5 lg:w-1/3 xl:w-1/4 bg-gray-900/85 backdrop-blur-lg text-white p-6 shadow-xl z-20 hidden md:flex flex-col`}
            style={{
              top: navBarRemHeight,
              height: `calc(100vh - ${navBarRemHeight})`,
            }}
          >
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h2 className="text-2xl font-bold text-teal-300">
                {moonData.name}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-1.5 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <p className="text-gray-200 whitespace-pre-line leading-relaxed">
                {moonData.description}
              </p>
            </div>
          </motion.div>

          {/* Mobile: Bottom Sheet Drawer */}
          <motion.div
            key="mobile-moon-detail-drawer"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
            className="fixed bottom-0 left-0 right-0 w-full max-h-[75vh] bg-gray-900/90 backdrop-blur-lg text-white pt-4 pb-5 px-5 shadow-2xl z-40 rounded-t-2xl md:hidden flex flex-col"
          >
            <div
              className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto mb-3 shrink-0 cursor-grab"
              onTouchStart={onClose}
            />{" "}
            {/* Handlebar */}
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-xl font-bold text-teal-300 text-center flex-grow pl-7">
                {moonData.name}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close details"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-1.5 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              <p className="text-gray-200 whitespace-pre-line leading-relaxed text-sm">
                {moonData.description}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoonDetailDrawer;
