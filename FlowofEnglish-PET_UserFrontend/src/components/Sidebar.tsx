// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Video, FileText, Check, Lock } from "lucide-react";
import { useUserContext } from "../context/AuthContext";
import HomeExitIcon from "./icons/HomeExitIcon";
import useCourseStore from "../store/courseStore";
import { DEMO_USER_MESSAGE } from "../config/demoUsers";
import { 
  isUnitAllowedForDemo,
  isStageAllowedForDemo,
  getProgramType,
  isDemoUser as checkIsDemoUser
} from "../config/demoUsers";

// --------------------------------------------------------------------------
// SIDEBAR COMPONENT - NO PROPS, URL-DRIVEN
// --------------------------------------------------------------------------
const Sidebar: React.FC = () => {
  // --------------------------------------------------------------------------
  // 1. NAVIGATION & URL STATE
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const { programId, stageId, unitId, conceptId } = useParams<{
    programId: string;
    stageId?: string;
    unitId?: string;
    conceptId?: string;
  }>();
  
  // --------------------------------------------------------------------------
  // 2. USER & COURSE DATA
  // --------------------------------------------------------------------------
  const { user } = useUserContext();
  const { programName, stages, isLoading } = useCourseStore();
  
  // --------------------------------------------------------------------------
  // 3. LOCAL STATE
  // --------------------------------------------------------------------------
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [localStages, setLocalStages] = useState<any[]>(stages);
  const [programType, setProgramType] = useState<string>('');
  
  const isMentor = user?.userType?.toLowerCase() === "mentor";
  const isDemoUser = user?.userId ? checkIsDemoUser(user.userId) : false;
  
  // --------------------------------------------------------------------------
  // 4. EFFECTS
  // --------------------------------------------------------------------------
  
  // Sync local stages when store updates
  useEffect(() => {
    if (stages && stages.length > 0) {
      setLocalStages(stages);
    }
  }, [stages]);
  
  // Get program type for demo logic
  useEffect(() => {
    if (programId) {
      const type = getProgramType(programId);
      setProgramType(type);
    }
  }, [programId]);
  
  // Auto-open stage containing current concept
  useEffect(() => {
    if (!conceptId || !localStages.length) return;
    
    const findStageForConcept = () => {
      for (const stage of localStages) {
        for (const unit of stage.units || []) {
          // Check unit match
          if (unit.unitId === conceptId) {
            return stage.stageId;
          }
          
          // Check subconcept match
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
  
  // Listen for completion updates
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
  // 5. HANDLERS - DIRECT NAVIGATION
  // --------------------------------------------------------------------------
  const toggleStage = (stageId: string) => {
    setOpenStages((prev) =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };
  
  // Demo user checks
  const isStageAccessibleForDemo = (stage: any): boolean => {
    if (!isDemoUser || !programId) return true;
    return programType === 'PET-2' ? isStageAllowedForDemo(stage.stageId) : true;
  };
  
  const isUnitAccessibleForDemo = (unitId: string): boolean => {
    if (!isDemoUser || !programId) return true;
    return programType === 'PET-1' ? isUnitAllowedForDemo(unitId) : true;
  };
  
  const isContentAccessibleForDemo = (stage: any, unit?: any): boolean => {
    if (!isDemoUser || !programId) return true;
    
    if (programType === 'PET-1') {
      return unit ? isUnitAccessibleForDemo(unit.unitId) : true;
    }
    
    if (programType === 'PET-2') {
      return isStageAccessibleForDemo(stage);
    }
    
    return true;
  };
  
  // Check if stage has accessible units (for PET-1 demo users)
  const doesStageHaveAccessibleUnits = (stage: any): boolean => {
    if (!isDemoUser || programType !== 'PET-1') return true;
    
    return stage.units.some(unit => isUnitAccessibleForDemo(unit.unitId));
  };
  
  // Handle subconcept click - DIRECT NAVIGATION
  const handleSubconceptClick = (
    sub: any, 
    unit: any, 
    stage: any, 
    isLocked: boolean
  ) => {
    if (isLocked) {
      if (isDemoUser) {
        alert(DEMO_USER_MESSAGE);
      }
      return;
    }
    
    const isLockedForDemo = isDemoUser && !isContentAccessibleForDemo(stage, unit);
    
    localStorage.setItem("lastViewedSubconcept", sub.subconceptId);
    
    // DIRECT NAVIGATION - NO CALLBACKS
    navigate(
      `/course/${programId}/stage/${stage.stageId}/unit/${unit.unitId}/concept/${sub.subconceptId}`
    );
  };
  
  // Handle unit click - DIRECT NAVIGATION
  const handleUnitClick = (unit: any, stage: any) => {
    if (!unit.unitLink) return;
    
    const isLockedForDemo = isDemoUser && !isContentAccessibleForDemo(stage, unit);
    
    if (isLockedForDemo) {
      alert(DEMO_USER_MESSAGE);
      return;
    }
    
    // DIRECT NAVIGATION
    navigate(
      `/course/${programId}/stage/${stage.stageId}/unit/${unit.unitId}/concept/${unit.unitId}`
    );
  };
  
  // --------------------------------------------------------------------------
  // 6. RENDER HELPERS
  // --------------------------------------------------------------------------
  const RoundCheckbox = ({ completed, active }: { completed: boolean; active: boolean }) => (
    <div className="relative flex-shrink-0 self-center">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${completed ? "bg-[#0EA5E9] border-[#0EA5E9]" : "border-gray-300 group-hover:border-[#7DD3FC]"}
          ${active ? "border-[#0EA5E9]" : ""}`}
      >
        {completed && <Check size={10} className="text-white stroke-[3]" />}
      </div>
      {completed && (
        <div className="absolute inset-0 rounded-full bg-[#0EA5E9] opacity-20 animate-pulse" />
      )}
    </div>
  );
  
  // Check if content is locked
  const isSubconceptLocked = (unit: any, subIndex: number, stage: any): boolean => {
    const sub = unit.subconcepts?.[subIndex];
    if (!sub) return true;

    // 1. DEMO USER LOGIC - Check first
    if (isDemoUser) {
      const isAccessible = isContentAccessibleForDemo(stage, unit);
      // If NOT accessible for demo user, LOCK it
      if (!isAccessible) {
        return true;
      }
      // If accessible for demo user, skip normal progression
      return false;
    }

    // 2. MENTOR LOGIC - Mentors see everything
    if (isMentor) return false;

    // 3. NORMAL LEARNER PROGRESSION LOGIC
    const global = buildGlobalList();
    if (!global.length) return false;

    const currentGlobalIndex = global.findIndex(
      (g) => g.subconceptId === sub.subconceptId
    );
    if (currentGlobalIndex === -1) return true;

    const currentType = (sub.subconceptType || "").toLowerCase();
    
    // Assignments: Lock until completed
    if(currentType.startsWith("assignment")) {
      return (sub.completionStatus || "").toLowerCase() !== "yes";
    }

    // Find last completed non-assignment
    let lastCompletedIndex = -1;
    for (let i = 0; i < global.length; i++) {
      const g = global[i];
      if (!g.type.startsWith("assignment") && g.completed) {
        lastCompletedIndex = i;
      }
    }

    if (lastCompletedIndex === -1) return currentGlobalIndex !== 0;
    if (global[currentGlobalIndex].completed) return false;

    // Skip assignments in progression
    let nextUnlockIndex = lastCompletedIndex + 1;
    while (
      nextUnlockIndex < global.length &&
      global[nextUnlockIndex].type.startsWith("assignment")
    ) {
      nextUnlockIndex++;
    }

    return currentGlobalIndex > nextUnlockIndex;
  };

  const buildGlobalList = () => {
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
  };

  // --------------------------------------------------------------------------
  // 7. MAIN RENDER
  // --------------------------------------------------------------------------
  
  // Loading state
  if (isLoading) {
    return (
      <aside className="bg-white text-black flex flex-col h-full">
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200">
          <span>Loading...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full" />
        </div>
      </aside>
    );
  }
  
  return (
    <aside className="bg-white text-black flex flex-col h-full">
      {/* Demo User Banner - Mobile Only (KEPT as requested) */}
      {isDemoUser && (
        <div className="md:hidden bg-yellow-50 border-b border-yellow-200 p-2 text-xs text-yellow-800 flex items-center gap-2">
          <Lock size={12} />
          <span className="flex-1">
            <strong>Demo Mode:</strong> Some content locked
          </span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full border-r border-gray-300 bg-white">
        <div className="h-16 w-full" />
        <div className={`px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200 flex items-center justify-between ${
          isDemoUser ? 'bg-yellow-50' : ''
        }`}>
            <div className="mr-4">
              <HomeExitIcon size={22} className="cursor-pointer"/>
            </div>
          <span>{programName || "Course"}</span>
          {isDemoUser && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
              DEMO
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto">
        <div className={`px-4 py-2 text-[#0EA5E9] font-semibold text-base border-b border-gray-200 flex items-center justify-between ${
          isDemoUser ? 'bg-yellow-50' : 'bg-white'
        }`}>
          <span className="truncate">{programName || "Course"}</span>
          {isDemoUser && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              DEMO
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>
    </aside>
  );
  
  // --------------------------------------------------------------------------
  // 8. SIDEBAR CONTENT COMPONENT
  // --------------------------------------------------------------------------
  function SidebarContent() {
    if (localStages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500 text-sm">No content available</p>
        </div>
      );
    }

    return (
      <div className="px-3 py-4 space-y-4">
        {localStages.map((stage: any, stageIndex: number) => {
          // Check if stage is accessible for demo users
          const isStageAccessible = isStageAccessibleForDemo(stage);
          
          // Check if stage has accessible units (for PET-1 demo users)
          const hasAccessibleUnits = doesStageHaveAccessibleUnits(stage);
          
          // Determine the stage label for demo users
          const getStageLabel = () => {
            if (!isDemoUser) return null;
            
            if (programType === 'PET-1') {
              return hasAccessibleUnits ? 'View' : 'No Access';
            }
            
            if (programType === 'PET-2') {
              return isStageAccessible ? 'View' : 'Not for Demo';
            }
            
            return 'View';
          };

          const stageLabel = getStageLabel();
          
          return (
            <div key={stage.stageId} className="border-b border-gray-200 pb-3">
              
              {/* Stage Header */}
              <button
                onClick={() => toggleStage(stage.stageId)}
                className="flex flex-col w-full text-left hover:text-gray-900 cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                  <span>{`Module ${stageIndex + 1}`}</span>
                  {isDemoUser && stageLabel && (
                    <span className={`text-xs ${
                      stageLabel === 'Locked' || stageLabel === 'No Access'
                        ? 'text-gray-500' 
                        : 'text-gray-700'
                    }`}>
                      {stageLabel}
                    </span>
                  )}
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    isDemoUser && programType === 'PET-2' && !isStageAccessible 
                      ? 'text-gray-500' 
                      : 'text-gray-800'
                  }`}>
                    {stage.stageName || `Stage ${stageIndex + 1}`}
                  </span>
                  {openStages.includes(stage.stageId) ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </button>

              {/* Units + Subconcepts */}
              {openStages.includes(stage.stageId) && (
                <div className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
                  
                  {stage.units.map((unit: any, unitIndex: number) => {
                    // Check if unit is accessible for demo users
                    const isUnitAccessible = isUnitAccessibleForDemo(unit.unitId);
                    const isContentAccessible = isContentAccessibleForDemo(stage, unit);
                    
                    return (
                      <div key={unit.unitId} className="flex flex-col">
                        
                        {/* Unit Row */}
                        <div
                          onClick={() => handleUnitClick(unit, stage)}
                          className={`flex items-center gap-3 p-2 rounded transition-colors ${
                            !unit.unitLink
                              ? 'opacity-70 cursor-not-allowed'
                              : conceptId === unit.unitId
                              ? "bg-[#E0F2FE] text-[#0EA5E9] cursor-pointer"
                              : isContentAccessible
                              ? "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700 cursor-pointer"
                              : "opacity-70 cursor-not-allowed"
                          }`}
                        >
                          {/* Lock icon for demo-locked units */}
                          {isDemoUser && !isUnitAccessible && (
                            <Lock size={14} className="text-gray-400 flex-shrink-0" />
                          )}
                          
                          <span className={`text-sm flex-1 pl-1 ${
                            isDemoUser && !isContentAccessible ? 'text-gray-500' : ''
                          }`}>
                            {unit.unitName || `Unit ${unitIndex + 1}`}
                          </span>
                        </div>

                        {/* Subconcept Rows */}
                        {unit.subconcepts?.map((sub: any, subIndex: number) => {
                          const subCompleted = (sub.completionStatus || "").toLowerCase() === "yes";
                          const type = (sub.subconceptType || "").toLowerCase();
                          const isVideo = type === "video";
                          const isLocked = isSubconceptLocked(unit, subIndex, stage);

                          return (
                            <div
                              key={sub.subconceptId}
                              onClick={() => handleSubconceptClick(sub, unit, stage, isLocked)}
                              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                                isLocked
                                  ? "cursor-not-allowed"
                                  : conceptId === sub.subconceptId
                                  ? "bg-[#E0F2FE] text-[#0EA5E9] cursor-pointer"
                                  : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700 cursor-pointer"
                              } ${
                                isDemoUser && !isContentAccessible ? 'opacity-70' : ''
                              }`}
                            >
                              <RoundCheckbox
                                completed={subCompleted}
                                active={conceptId === sub.subconceptId}
                              />

                              {isVideo ? (
                                <Video size={14} className={`${
                                  isLocked ? 'text-gray-400' : 'text-gray-600'
                                } group-hover:text-[#0EA5E9]`} />
                              ) : (
                                <FileText size={14} className={`${
                                  isLocked ? 'text-gray-400' : 'text-gray-600'
                                } group-hover:text-[#0EA5E9]`} />
                              )}

                              <span className={`text-sm flex-1 ${
                                isLocked ? 'text-gray-500' : ''
                              }`}>
                                {`${stageIndex + 1}.${(() => {
                                  let count = 1;
                                  for (let u of stage.units) {
                                    if (u.unitId === unit.unitId) break;
                                    count += u.subconcepts?.length || 0;
                                  }
                                  return count + subIndex;
                                })()} ${sub.subconceptDesc || sub.subconceptName || `Concept ${subIndex + 1}`}`}
                              </span>

                              {/* Lock icons - Show for both demo and regular users when locked */}
                              {isLocked && (
                                <Lock size={14} className={`flex-shrink-0 ${
                                  isDemoUser && !isContentAccessible 
                                    ? 'text-yellow-500' 
                                    : 'text-gray-500'
                                }`} />
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
  }
};

// CRITICAL: Memoize the Sidebar with custom comparison
export default React.memo(Sidebar, (prevProps, nextProps) => {
  // Since Sidebar has no props, it should never re-render
  // unless React forces it (which it shouldn't)
  return true; // Always return true to prevent re-renders
});