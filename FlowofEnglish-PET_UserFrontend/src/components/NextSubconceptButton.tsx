// @ts-nocheck
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCourseStore from "../store/courseStore";
import { ArrowRight } from "lucide-react";

interface NextSubconceptButtonProps {
  disabled?: boolean;
}

const NextSubconceptButton: React.FC<NextSubconceptButtonProps> = ({
  disabled = false,
}) => {
  const navigate = useNavigate();
  const { programId, stageId, unitId, conceptId } = useParams<{
    programId: string;
    stageId?: string;
    unitId?: string;
    conceptId?: string;
  }>();
  
  const { getNextSubconcept } = useCourseStore();
  
  const findNextSubconcept = () => {
    if (!conceptId) return null;
    return getNextSubconcept(conceptId);
  };
  
  const nextSubconcept = findNextSubconcept();
  
  const handleNext = () => {
    if (disabled) return;
    if (!programId || !nextSubconcept) return;
    
    navigate(
      `/course/${programId}/stage/${nextSubconcept.stageId}/unit/${nextSubconcept.unitId}/concept/${nextSubconcept.subconceptId}`
    );
  };
  
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
  
  const getButtonLabel = () => {
    if (!conceptId || !nextSubconcept) return "Go To Next";
    
    if (nextSubconcept.unitId !== unitId) return "Next Session";
    if (nextSubconcept.stageId !== stageId) return "Next Module";
    
    return "Go To Next";
  };
  
  const buttonLabel = getButtonLabel();
  
  return (
    <button
      id={`next-subconcept-btn${disabled ? "-locked" : "-unlocked"}`}
      onClick={handleNext}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-md text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all duration-200 ${
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