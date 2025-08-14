import { useState } from "react";
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
    const progressBar = event.currentTarget; // The progress bar element
    const rect = progressBar.getBoundingClientRect(); // Get the bounding box
    const cursorX = event.clientX - rect.left; // Calculate cursor position relative to the progress bar
    setCursorPosition(cursorX);
  };

  const completionPercentage = subconceptCompletionPercentage?.toFixed(1);
  // console.log(completionPercentage)
  return (
    <div
      className="relative w-full max-w-md h-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="w-full h-full bg-[#DB5788] rounded-none overflow-hidden">
        <div
          className="h-full w-0 bg-green-400 transition-all duration-500 ease-in-out flex items-center justify-center"
          style={{ width: `${completionPercentage}%` }}
        ></div>
        {completionPercentage && (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-white font-semibold">
            Completed {completionPercentage}%
          </span>
        )}
      </div>
      {isHovered && (
        <div
          className="absolute top-full mt-2 px-3 py-2 bg-gray-200 opacity-80 bg-opacity-90 text-black text-sm rounded-[2px] shadow-lg transition-opacity duration-300 w-36"
          style={{
            left: `${cursorPosition}px`,
            transform: "translateX(-50%)", // Center the tooltip
          }}
        >
          <h4 className="font-semibold">Completed:</h4>
          <p>-------------</p>
          <p className="font-medium">
            Stages: {completedStages}/{totalStages}
          </p>
          <p className="font-medium">
            Units: {completedUnits}/{totalUnits}
          </p>
          <p className="font-medium">
            Activities: {completedSubconcepts}/{totalSubconcepts}
          </p>
        </div>
      )}
    </div>
  );
}
