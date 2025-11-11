export const getInitialSubconcept = (stagesData: any[]) => {
  if (!Array.isArray(stagesData) || stagesData.length === 0) return null;

  const lastViewedId = localStorage.getItem("lastViewedSubconcept");
  let resumeSubconcept = null;

  if (lastViewedId) {
    for (const stage of stagesData) {
      for (const unit of stage.units || []) {
        const found = unit.subconcepts?.find(
          (s: any) => s.subconceptId === lastViewedId
        );
        if (found) {
          resumeSubconcept = { stage, unit, sub: found };
          break;
        }
      }
      if (resumeSubconcept) break;
    }
  }

  if (!resumeSubconcept) {
    for (const stage of stagesData) {
      for (const unit of stage.units || []) {
        const firstIncomplete = unit.subconcepts?.find(
          (s: any) => (s.completionStatus || "").toLowerCase() !== "yes"
        );
        if (firstIncomplete) {
          resumeSubconcept = { stage, unit, sub: firstIncomplete };
          break;
        }
      }
      if (resumeSubconcept) break;
    }
  }

  if (!resumeSubconcept && stagesData.length) {
    const firstStage = stagesData[0];
    const firstUnit = firstStage.units?.[0];
    const firstSub = firstUnit?.subconcepts?.[0];
    if (firstSub)
      resumeSubconcept = { stage: firstStage, unit: firstUnit, sub: firstSub };
  }

  return resumeSubconcept;
};
