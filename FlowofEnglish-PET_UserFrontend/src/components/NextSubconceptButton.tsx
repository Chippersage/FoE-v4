// @ts-nocheck
import React from "react";
import { ArrowRight } from "lucide-react"; // Lucide icon

interface NextSubconceptButtonProps {
  stages: any[];
  currentContentId: string;
  onNext: (nextSub: any) => void;
}

const NextSubconceptButton: React.FC<NextSubconceptButtonProps> = ({
  stages,
  currentContentId,
  onNext,
}) => {
  const findNextSubconcept = () => {
    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      const stage = stages[stageIndex];

      for (let unitIndex = 0; unitIndex < stage.units.length; unitIndex++) {
        const unit = stage.units[unitIndex];
        const subs = unit.subconcepts || [];

        for (let subIndex = 0; subIndex < subs.length; subIndex++) {
          const sub = subs[subIndex];

          if (sub.subconceptId === currentContentId) {
            // Case 1: Next subconcept exists in same unit
            if (subIndex + 1 < subs.length) {
              const next = subs[subIndex + 1];
              return {
                next,
                label: "Go To Next",
              };
            }

            // Case 2: End of unit → move to first subconcept of next unit
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

            // Case 3: End of module → move to first subconcept of next stage
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

  // Case 4: End of program → show disabled completion button
  if (!nextResult) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm cursor-not-allowed flex items-center justify-center gap-2"
      >
        Course Completed
      </button>
    );
  }

  // Other cases → active navigation button
  return (
    <button
      onClick={() => onNext(nextResult.next)}
      className="bg-[#0EA5E9] hover:bg-[#DB5788] text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-2"
    >
      <span className="flex items-center gap-2">
        <span className="align-middle">{nextResult.label}</span>
        <ArrowRight size={16} className="relative top-[1px]" />
      </span>
    </button>
  );
};

export default NextSubconceptButton;
