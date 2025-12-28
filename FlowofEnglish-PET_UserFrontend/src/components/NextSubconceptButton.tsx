// @ts-nocheck
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCourseStore from "../store/courseStore";
import { ArrowRight } from "lucide-react";

interface NextSubconceptButtonProps {
  disabled?: boolean; // Keep disabled prop for external control (like video 90% rule)
  isDemoUser?: boolean;
  onDisabledClick?: () => void; // For demo user locked content
}

/**
 * NextSubconceptButton Component
 * 
 * NEW ARCHITECTURE:
 * - NO props for stages, currentContentId, onNext
 * - Reads current location from URL params
 * - Calculates next concept from courseStore
 * - Navigates directly using useNavigate()
 * - Completely independent of CoursePage/CourseContext
 */
const NextSubconceptButton: React.FC<NextSubconceptButtonProps> = ({
  disabled = false,
  isDemoUser = false,
  onDisabledClick
}) => {
  const navigate = useNavigate();
  
  // Get current location from URL
  const { programId, stageId, unitId, conceptId } = useParams<{
    programId: string;
    stageId?: string;
    unitId?: string;
    conceptId?: string;
  }>();
  
  // Get course data from store
  const { getNextSubconcept, getSubconceptById } = useCourseStore();
  
  // Handle disabled click (demo users trying to access locked content)
  const handleDisabledClick = () => {
    if (isDemoUser && onDisabledClick) {
      onDisabledClick();
    }
  };
  
  // Find the next subconcept
  const findNextSubconcept = () => {
    if (!conceptId) return null;
    
    // Get current subconcept to check if locked for demo
    const currentSubconcept = getSubconceptById(conceptId);
    if (isDemoUser && currentSubconcept?.isLockedForDemo) {
      return null; // Can't navigate from locked content
    }
    
    // Get next subconcept from store
    const next = getNextSubconcept(conceptId);
    
    if (!next) return null;
    
    // Check if next is locked for demo
    if (isDemoUser && next.isLockedForDemo) {
      return null; // Can't navigate to locked content
    }
    
    return next;
  };
  
  const nextSubconcept = findNextSubconcept();
  
  // Handle navigation to next
  const handleNext = () => {
    if (disabled) {
      handleDisabledClick();
      return;
    }
    
    if (!programId || !nextSubconcept) return;
    
    navigate(
      `/course/${programId}/stage/${nextSubconcept.stageId}/unit/${nextSubconcept.unitId}/concept/${nextSubconcept.subconceptId}`
    );
  };
  
  // End of program - show completed button
  if (!nextSubconcept) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center justify-center gap-2 cursor-not-allowed"
      >
        Course Completed
      </button>
    );
  }
  
  // Determine button label based on navigation type
  const getButtonLabel = () => {
    if (!conceptId || !nextSubconcept) return "Go To Next";
    
    // If moving to different unit
    if (nextSubconcept.unitId !== unitId) return "Next Session";
    
    // If moving to different stage  
    if (nextSubconcept.stageId !== stageId) return "Next Module";
    
    // Same unit, same stage
    return "Go To Next";
  };
  
  const buttonLabel = getButtonLabel();
  
  return (
    <button
      id={`next-subconcept-btn${disabled ? "-locked" : "-unlocked"}`}
      onClick={handleNext}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all duration-200 ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-[#0EA5E9] hover:bg-[#DB5788] text-white cursor-pointer hover:shadow-md active:scale-95"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="align-middle">{buttonLabel}</span>
        {!disabled && <ArrowRight size={16} className="relative top-[1px]" />}
      </span>
    </button>
  );
};

export default NextSubconceptButton;