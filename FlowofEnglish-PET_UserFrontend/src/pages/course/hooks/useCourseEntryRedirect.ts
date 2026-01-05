// @ts-nocheck
import { useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import useCourseStore from "../../../store/courseStore";
import { useUserContext } from "../../../context/AuthContext";

const useCourseEntryRedirect = ({ enabled }: { enabled: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { programId } = useParams();
  const { stages, isLoading: isCourseLoading } = useCourseStore();
  const { user } = useUserContext();
  
  // Track redirect state to prevent multiple runs
  const hasRunRef = useRef(false);
  const redirectInProgressRef = useRef(false);
  
  const isMentor = user?.userType?.toLowerCase() === "mentor";

  // Check if we're already on a concept page
  const isAlreadyOnConceptPage = useMemo(() => {
    return location.pathname.includes('/concept/');
  }, [location.pathname]);

  // Conditions for running redirect logic
  const shouldRun = useMemo(() => {
    return enabled && 
           !isCourseLoading && 
           stages && 
           stages.length > 0 && 
           !isAlreadyOnConceptPage &&
           !hasRunRef.current;
  }, [enabled, isCourseLoading, stages, isAlreadyOnConceptPage]);

  // Build global list of all subconcepts for locking logic
  const buildGlobalList = useMemo(() => {
    if (!shouldRun) return [];

    const list: Array<{
      subconceptId: string;
      type: string;
      completed: boolean;
    }> = [];

    stages?.forEach((stage: any) => {
      stage.units?.forEach((unit: any) => {
        unit.subconcepts?.forEach((sub: any) => {
          list.push({
            subconceptId: sub.subconceptId,
            type: (sub.subconceptType || "").toLowerCase(),
            completed: (sub.completionStatus || "").toLowerCase() === "yes",
          });
        });
      });
    });

    return list;
  }, [stages, shouldRun]);

  // Check if a subconcept is locked based on completion and type rules
  const isSubconceptLocked = useCallback((subconceptId: string): boolean => {
    if (!shouldRun) return true;
    if (isMentor) return false;
    if (!buildGlobalList.length) return false;

    const currentGlobalIndex = buildGlobalList.findIndex(
      (g) => g.subconceptId === subconceptId
    );
    if (currentGlobalIndex === -1) return true;

    let targetSubconcept: any = null;
    for (const stage of stages) {
      for (const unit of stage.units || []) {
        const sub = unit.subconcepts?.find((s: any) => s.subconceptId === subconceptId);
        if (sub) {
          targetSubconcept = sub;
          break;
        }
      }
      if (targetSubconcept) break;
    }

    if (!targetSubconcept) return true;

    const currentType = (targetSubconcept.subconceptType || "").toLowerCase();
    
    if(currentType.startsWith("assignment")) {
      const isDisabled = (targetSubconcept.completionStatus || "").toLowerCase() === "disabled";
      return isDisabled;
    }

    // Find last completed non-assignment subconcept
    let lastCompletedIndex = -1;
    for (let i = 0; i < buildGlobalList.length; i++) {
      const g = buildGlobalList[i];
      if (!g.type.startsWith("assignment") && g.completed) {
        lastCompletedIndex = i;
      }
    }

    if (lastCompletedIndex === -1) return currentGlobalIndex !== 0;
    if (buildGlobalList[currentGlobalIndex].completed) return false;

    // Skip assignments when determining next unlock index
    let nextUnlockIndex = lastCompletedIndex + 1;
    while (
      nextUnlockIndex < buildGlobalList.length &&
      buildGlobalList[nextUnlockIndex].type.startsWith("assignment")
    ) {
      nextUnlockIndex++;
    }

    return currentGlobalIndex > nextUnlockIndex;
  }, [isMentor, buildGlobalList, stages, shouldRun]);

  // Main redirect logic
  useEffect(() => {
    // Prevent multiple concurrent redirects
    if (redirectInProgressRef.current) return;
    if (!shouldRun) return;

    redirectInProgressRef.current = true;
    hasRunRef.current = true;

    let target = null;

    // Priority 1: Last viewed subconcept (if not locked)
    const lastViewed = localStorage.getItem("lastViewedSubconcept");
    if (lastViewed) {
      for (const stage of stages) {
        for (const unit of stage.units || []) {
          const sub = unit.subconcepts?.find(
            (s) => s.subconceptId === lastViewed
          );
          if (sub) {
            const locked = isSubconceptLocked(lastViewed);
            if (!locked) {
              target = { stage, unit, sub };
              break;
            }
          }
        }
        if (target) break;
      }
    }

    // Priority 2: First unattempted AND not locked subconcept
    if (!target) {
      for (const stage of stages) {
        for (const unit of stage.units || []) {
          for (const sub of unit.subconcepts || []) {
            const completed = (sub.completionStatus || "").toLowerCase() === "yes";
            const locked = isSubconceptLocked(sub.subconceptId);
            
            if (!completed && !locked) {
              target = { stage, unit, sub };
              break;
            }
          }
          if (target) break;
        }
        if (target) break;
      }
    }

    // Priority 3: First not locked subconcept (even if completed)
    if (!target) {
      for (const stage of stages) {
        for (const unit of stage.units || []) {
          for (const sub of unit.subconcepts || []) {
            const locked = isSubconceptLocked(sub.subconceptId);
            
            if (!locked) {
              target = { stage, unit, sub };
              break;
            }
          }
          if (target) break;
        }
        if (target) break;
      }
    }

    // Priority 4: Fallback to first subconcept
    if (!target) {
      const stage = stages[0];
      const unit = stage?.units?.[0];
      const sub = unit?.subconcepts?.[0];
      if (sub) target = { stage, unit, sub };
    }

    if (target) {
      localStorage.setItem("lastViewedSubconcept", target.sub.subconceptId);
      const newUrl = `/course/${programId}/stage/${target.stage.stageId}/unit/${target.unit.unitId}/concept/${target.sub.subconceptId}`;
      
      // Schedule navigation in next tick to avoid blocking
      setTimeout(() => {
        navigate(newUrl, { replace: true });
        redirectInProgressRef.current = false;
      }, 0);
    } else {
      redirectInProgressRef.current = false;
    }
  }, [shouldRun, programId, stages, navigate, isSubconceptLocked]);

  // Cleanup refs when component unmounts
  useEffect(() => {
    return () => {
      hasRunRef.current = false;
      redirectInProgressRef.current = false;
    };
  }, []);
};

export default useCourseEntryRedirect;