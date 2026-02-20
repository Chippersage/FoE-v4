// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Video, FileText, Check, Lock } from "lucide-react";
import { useUserContext } from "../context/AuthContext";
import HomeExitIcon from "./icons/HomeExitIcon";
import useCourseStore from "../store/courseStore";
import SidebarSkeleton from "../pages/course/skeletons/SidebarSkeleton";
import useCourseEntryRedirect from "../pages/course/hooks/useCourseEntryRedirect"; 
import { hasFullAccess } from "../pages/course/utils/accessControl";

// --------------------------------------------------------------------------
// STATIC COMPONENTS
// --------------------------------------------------------------------------

const RoundCheckbox = React.memo(({ completed, active }: { 
  completed: boolean; 
  active: boolean 
}) => (
  <div className="relative flex-shrink-0">
    <div
      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200
        ${completed ? "bg-[#0EA5E9] border-[#0EA5E9]" : "border-gray-300 group-hover:border-gray-400"}
        ${active ? "border-[#0EA5E9]" : ""}`}
    >
      {completed && <Check size={10} className="text-white stroke-[3]" />}
    </div>
  </div>
));

// --------------------------------------------------------------------------
// MAIN SIDEBAR COMPONENT
// --------------------------------------------------------------------------

const Sidebar: React.FC = () => {
  // --------------------------------------------------------------------------
  // 1. HOOKS & STATE
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const { programId, stageId, unitId, conceptId } = useParams<{
    programId: string;
    stageId?: string;
    unitId?: string;
    conceptId?: string;
  }>();
  
  const { user } = useUserContext();
  const { programName, stages, isLoading } = useCourseStore();
  
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [localStages, setLocalStages] = useState<any[]>(stages);
  
  // const isMentor = user?.userType?.toLowerCase() === "mentor";
  const fullAccess = hasFullAccess(user);
  
  // --------------------------------------------------------------------------
  // 2. USE COURSE ENTRY REDIRECT HOOK (IMPORTED)
  // --------------------------------------------------------------------------
  // useCourseEntryRedirect({
  //   enabled: Boolean(programId && !stageId && !unitId && !conceptId),
  // });
  
  // --------------------------------------------------------------------------
  // 3. MEMOIZED VALUES
  // --------------------------------------------------------------------------
  
  const buildGlobalList = useMemo(() => {
    const list: Array<{
      stageId: string;
      unitId: string;
      subconceptId: string;
      type: string;
      completed: boolean;
    }> = [];

    localStages?.forEach((stage: any) => {
      stage.units?.forEach((unit: any) => {
        unit.subconcepts?.forEach((sub: any) => {
          list.push({
            stageId: stage.stageId,
            unitId: unit.unitId,
            subconceptId: sub.subconceptId,
            type: (sub.subconceptType || "").toLowerCase(),
            completed: (sub.completionStatus || "").toLowerCase() === "yes",
          });
        });
      });
    });

    return list;
  }, [localStages]);
  
  // --------------------------------------------------------------------------
  // 4. CALLBACK HANDLERS
  // --------------------------------------------------------------------------
  
  const toggleStage = useCallback((stageId: string) => {
    setOpenStages((prev) =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  }, []);
  
  const isSubconceptLocked = useCallback((unit: any, subIndex: number): boolean => {
    const sub = unit.subconcepts?.[subIndex];
    if (!sub) return true;

    // if (isMentor) return false;
    if (fullAccess) return false;


    if (!buildGlobalList.length) return false;

    const currentGlobalIndex = buildGlobalList.findIndex(
      (g) => g.subconceptId === sub.subconceptId
    );
    if (currentGlobalIndex === -1) return true;

    const currentType = (sub.subconceptType || "").toLowerCase();
    
    if(currentType.startsWith("assignment")) {
      const isDisabled = (sub.completionStatus || "").toLowerCase() === "disabled";
      return isDisabled;
    }

    let lastCompletedIndex = -1;
    for (let i = 0; i < buildGlobalList.length; i++) {
      const g = buildGlobalList[i];
      if (!g.type.startsWith("assignment") && g.completed) {
        lastCompletedIndex = i;
      }
    }

    if (lastCompletedIndex === -1) return currentGlobalIndex !== 0;
    if (buildGlobalList[currentGlobalIndex].completed) return false;

    let nextUnlockIndex = lastCompletedIndex + 1;
    while (
      nextUnlockIndex < buildGlobalList.length &&
      buildGlobalList[nextUnlockIndex].type.startsWith("assignment")
    ) {
      nextUnlockIndex++;
    }

    return currentGlobalIndex > nextUnlockIndex;
  }, [fullAccess, buildGlobalList]);

  
  const handleSubconceptClick = useCallback((
    sub: any, 
    unit: any, 
    stage: any, 
    isLocked: boolean
  ) => {
    if (isLocked) return;
    
    localStorage.setItem("lastViewedSubconcept", sub.subconceptId);
    
    navigate(
      `/course/${programId}/stage/${stage.stageId}/unit/${unit.unitId}/concept/${sub.subconceptId}`
    );
  }, [programId, navigate]);
  
  const handleUnitClick = useCallback((unit: any, stage: any) => {
    if (!unit.unitLink) return;
    
    navigate(
      `/course/${programId}/stage/${stage.stageId}/unit/${unit.unitId}/concept/${unit.unitId}`
    );
  }, [programId, navigate]);
  
  // --------------------------------------------------------------------------
  // 5. EFFECTS
  // --------------------------------------------------------------------------
  
  useEffect(() => {
    if (stages && stages.length > 0) {
      setLocalStages(stages);
    }
  }, [stages]);
  
  useEffect(() => {
    if (!conceptId || !localStages.length) return;
    
    const findStageForConcept = () => {
      for (const stage of localStages) {
        for (const unit of stage.units || []) {
          if (unit.unitId === conceptId) {
            return stage.stageId;
          }
          
          const hasMatch = (unit.subconcepts || []).some(
            (sub: any) => sub.subconceptId === conceptId
          );
          if (hasMatch) {
            return stage.stageId;
          }
        }
      }
      return null;
    };
    
    const activeStageId = findStageForConcept();
    if (activeStageId && !openStages.includes(activeStageId)) {
      setOpenStages([activeStageId]);
    }
  }, [conceptId, localStages]);
  
  useEffect(() => {
    const handleCompletionUpdate = (e: CustomEvent) => {
      const { subconceptId } = e.detail;
      if (!subconceptId) return;
      
      setLocalStages((prev) =>
        prev.map((stage) => ({
          ...stage,
          units: stage.units.map((unit) => ({
            ...unit,
            subconcepts: unit.subconcepts.map((sub) =>
              sub.subconceptId === subconceptId
                ? { ...sub, completionStatus: "yes" }
                : sub
            ),
          })),
        }))
      );
    };
    
    window.addEventListener("updateSidebarCompletion", handleCompletionUpdate as EventListener);
    return () => {
      window.removeEventListener("updateSidebarCompletion", handleCompletionUpdate as EventListener);
    };
  }, []);
  
  // --------------------------------------------------------------------------
  // 6. RENDER
  // --------------------------------------------------------------------------
  
  if (isLoading) {
    return <SidebarSkeleton />;
  }
  
  const SidebarContent = () => {
    if (localStages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500 text-sm font-sans">No content available</p>
        </div>
      );
    }

    return (
      <div className="px-0 py-0 space-y-0 font-sans">
        {localStages.map((stage: any, stageIndex: number) => {
          return (
            <div key={stage.stageId} className="border-b border-gray-100 last:border-b-0">
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(stage.stageId)}
                className="flex w-full text-left hover:bg-gray-50 cursor-pointer px-6 py-4"
              >
                <div className="flex-1 text-left">
                  <div className="text-xs text-gray-600 mb-1 font-medium leading-none">
                    {`Module ${stageIndex + 1}`}
                  </div>
                  <div className="text-[14px] font-medium text-gray-900 leading-snug">
                    {stage.stageName || `Stage ${stageIndex + 1}`}
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0 self-center">
                  {openStages.includes(stage.stageId) ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
              </button>

              {/* Units + Subconcepts */}
              {openStages.includes(stage.stageId) && (
                <div className="bg-gray-50">
                  {stage.units.map((unit: any, unitIndex: number) => {
                    return (
                      <div key={unit.unitId} className="border-t border-gray-100 first:border-t-0">
                        {/* Unit Row */}
                        <div
                          onClick={() => handleUnitClick(unit, stage)}
                          className={`px-6 py-3 transition-colors ${
                            !unit.unitLink
                              ? 'opacity-70 cursor-not-allowed'
                              : conceptId === unit.unitId
                              ? "bg-blue-50"
                              : "hover:bg-gray-100 cursor-pointer"
                          }`}
                        >
                          <div className="text-[14px] font-medium text-gray-900">
                            {unit.unitName || `Unit ${unitIndex + 1}`}
                          </div>
                        </div>

                        {/* Subconcept Rows - CHANGED: items-start → items-center */}
                        {unit.subconcepts?.map((sub: any, subIndex: number) => {
                          const subCompleted = (sub.completionStatus || "").toLowerCase() === "yes";
                          const type = (sub.subconceptType || "").toLowerCase();
                          const isVideo = type === "video";
                          const isLocked = isSubconceptLocked(unit, subIndex);

                          return (
                            <div
                              key={sub.subconceptId}
                              onClick={() => handleSubconceptClick(sub, unit, stage, isLocked)}
                              className={`px-6 py-3 border-t border-gray-100 flex items-center gap-3 transition-colors ${
                                isLocked
                                  ? "cursor-not-allowed opacity-70"
                                  : conceptId === sub.subconceptId
                                  ? "bg-blue-50 cursor-pointer"
                                  : "hover:bg-gray-100 cursor-pointer"
                              }`}
                            >
                              <RoundCheckbox
                                completed={subCompleted}
                                active={conceptId === sub.subconceptId}
                              />

                              <div className="flex-1 min-w-0 flex items-center gap-3">
                                {isVideo ? (
                                  <Video size={16} className={`flex-shrink-0 ${
                                    isLocked ? 'text-gray-400' : 'text-gray-600'
                                  }`} />
                                ) : (
                                  <FileText size={16} className={`flex-shrink-0 ${
                                    isLocked ? 'text-gray-400' : 'text-gray-600'
                                  }`} />
                                )}
                                
                                <div className="flex-1">
                                  <div className={`text-[13px] leading-snug ${
                                    isLocked ? 'text-gray-500' : conceptId === sub.subconceptId ? 'text-gray-900 font-medium' : 'text-gray-800'
                                  }`}>
                                    {`${stageIndex + 1}.${(() => {
                                      let count = 1;
                                      for (let u of stage.units) {
                                        if (u.unitId === unit.unitId) break;
                                        count += u.subconcepts?.length || 0;
                                      }
                                      return count + subIndex;
                                    })()} ${sub.subconceptDesc || sub.subconceptName || `Concept ${subIndex + 1}`}`}
                                  </div>
                                </div>
                              </div>

                              {isLocked && (
                                <Lock size={14} className="text-gray-400 flex-shrink-0 ml-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="flex flex-col h-full min-h-0 bg-white text-black font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full min-h-0 border-r border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="cursor-pointer">
              <HomeExitIcon size={22} className="text-gray-600 hover:text-gray-900 transition-colors" />
            </div>
            <div>
              <div className="text-[16px] font-semibold text-gray-900 leading-tight">
                {programName || "Course"}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="flex md:hidden flex-col h-full min-h-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="cursor-pointer">
              <HomeExitIcon size={20} className="text-gray-600" />
            </div>
            <div className="text-[15px] font-semibold text-gray-900">
              {programName || "Course"}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);