// @ts-nocheck
import { useState } from "react";
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
    subconceptId?: string
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
  const [openStages, setOpenStages] = useState<string[]>([]);
  const { user } = useUserContext();
  const isMentor = user?.userType === "mentor";

  const toggleStage = (stageId: string) => {
    setOpenStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  const RoundCheckbox = ({
    completed,
    active,
  }: {
    completed: boolean;
    active: boolean;
  }) => (
    <div className="relative flex-shrink-0 self-center">
      <div
        className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${
            completed
              ? "bg-[#0EA5E9] border-[#0EA5E9]"
              : "border-gray-300 group-hover:border-[#7DD3FC]"
          }
          ${active ? "border-[#0EA5E9]" : ""}
        `}
      >
        {completed && <Check size={10} className="text-white stroke-[3]" />}
      </div>
      {completed && (
        <div className="absolute inset-0 rounded-full bg-[#0EA5E9] opacity-20 animate-pulse" />
      )}
    </div>
  );

  // Build a flattened list of subconcepts in reading order
  const buildGlobalList = () => {
    const list: {
      stageId: string;
      unitId: string;
      subconceptId: string;
      type: string;
      completed: boolean;
    }[] = [];

    stages?.forEach((stage: any) => {
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

  // Determines whether a subconcept should be locked
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

    // Assignments are always unlocked
    if (isAssignment) return false;

    // Find last completed non-assignment subconcept globally
    let lastCompletedIndex = -1;
    for (let i = 0; i < global.length; i++) {
      const g = global[i];
      if (!g.type.startsWith("assignment") && g.completed) {
        lastCompletedIndex = i;
      }
    }

    // If nothing completed yet, unlock only the first subconcept (start point)
    if (lastCompletedIndex === -1) return currentGlobalIndex !== 0;

    // If current is already completed, it’s unlocked
    if (global[currentGlobalIndex].completed) return false;

    // Find the first non-assignment subconcept after all consecutive assignments
    let nextUnlockIndex = lastCompletedIndex + 1;
    while (
      nextUnlockIndex < global.length &&
      global[nextUnlockIndex].type.startsWith("assignment")
    ) {
      nextUnlockIndex++;
    }

    // Unlock if within range (<= nextUnlockIndex)
    return currentGlobalIndex > nextUnlockIndex;
  };

  return (
    <aside className="bg-white text-black flex flex-col">
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-72 border-r border-gray-300 z-20 bg-white">
        <div className="h-16 w-full" />
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200">
          {programName}
        </div>

        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
              <span>Not started</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-[#0EA5E9] bg-[#0EA5E9] flex items-center justify-center">
                <Check size={8} className="text-white stroke-[3]" />
              </div>
              <span>Completed</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {stages.map((stage, stageIndex) => (
            <li key={stage.stageId} className="list-none border-b border-gray-200 pb-3">
              <button
                onClick={() => toggleStage(stage.stageId)}
                className="flex flex-col w-full text-left text-gray-800 hover:text-gray-900 cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-500 mb-1">
                  {`Module ${stageIndex + 1}`}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stageName}</span>
                  {openStages.includes(stage.stageId) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {openStages.includes(stage.stageId) && (
                <ul className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
                  {stage.units.map((unit: any, unitIndex: number) => (
                    <div key={unit.unitId} className="flex flex-col">
                      {/* Unit */}
                      <li
                        onClick={() =>
                          unit.unitLink &&
                          onSelectSubconcept(unit.unitLink, "video", unit.unitId, stage.stageId, unit.unitId, unit.unitId)
                        }
                        className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group ${
                          currentActiveId === unit.unitId
                            ? "bg-[#E0F2FE] text-[#0EA5E9]"
                            : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"
                        } ${!unit.unitLink ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <RoundCheckbox completed={unit.completionStatus?.toLowerCase() === "yes"} active={currentActiveId === unit.unitId} />
                        <FileText size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                        <span className="text-sm flex-1">{unit.unitName}</span>
                      </li>

                      {/* Subconcepts */}
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
                              onSelectSubconcept(sub.subconceptLink, sub.subconceptType, sub.subconceptId, stage.stageId, unit.unitId, sub.subconceptId);
                            }}
                            className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group ${
                              currentActiveId === sub.subconceptId
                                ? "bg-[#E0F2FE] text-[#0EA5E9]"
                                : isLocked
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"
                            }`}
                          >
                            <RoundCheckbox completed={subCompleted} active={currentActiveId === sub.subconceptId} />
                            {isVideo ? <Video size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" /> : <FileText size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />}
                            <span className="text-sm flex-1">{`${unitIndex + 1}.${subIndex + 1} ${sub.subconceptDesc}`}</span>
                            {!isMentor && isLocked && <Lock size={14} className="text-gray-500" />}
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
      </div>
    </aside>
  );
};

export default Sidebar;
