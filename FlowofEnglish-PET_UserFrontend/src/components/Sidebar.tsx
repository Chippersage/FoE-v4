// @ts-nocheck
// Sidebar component: optimized to prevent re-renders, preserve full logic,
// fix locking issues, fix local stages sync, fix memo comparison, fix auto-open logic

import { useState, useEffect, useRef, useMemo, memo } from "react";
import { ChevronDown, ChevronUp, Video, FileText, Check, Lock } from "lucide-react";
import { useUserContext } from "../context/AuthContext";
import HomeExitIcon from "./icons/HomeExitIcon";

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

  // -----------------------------------------------------------
  // Render Debug Counter (Safe)
  // -----------------------------------------------------------
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log(`🟣 Sidebar Render #${renderCount.current}`);

  // -----------------------------------------------------------
  // User Context
  // -----------------------------------------------------------
  const { user } = useUserContext();
  const isMentor = user?.userType?.toLowerCase() === "mentor";

  // -----------------------------------------------------------
  // Local States (stable initialization)
  // -----------------------------------------------------------

  // Open modules
  const [openStages, setOpenStages] = useState<string[]>([]);

  // Local copy of stages (only updates when structure changes)
  const [localStages, setLocalStages] = useState(() => stages);

  // -----------------------------------------------------------
  // Sync localStages only when LENGTH changes (safe)
  // -----------------------------------------------------------
  useEffect(() => {
    if (stages.length !== localStages.length) {
      console.log("🟣 Sidebar: Updating localStages due to length change");
      setLocalStages(stages);
    }
  }, [stages, localStages.length]);

  // -----------------------------------------------------------
  // Auto-open stage that contains the currently active subconcept
  // -----------------------------------------------------------
  useEffect(() => {
    if (!currentActiveId || localStages.length === 0) return;

    let foundStageId = null;

    for (const stage of localStages) {
      for (const unit of stage.units || []) {
        // If active is unit
        if (unit.unitId === currentActiveId) {
          foundStageId = stage.stageId;
          break;
        }
        // If active is subconcept
        if ((unit.subconcepts || []).some(sub => sub.subconceptId === currentActiveId)) {
          foundStageId = stage.stageId;
          break;
        }
      }
      if (foundStageId) break;
    }

    if (foundStageId && !openStages.includes(foundStageId)) {
      console.log("🟣 Sidebar: Auto-opening stage", foundStageId);
      setOpenStages(prev => [...prev, foundStageId]);
    }
  }, [currentActiveId, localStages]);

  // -----------------------------------------------------------
  // Video completion → update subconcept completion in sidebar
  // -----------------------------------------------------------
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { subconceptId } = e.detail;
      if (!subconceptId) return;

      console.log("🟣 Sidebar: Received completion update", subconceptId);

      setLocalStages(prev =>
        prev.map(stage => ({
          ...stage,
          units: stage.units.map(unit => ({
            ...unit,
            subconcepts: unit.subconcepts.map(sub =>
              sub.subconceptId === subconceptId
                ? { ...sub, completionStatus: "yes" }
                : sub
            ),
          })),
        }))
      );
    };

    window.addEventListener("updateSidebarCompletion", handler as EventListener);
    return () => window.removeEventListener("updateSidebarCompletion", handler as EventListener);
  }, []);

  // -----------------------------------------------------------
  // Build a single flattened subconcept list (memoized)
  // -----------------------------------------------------------
  const globalList = useMemo(() => {
    const list: any[] = [];

    localStages.forEach(stage =>
      (stage.units || []).forEach(unit =>
        (unit.subconcepts || []).forEach(sub =>
          list.push({
            stageId: stage.stageId,
            unitId: unit.unitId,
            subconceptId: sub.subconceptId,
            type: (sub.subconceptType || "").toLowerCase(),
            completed: (sub.completionStatus || "").toLowerCase() === "yes",
          })
        )
      )
    );

    return list;
  }, [localStages]);

  // -----------------------------------------------------------
  // Lock Logic
  // -----------------------------------------------------------
  const isSubconceptLocked = (unit: any, subIndex: number) => {
    if (isMentor) return false;

    const sub = unit.subconcepts[subIndex];
    if (!sub) return true;

    const idx = globalList.findIndex(g => g.subconceptId === sub.subconceptId);
    if (idx === -1) return true;

    // Assignments must be completed
    if (sub.subconceptType?.toLowerCase().startsWith("assignment")) {
      return (sub.completionStatus || "").toLowerCase() !== "yes";
    }

    // Find last completed non-assignment
    let lastCompletedIndex = -1;
    globalList.forEach((g, i) => {
      if (!g.type.startsWith("assignment") && g.completed) lastCompletedIndex = i;
    });

    if (lastCompletedIndex === -1) return idx !== 0; // Only first open

    // If current item is already completed → unlocked
    if (globalList[idx].completed) return false;

    // Next item after last completed is unlocked
    const nextAllowedIndex = lastCompletedIndex + 1;

    return idx > nextAllowedIndex;
  };

  // -----------------------------------------------------------
  // Toggle Stage Expand/Collapse
  // -----------------------------------------------------------
  const toggleStage = (stageId: string) => {
    setOpenStages(prev =>
      prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
    );
  };

  // -----------------------------------------------------------
  // Round Checkbox Component (Completion)
  // -----------------------------------------------------------
  const RoundCheckbox = ({ completed, active }: { completed: boolean; active: boolean }) => (
    <div className="relative flex-shrink-0 self-center">
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${completed ? "bg-[#0EA5E9] border-[#0EA5E9]" : "border-gray-300"}
          ${active ? "border-[#0EA5E9]" : ""}`}
      >
        {completed && <Check size={10} className="text-white stroke-[3]" />}
      </div>
      {completed && (
        <div className="absolute inset-0 rounded-full bg-[#0EA5E9] opacity-20 animate-pulse" />
      )}
    </div>
  );
  // -----------------------------------------------------------
  // SidebarList Component (renders stages, units, subconcepts)
  // -----------------------------------------------------------

  function SidebarList() {
    const sidebarListRenderCount = useRef(0);
    sidebarListRenderCount.current += 1;

    console.log(`🟣 SidebarList Render #${sidebarListRenderCount.current}`);

    return (
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">

        {localStages.map((stage, stageIndex) => {
          const isOpen = openStages.includes(stage.stageId);

          return (
            <li key={stage.stageId} className="list-none border-b border-gray-200 pb-3">

              {/* ---------------------- */}
              {/* Stage Header (Module) */}
              {/* ---------------------- */}
              <button
                onClick={() => toggleStage(stage.stageId)}
                className="flex flex-col w-full text-left text-gray-800 hover:text-gray-900 cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-500 mb-1">
                  {`Module ${stageIndex + 1}`}
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stageName}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* ---------------------- */}
              {/* Units + Subconcepts */}
              {/* ---------------------- */}
              {isOpen && (
                <ul className="mt-2 flex flex-col gap-1 text-sm text-gray-700">

                  {stage.units.map((unit: any, unitIndex: number) => {
                    return (
                      <div key={unit.unitId} className="flex flex-col">

                        {/* -------------------------------- */}
                        {/* Unit Row (acts like a subconcept) */}
                        {/* -------------------------------- */}
                        <li
                          onClick={() => {
                            if (!unit.unitLink) return;

                            onSelectSubconcept(
                              unit.unitLink,
                              "video",
                              unit.unitId,
                              stage.stageId,
                              unit.unitId,
                              unit.unitId,
                              Number(unit.subconceptMaxscore || 0),
                              unit.completionStatus
                            );
                          }}
                          className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group
                            ${currentActiveId === unit.unitId
                              ? "bg-[#E0F2FE] text-[#0EA5E9]"
                              : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"}
                            ${!unit.unitLink ? "opacity-50 cursor-not-allowed" : ""}
                          `}
                        >
                          <span className="text-sm flex-1 pl-1">{unit.unitName}</span>
                        </li>

                        {/* ------------------------ */}
                        {/* Subconcept Rows (Numbered) */}
                        {/* ------------------------ */}
                        {unit.subconcepts?.map((sub: any, subIndex: number) => {
                          const subCompleted = (sub.completionStatus || "").toLowerCase() === "yes";
                          const type = (sub.subconceptType || "").toLowerCase();
                          const isVideo = type === "video";

                          const locked = isSubconceptLocked(unit, subIndex);
                          const isActive = currentActiveId === sub.subconceptId;

                          // numbering: {module}.{index}
                          const baseCount = stage.units.slice(0, unitIndex)
                            .reduce((acc, u) => acc + (u.subconcepts?.length || 0), 0);

                          const subNumber = `${stageIndex + 1}.${baseCount + subIndex + 1}`;

                          return (
                            <li
                              key={sub.subconceptId}
                              onClick={() => {
                                if (locked) return;

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
                              className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group
                                ${isActive
                                  ? "bg-[#E0F2FE] text-[#0EA5E9]"
                                  : locked
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"}
                              `}
                            >
                              {/* Completion Bubble */}
                              <RoundCheckbox completed={subCompleted} active={isActive} />

                              {/* Icon */}
                              {isVideo ? (
                                <Video size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                              ) : (
                                <FileText size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                              )}

                              {/* Subconcept Name */}
                              <span className="text-sm flex-1">
                                {`${subNumber} ${sub.subconceptDesc}`}
                              </span>

                              {/* Lock icon */}
                              {!isMentor && locked && <Lock size={14} className="text-gray-500" />}
                            </li>
                          );
                        })}

                      </div>
                    );
                  })}

                </ul>
              )}

            </li>
          );
        })}

      </div>
    );
  }
  // -----------------------------------------------------------
  // FINAL SIDEBAR RENDER (Desktop + Mobile)
  // -----------------------------------------------------------

  console.log("🟣 Sidebar: Final render stage");

  return (
    <aside className="bg-white text-black flex flex-col h-full">

      {/* ▓▓ Desktop Sidebar ▓▓ */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-72 border-r border-gray-300 z-20 bg-white">
        
        {/* Spacer to align with top nav */}
        <div className="h-16 w-full" />

        {/* Header */}
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200 flex items-center justify-between">
          <div className="mr-4">
            <HomeExitIcon size={22} className="cursor-pointer" />
          </div>
          <span>{programName}</span>
        </div>

        {/* Sidebar Content */}
        <SidebarList />
      </div>

      {/* ▓▓ Mobile Sidebar ▓▓ */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto border-t border-gray-200">

        {/* Header */}
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-base sticky top-0 bg-white z-10 border-b border-gray-200">
          {programName}
        </div>

        {/* Sidebar Content */}
        <SidebarList />
      </div>

    </aside>
  );
};

// -----------------------------------------------------------
// MEMO EXPORT — Prevents unnecessary re-renders
// -----------------------------------------------------------

export default memo(
  Sidebar,
  (prev, next) => {
    const sameProgram = prev.programName === next.programName;
    const sameActive = prev.currentActiveId === next.currentActiveId;
    const sameStagesLength = prev.stages?.length === next.stages?.length;

    const skipRender = sameProgram && sameActive && sameStagesLength;

    console.log("🟣 Sidebar memo comparison", {
      skipRender,
      programNameChanged: !sameProgram,
      activeChanged: !sameActive,
      stagesLengthChanged: !sameStagesLength,
    });

    return skipRender; // true = skip render
  }
);
