// @ts-nocheck
import React from "react";

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
    for (let stage of stages) {
      for (let unit of stage.units) {
        // within subconcepts
        if (unit.subconcepts && unit.subconcepts.length > 0) {
          for (let i = 0; i < unit.subconcepts.length; i++) {
            const sub = unit.subconcepts[i];
            if (sub.subconceptId === currentContentId) {
              // found current → next subconcept
              if (i + 1 < unit.subconcepts.length) {
                return {
                  ...unit.subconcepts[i + 1],
                  stageId: stage.stageId,
                  unitId: unit.unitId,
                };
              }
            }
          }
        }

        // If current content is a unit
        if (unit.unitId === currentContentId) {
          const nextUnitIndex = stage.units.indexOf(unit) + 1;
          if (nextUnitIndex < stage.units.length) {
            const nextUnit = stage.units[nextUnitIndex];
            if (nextUnit.subconcepts?.length)
              return {
                ...nextUnit.subconcepts[0],
                stageId: stage.stageId,
                unitId: nextUnit.unitId,
              };
            else if (nextUnit.unitLink)
              return {
                subconceptLink: nextUnit.unitLink,
                subconceptId: nextUnit.unitId,
                subconceptType: "video",
                stageId: stage.stageId,
                unitId: nextUnit.unitId,
              };
          }
        }
      }
    }
    return null;
  };

  const nextSub = findNextSubconcept();

  if (!nextSub) return null;

  return (
    <button
      onClick={() => onNext(nextSub)}
      className="bg-[#0EA5E9] hover:bg-[#DB5788] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
    >
      Go To Next →
    </button>
  );
};

export default NextSubconceptButton;
