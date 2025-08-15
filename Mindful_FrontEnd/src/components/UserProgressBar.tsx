import { useState } from "react";
import { motion } from "framer-motion";

// @ts-ignore
export default function UserProgressBar({ userProgress }) {
  const {
    totalStages,
    totalUnits,
    totalSubconcepts,
    completedStages,
    completedUnits,
    completedSubconcepts,
    subconceptCompletionPercentage,
  } = userProgress;

  const [isHovered, setIsHovered] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  // @ts-ignore
  const handleMouseMove = (event) => {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    setCursorPosition(cursorX);
  };

  const completionPercentage = subconceptCompletionPercentage?.toFixed(1);

  return (
    <div
      className="relative w-full max-w-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Progress Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Learning Progress</span>
        <span className="text-sm font-semibold text-slate-900">{completionPercentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative"
        >
          {/* Shimmer effect for active progress */}
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </motion.div>
      </div>

      {/* Professional Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute top-full mt-3 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg shadow-lg z-10 min-w-[200px]"
          style={{
            left: `${Math.min(Math.max(cursorPosition - 100, 0), 200)}px`,
          }}
        >
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
              Progress Overview
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Stages:</span>
                  <span className="font-medium">{completedStages}/{totalStages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Units:</span>
                  <span className="font-medium">{completedUnits}/{totalUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Activities:</span>
                  <span className="font-medium">{completedSubconcepts}/{totalSubconcepts}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tooltip Arrow */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-slate-200 rotate-45" />
        </motion.div>
      )}
    </div>
  );
}
