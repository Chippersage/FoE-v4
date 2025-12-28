// @ts-nocheck
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useCourseStore from "../../../store/courseStore";

const useCourseEntryRedirect = ({ enabled }: { enabled: boolean }) => {
  const navigate = useNavigate();
  const { programId } = useParams();
  const { stages } = useCourseStore();

  useEffect(() => {
    if (!enabled) return;
    if (!programId || !stages.length) return;

    let target = null;

    // 1️⃣ Last viewed
    const lastViewed = localStorage.getItem("lastViewedSubconcept");
    if (lastViewed) {
      for (const stage of stages) {
        for (const unit of stage.units || []) {
          const sub = unit.subconcepts?.find(
            (s) => s.subconceptId === lastViewed
          );
          if (sub) {
            target = { stage, unit, sub };
            break;
          }
        }
        if (target) break;
      }
    }

    // 2️⃣ First unattempted
    if (!target) {
      for (const stage of stages) {
        for (const unit of stage.units || []) {
          const sub = unit.subconcepts?.find(
            (s) => (s.completionStatus || "").toLowerCase() !== "yes"
          );
          if (sub) {
            target = { stage, unit, sub };
            break;
          }
        }
        if (target) break;
      }
    }

    // 3️⃣ Fallback
    if (!target) {
      const stage = stages[0];
      const unit = stage?.units?.[0];
      const sub = unit?.subconcepts?.[0];
      if (sub) target = { stage, unit, sub };
    }

    if (target) {
      navigate(
        `/course/${programId}/stage/${target.stage.stageId}/unit/${target.unit.unitId}/concept/${target.sub.subconceptId}`,
        { replace: true }
      );
    }
  }, [enabled, programId, stages, navigate]);
};

export default useCourseEntryRedirect;
