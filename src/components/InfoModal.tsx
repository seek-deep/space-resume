import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any;
  type?: "planet" | "moon";
}

export default function InfoModal({
  isOpen,
  onClose,
  title,
  content,
  type = "planet",
}: InfoModalProps) {
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".modal-content")) return;
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, handleClickOutside]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="fixed top-0 left-0 w-[40%] h-screen overflow-y-auto z-50"
          style={{
            backgroundColor:
              type === "moon" ? "rgba(0, 0, 0, 0.65)" : "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.6)",
            padding: "0 20px",
          }}
        >
          <div className="relative modal-content">
            <div className="">
              <h1 className="text-3xl font-bold mb-6 text-blue-400 flex items-center">
                {type === "moon" && <span className="mr-2 text-2xl">🌑</span>}
                {title}
              </h1>

              <div className="prose prose-invert max-w-none">
                {typeof content === "string" ? (
                  <div
                    className={`text-gray-300 leading-relaxed space-y-4 ${
                      type === "moon" ? "moon-content" : ""
                    }`}
                  >
                    {type === "moon" && (
                      <div className="bg-white/5 p-4 rounded-lg backdrop-blur-sm mb-4 border border-white/10">
                        <h2 className="text-lg font-medium mb-2 text-blue-300">
                          Details
                        </h2>
                        {content.split("\n").map((paragraph, i) => (
                          <p key={i} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                    {type !== "moon" &&
                      content
                        .split("\n")
                        .map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                  </div>
                ) : (
                  content
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
