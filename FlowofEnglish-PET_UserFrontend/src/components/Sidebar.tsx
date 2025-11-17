// @ts-nocheck
// Sidebar component: displays course modules, units, and subconcepts
// Handles locking/unlocking, completion indicators, and live updates via custom events

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Video, FileText, Check, Lock } from "lucide-react";
import { useUserContext } from "../context/AuthContext";

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
    completionStatus?: string
  ) => void;
  currentActiveId: string;
  stages: any[];
}

const Sidebar: React.FC<SidebarProps> = ({
  programName,
  onSelectSubconcept,
  currentActiveId,
  stages,
}) => {
  // --------------------------------------------------------------------------
  // Local state and user context
  // --------------------------------------------------------------------------
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [localStages, setLocalStages] = useState<any[]>(stages);
  const { user } = useUserContext();
  const isMentor = user?.userType?.toLowerCase() === "mentor";

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  // Sync local stages when parent updates
  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

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
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  const isSubconceptLocked = (unit: any, indexInUnit: number) => {
    if (isMentor) return false;

    const global = buildGlobalList();
    if (!global.length) return false;

    const sub = unit.subconcepts?.[indexInUnit];
    if (!sub) return true;

    const currentGlobalIndex = global.findIndex(
      (g) => g.subconceptId === sub.subconceptId
    );
    if (currentGlobalIndex === -1) return true;

    const currentType = (sub.subconceptType || "").toLowerCase();
    const isAssignment = currentType.startsWith("assignment");
    if (isAssignment) return false;

    let lastCompletedIndex = -1;
    for (let i = 0; i < global.length; i++) {
      const g = global[i];
      if (!g.type.startsWith("assignment") && g.completed) {
        lastCompletedIndex = i;
      }
    }

    if (lastCompletedIndex === -1) return currentGlobalIndex !== 0;
    if (global[currentGlobalIndex].completed) return false;

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
    const list: {
      stageId: string;
      unitId: string;
      subconceptId: string;
      type: string;
      completed: boolean;
    }[] = [];

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
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-72 border-r border-gray-300 z-20 bg-white">
        <div className="h-16 w-full" />
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200">
          {programName}
        </div>
        <SidebarList />
      </div>

      {/* Mobile Sidebar */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto border-t border-gray-200">
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-base sticky top-0 bg-white z-10 border-b border-gray-200">
          {programName}
        </div>
        <SidebarList />
      </div>
    </aside>
  );

  // --------------------------------------------------------------------------
  // Nested Component: SidebarList
  // --------------------------------------------------------------------------

  function SidebarList() {
    return (
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {localStages.map((stage, stageIndex) => (
          <li key={stage.stageId} className="list-none border-b border-gray-200 pb-3">
            
            {/* Stage Header */}
            <button
              onClick={() => toggleStage(stage.stageId)}
              className="flex flex-col w-full text-left text-gray-800 hover:text-gray-900 cursor-pointer"
            >
              <span className="text-xs font-semibold text-gray-500 mb-1">
                {`Module ${stageIndex + 1}`}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{stage.stageName}</span>
                {openStages.includes(stage.stageId) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {/* Units + Subconcepts */}
            {openStages.includes(stage.stageId) && (
              <ul className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
                
                {stage.units.map((unit: any, unitIndex: number) => (
                  <div key={unit.unitId} className="flex flex-col">
                    
                    {/* Unit Row */}
                    <li
                      onClick={() =>
                        unit.unitLink &&
                        onSelectSubconcept(
                          unit.unitLink,
                          "video",
                          unit.unitId,
                          stage.stageId,
                          unit.unitId,
                          unit.unitId,
                          Number(unit.subconceptMaxscore || 0),
                          unit.completionStatus
                        )
                      }
                      className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group ${
                        currentActiveId === unit.unitId
                          ? "bg-[#E0F2FE] text-[#0EA5E9]"
                          : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"
                      } ${!unit.unitLink ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <RoundCheckbox
                        completed={unit.completionStatus?.toLowerCase() === "yes"}
                        active={currentActiveId === unit.unitId}
                      />
                      <FileText size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                      <span className="text-sm flex-1">{unit.unitName}</span>
                    </li>

                    {/* Subconcept Rows */}
                    {unit.subconcepts?.map((sub: any, subIndex: number) => {
                      const subCompleted = (sub.completionStatus || "").toLowerCase() === "yes";
                      const type = (sub.subconceptType || "").toLowerCase();
                      const isVideo = type === "video";
                      const isLocked = isSubconceptLocked(unit, subIndex);

                      return (
                        <li
                          key={sub.subconceptId}
                          onClick={() => {
                            if (isLocked) return;
                            localStorage.setItem("lastViewedSubconcept", sub.subconceptId);
                            onSelectSubconcept(
                              sub.subconceptLink,
                              sub.subconceptType,
                              sub.subconceptId,
                              stage.stageId,
                              unit.unitId,
                              sub.subconceptId,
                              Number(sub.subconceptMaxscore || 0),
                              sub.completionStatus
                            );
                          }}
                          className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group ${
                            currentActiveId === sub.subconceptId
                              ? "bg-[#E0F2FE] text-[#0EA5E9]"
                              : isLocked
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"
                          }`}
                        >
                          <RoundCheckbox
                            completed={subCompleted}
                            active={currentActiveId === sub.subconceptId}
                          />

                          {isVideo ? (
                            <Video size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                          ) : (
                            <FileText size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                          )}

                          <span className="text-sm flex-1">
                            {`${unitIndex + 1}.${subIndex + 1} ${sub.subconceptDesc}`}
                          </span>

                          {!isMentor && isLocked && (
                            <Lock size={14} className="text-gray-500" />
                          )}
                        </li>
                      );
                    })}

                  </div>
                ))}
              </ul>
            )}
          </li>
        ))}
      </div>
    );
  }
};

export default Sidebar;
