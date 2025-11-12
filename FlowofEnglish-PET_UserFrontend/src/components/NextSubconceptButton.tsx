// @ts-nocheck
import React from "react";
import { ArrowRight } from "lucide-react";

interface NextSubconceptButtonProps {
  stages: any[];
  currentContentId: string;
  onNext: (nextSub: any) => void;
  disabled?: boolean; // Added optional disabled prop
}

/**
 * NextSubconceptButton Component
 *
 * Responsible for determining what the "next subconcept" is
 * based on the current content ID and stage/unit order.
 *
 * It does NOT call any backend APIs — it simply triggers `onNext(nextSub)`
 * when the user clicks "Go To Next".
 */
const NextSubconceptButton: React.FC<NextSubconceptButtonProps> = ({
  stages,
  currentContentId,
  onNext,
  disabled = false, // default false
}) => {
  /**
   * Finds the next subconcept in the course hierarchy.
   * Handles 4 cases:
   *  1. Next subconcept in the same unit
   *  2. Move to first subconcept of next unit
   *  3. Move to first subconcept of next stage
   *  4. End of program (no next)
   */
  const findNextSubconcept = () => {
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      const stage = stages[stageIndex];

      for (let unitIndex = 0; unitIndex < (stage.units || []).length; unitIndex++) {
        const unit = stage.units[unitIndex];
        const subs = unit.subconcepts || [];

        for (let subIndex = 0; subIndex < subs.length; subIndex++) {
          const sub = subs[subIndex];

          // Found the current subconcept
          if (sub.subconceptId === currentContentId) {
            // Case 1: Next subconcept exists in the same unit
            if (subIndex + 1 < subs.length) {
              const next = subs[subIndex + 1];
              return {
                next: {
                  ...next,
                  stageId: stage.stageId,
                  unitId: unit.unitId,
                },
                label: "Go To Next",
              };
            }

            // Case 2: End of unit → go to next unit’s first subconcept
            const nextUnit = stage.units[unitIndex + 1];
            if (nextUnit?.subconcepts?.length) {
              const next = nextUnit.subconcepts[0];
              return {
                next: {
                  ...next,
                  stageId: stage.stageId,
                  unitId: nextUnit.unitId,
                },
                label: "Next Session",
              };
            }

            // Case 3: End of stage → move to first subconcept of next stage
            const nextStage = stages[stageIndex + 1];
            if (nextStage?.units?.length) {
              const firstUnit = nextStage.units[0];
              if (firstUnit.subconcepts?.length) {
                const next = firstUnit.subconcepts[0];
                return {
                  next: {
                    ...next,
                    stageId: nextStage.stageId,
                    unitId: firstUnit.unitId,
                  },
                  label: "Next Module",
                };
              }
            }

            // Case 4: End of entire program
            return null;
          }
        }
      }
    }
    return null;
  };

  const nextResult = findNextSubconcept();

  // Case 4: End of program — show a disabled "Course Completed" button
  if (!nextResult) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center justify-center gap-2 cursor-not-allowed"
      >
        Course Completed
      </button>
    );
  }

  // Handle disabled state for Google Form / assessment or similar cases
  return (
    <button
      id="next-subconcept-btn"
      onClick={
        !disabled
          ? () =>
              onNext({
                ...nextResult.next,
                stageId: nextResult.next.stageId,
                unitId: nextResult.next.unitId,
              })
          : undefined
      }
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-all duration-200 ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-[#0EA5E9] hover:bg-[#DB5788] text-white cursor-pointer hover:shadow-md active:scale-95"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="align-middle">{nextResult.label}</span>
        {!disabled && <ArrowRight size={16} className="relative top-[1px]" />}
      </span>
    </button>
  );
};

export default NextSubconceptButton;
