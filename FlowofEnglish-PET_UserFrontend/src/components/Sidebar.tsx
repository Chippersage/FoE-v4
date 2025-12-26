// @ts-nocheck
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Video, FileText, Check, Lock } from "lucide-react";
import { useUserContext } from "../context/AuthContext";
import HomeExitIcon from "./icons/HomeExitIcon";
import { DEMO_USER_MESSAGE } from "../config/demoUsers";

// Import demo user functions
import { 
  isUnitAllowedForDemo,
  isStageAllowedForDemo 
} from "../config/demoUsers";

interface SidebarProps {
  programName: string;
  onSelectSubconcept: (
    url: string,
    type: string,
    id: string,
    stageId?: string,
    unitId?: string,
    subconceptId?: string,
    subconceptMaxscore?: number,
    completionStatus?: string,
    isLockedForDemo?: boolean
  ) => void;
  currentActiveId: string;
  stages: any[];
  isDemoUser?: boolean;
  programId?: string;
  programType?: string;
}

interface Stage {
  stageId: string;
  stageName: string;
  units: Unit[];
}

interface Unit {
  unitId: string;
  unitName: string;
  unitLink?: string;
  subconcepts: Subconcept[];
  completionStatus?: string;
}

interface Subconcept {
  subconceptId: string;
  subconceptName?: string;
  subconceptDesc?: string;
  subconceptLink: string;
  subconceptType: string;
  subconceptMaxscore?: string | number;
  completionStatus: string;
  stageId?: string;
  unitId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  programName,
  onSelectSubconcept,
  currentActiveId,
  stages,
  isDemoUser: isDemoUserProp = false,
  programId = "",
  programType = ""
}) => {
  // --------------------------------------------------------------------------
  // Local state and user context
  // --------------------------------------------------------------------------
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [localStages, setLocalStages] = useState<Stage[]>(stages);
  const { user } = useUserContext();
  const isMentor = user?.userType?.toLowerCase() === "mentor";
  
  // Determine if current user is demo user
  const currentIsDemoUser = isDemoUserProp;

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  // Sync local stages when parent updates
  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  // Auto-open ONLY the stage that contains the currently active subconcept
  // FIXED: Don't auto-open all stages, only the active one
  useEffect(() => {
    if (!currentActiveId || !localStages.length) return;

    const findStageForActiveSubconcept = () => {
      for (const stage of localStages) {
        for (const unit of stage.units || []) {
          // Check if currentActiveId matches a unit ID
          if (unit.unitId === currentActiveId) {
            return stage.stageId;
          }
          
          // Check if currentActiveId matches a subconcept ID
          const hasSubconcept = (unit.subconcepts || []).some(
            (sub: Subconcept) => sub.subconceptId === currentActiveId
          );
          
          if (hasSubconcept) {
            return stage.stageId;
          }
        }
      }
      return null;
    };

    const activeStageId = findStageForActiveSubconcept();
    
    if (activeStageId && !openStages.includes(activeStageId)) {
      // Only open the active stage, close others
      setOpenStages([activeStageId]);
    }
  }, [currentActiveId, localStages]);

  // Listen for video completion event to mark subconcept as completed
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
    return () =>
      window.removeEventListener("updateSidebarCompletion", handleCompletionUpdate as EventListener);
  }, []);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  const toggleStage = (stageId: string) => {
    setOpenStages((prev) =>
      prev.includes(stageId)
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  // Check if stage is accessible for demo users (for PET-2)
  const isStageAccessibleForDemo = (stage: Stage): boolean => {
    if (!currentIsDemoUser || !programId) return true;
    
    if (programType === 'PET-2') {
      return isStageAllowedForDemo(stage.stageId);
    }
    
    // For PET-1, stages are always viewable
    return true;
  };

  // Check if unit is accessible for demo users
  const isUnitAccessibleForDemo = (unitId: string): boolean => {
    if (!currentIsDemoUser || !programId) return true;
    
    if (programType === 'PET-1') {
      return isUnitAllowedForDemo(unitId);
    }
    
    // For PET-2, unit accessibility depends on stage
    return true;
  };

  // Check if specific content is accessible
  const isContentAccessibleForDemo = (stage: Stage, unit?: Unit): boolean => {
    if (!currentIsDemoUser || !programId) return true;
    
    if (programType === 'PET-1') {
      // PET-1: Check unit accessibility
      return unit ? isUnitAccessibleForDemo(unit.unitId) : true;
    }
    
    if (programType === 'PET-2') {
      // PET-2: Check stage accessibility
      return isStageAccessibleForDemo(stage);
    }
    
    return true;
  };

  // Check if stage has any accessible units (for PET-1 demo users)
  const doesStageHaveAccessibleUnits = (stage: Stage): boolean => {
    if (!currentIsDemoUser || programType !== 'PET-1') return true;
    
    return stage.units.some(unit => isUnitAccessibleForDemo(unit.unitId));
  };

  // MODIFIED: Check if subconcept is locked
  const isSubconceptLocked = (unit: Unit, indexInUnit: number, stage: Stage): boolean => {
    const sub = unit.subconcepts?.[indexInUnit];
    if (!sub) return true;

    // 1. DEMO USER LOGIC - Check first
    if (currentIsDemoUser) {
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

    localStages?.forEach((stage: Stage) => {
      stage.units?.forEach((unit: Unit) => {
        unit.subconcepts?.forEach((sub: Subconcept) => {
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

  // Handle click with demo user restrictions
  const handleSubconceptClick = (sub: Subconcept, unit: Unit, stage: Stage, isLocked: boolean) => {
    if (isLocked) {
      if (currentIsDemoUser) {
        alert(DEMO_USER_MESSAGE);
      }
      return;
    }
    
    // Calculate if this is locked for demo
    const isLockedForDemo = currentIsDemoUser && !isContentAccessibleForDemo(stage, unit);
    
    localStorage.setItem("lastViewedSubconcept", sub.subconceptId);
    onSelectSubconcept(
      sub.subconceptLink,
      sub.subconceptType,
      sub.subconceptId,
      stage.stageId,
      unit.unitId,
      sub.subconceptId,
      Number(sub.subconceptMaxscore || 0),
      sub.completionStatus,
      isLockedForDemo
    );
  };

  const handleUnitClick = (unit: Unit, stage: Stage) => {
    if (!unit.unitLink) return;
    
    const isLockedForDemo = currentIsDemoUser && !isContentAccessibleForDemo(stage, unit);
    
    if (isLockedForDemo) {
      alert(DEMO_USER_MESSAGE);
      return;
    }
    
    onSelectSubconcept(
      unit.unitLink,
      "video",
      unit.unitId,
      stage.stageId,
      unit.unitId,
      unit.unitId,
      Number(unit.subconcepts?.[0]?.subconceptMaxscore || 0),
      unit.completionStatus,
      isLockedForDemo
    );
  };

  // --------------------------------------------------------------------------
  // Render helpers
  // --------------------------------------------------------------------------

  const RoundCheckbox = ({
    completed,
    active,
  }: {
    completed: boolean;
    active: boolean;
  }) => (
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

  // --------------------------------------------------------------------------
  // Render Sidebar
  // --------------------------------------------------------------------------

  return (
    <aside className="bg-white text-black flex flex-col h-full">
      {/* Demo User Banner - Mobile Only (KEPT as requested) */}
      {currentIsDemoUser && (
        <div className="md:hidden bg-yellow-50 border-b border-yellow-200 p-2 text-xs text-yellow-800 flex items-center gap-2">
          <Lock size={12} />
          <span className="flex-1">
            <strong>Demo Mode:</strong> Some content locked
          </span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-72 border-r border-gray-300 z-20 bg-white">
        <div className="h-16 w-full" />
        <div className={`px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200 flex items-center justify-between ${
          currentIsDemoUser ? 'bg-yellow-50' : ''
        }`}>
            <div className="mr-4">
              <HomeExitIcon size={22} className="cursor-pointer"/>
            </div>
          <span>{programName}</span>
          {currentIsDemoUser && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
              DEMO
            </span>
          )}
        </div>
        <SidebarList />
      </div>

      {/* Mobile Sidebar */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto">
        <div className={`px-4 py-2 text-[#0EA5E9] font-semibold text-base border-b border-gray-200 flex items-center justify-between ${
          currentIsDemoUser ? 'bg-yellow-50' : 'bg-white'
        }`}>
          <span className="truncate">{programName}</span>
          {currentIsDemoUser && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              DEMO
            </span>
          )}
        </div>
        <SidebarList />
      </div>
    </aside>
  );

  // --------------------------------------------------------------------------
  // Nested Component: SidebarList
  // --------------------------------------------------------------------------

  function SidebarList() {
    if (localStages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-gray-500 text-sm">No content available</p>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {localStages.map((stage: Stage, stageIndex: number) => {
          // Check if stage is accessible for demo users
          const isStageAccessible = isStageAccessibleForDemo(stage);
          
          // Check if stage has accessible units (for PET-1 demo users)
          const hasAccessibleUnits = doesStageHaveAccessibleUnits(stage);
          
          // Determine the stage label for demo users
          const getStageLabel = () => {
            if (!currentIsDemoUser) return null;
            
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
                  {currentIsDemoUser && stageLabel && (
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
                    currentIsDemoUser && programType === 'PET-2' && !isStageAccessible 
                      ? 'text-gray-500' 
                      : 'text-gray-800'
                  }`}>
                    {stage.stageName}
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
                  
                  {stage.units.map((unit: Unit, unitIndex: number) => {
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
                              : currentActiveId === unit.unitId
                              ? "bg-[#E0F2FE] text-[#0EA5E9] cursor-pointer"
                              : isContentAccessible
                              ? "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700 cursor-pointer"
                              : "opacity-70 cursor-not-allowed"
                          }`}
                        >
                          {/* Lock icon for demo-locked units */}
                          {currentIsDemoUser && !isUnitAccessible && (
                            <Lock size={14} className="text-gray-400 flex-shrink-0" />
                          )}
                          
                          <span className={`text-sm flex-1 pl-1 ${
                            currentIsDemoUser && !isContentAccessible ? 'text-gray-500' : ''
                          }`}>
                            {unit.unitName}
                          </span>
                        </div>

                        {/* Subconcept Rows */}
                        {unit.subconcepts?.map((sub: Subconcept, subIndex: number) => {
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
                                  : currentActiveId === sub.subconceptId
                                  ? "bg-[#E0F2FE] text-[#0EA5E9] cursor-pointer"
                                  : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700 cursor-pointer"
                              } ${
                                currentIsDemoUser && !isContentAccessible ? 'opacity-70' : ''
                              }`}
                            >
                              <RoundCheckbox
                                completed={subCompleted}
                                active={currentActiveId === sub.subconceptId}
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
                                })()} ${sub.subconceptDesc || sub.subconceptName || ''}`}
                              </span>

                              {/* Lock icons - Show for both demo and regular users when locked */}
                              {isLocked && (
                                <Lock size={14} className={`flex-shrink-0 ${
                                  currentIsDemoUser && !isContentAccessible 
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

export default Sidebar;