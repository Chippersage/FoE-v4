import type React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewProps {
  children: React.ReactNode;
  recordingState?: "recording" | "paused" | "stopped";
}

export const Preview: React.FC<PreviewProps> = ({
  children,
  recordingState,
}) => {
  return (
    <AnimatePresence>
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg p-2 z-50"
        >
          {children}
          {recordingState && (
            <div className="mt-2 text-xs text-gray-500">
              {recordingState === "recording" && "Recording..."}
              {recordingState === "paused" && "Paused"}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
