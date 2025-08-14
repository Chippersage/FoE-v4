import type React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewProps {
  children: React.ReactNode;
  recordingState?: "recording" | "paused" | "stopped";
  recordingDuration?: number;
  activeAction?: "audio" | "video";
}

export const Preview: React.FC<PreviewProps> = ({
  children,
  recordingState,
  recordingDuration,
  activeAction,
}) => {

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <AnimatePresence>
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-28 right-4 bg-white rounded-[8px] shadow-lg z-50 p-2"
        >
          <div className="flex items-center gap-2">
            {children}
            {activeAction === "audio" && (
              <span className="text-xs text-gray-700">
                {formatTime(recordingDuration || 0)}
              </span>
            )}
          </div>

          {activeAction === "video" && (
            <div className="text-center mt-1 text-xs text-gray-700">
              {formatTime(recordingDuration || 0)}
            </div>
          )}  

          {recordingState && (
            <div className=" text-xs text-gray-500">
              {recordingState === "recording" && "Recording..."}
              {recordingState === "paused" && "Paused"}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
