// components/MarkCompleteButton.tsx
// @ts-nocheck
import React, { useState } from "react";
import { Check } from "lucide-react";
import { useUserAttempt } from "../../../hooks/useUserAttempt";

interface MarkCompleteButtonProps {
  userId: string;
  programId: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
  subconceptType: string;
  subconceptMaxscore: number;
  isMobile?: boolean;
  onMarkComplete?: () => void;
}

const MarkCompleteButton: React.FC<MarkCompleteButtonProps> = ({
  userId,
  programId,
  stageId,
  unitId,
  subconceptId,
  subconceptType,
  subconceptMaxscore,
  isMobile = false,
  onMarkComplete,
}) => {
  const { recordAttempt } = useUserAttempt();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleMarkComplete = async () => {
    if (isLoading || isCompleted) return;
    
    try {
      setIsLoading(true);
      
      await recordAttempt({
        userId,
        programId,
        stageId,
        unitId,
        subconceptId,
        subconceptType,
        subconceptMaxscore,
        score: subconceptMaxscore, // Full marks for manual completion
      });

      setIsCompleted(true);
      
      if (onMarkComplete) onMarkComplete();
      
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId },
        })
      );
      
    } catch (error) {
      console.error("Error marking as complete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className={`${isMobile ? 'px-3 py-2' : 'px-4 py-2'} bg-green-100 text-green-800 rounded-md text-sm font-medium flex items-center gap-2`}>
        <Check className="w-4 h-4" />
        <span>Completed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleMarkComplete}
      disabled={isLoading}
      className={`
        ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm'}
        rounded-md font-medium transition flex items-center gap-2
        ${isLoading 
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
          : 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white'
        }
      `}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Marking...</span>
        </>
      ) : (
        <>
          <Check className="w-4 h-4" />
          <span>Mark as Complete</span>
        </>
      )}
    </button>
  );
};

export default MarkCompleteButton;