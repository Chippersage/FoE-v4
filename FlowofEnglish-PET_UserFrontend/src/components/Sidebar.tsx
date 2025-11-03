import { useState } from "react";
import { ChevronDown, ChevronUp, Video, FileText, Check } from "lucide-react";

interface SidebarProps {
  programName: string;
  onSelectSubconcept: (url: string, id: string, type: string) => void;
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

  const toggleStage = (stageId: string) => {
    setOpenStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  // Round checkbox for status indicator
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

  return (
    <aside className="bg-white text-black flex flex-col">
      {/* Desktop */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-72 border-r border-gray-300 z-20 bg-white">
        <div className="h-16 w-full" />
        {/* Dynamic Program Name */}
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-lg border-b border-gray-200 leading-snug break-words whitespace-normal">
          {programName}
        </div>


        {/* Legend */}
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

        {/* Stages */}
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
                  {openStages.includes(stage.stageId) ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
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
                          onSelectSubconcept(unit.unitLink, unit.unitId, "video")
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

                      {/* Subconcepts */}
                      {unit.subconcepts?.map((sub: any, subIndex: number) => {
                        const subCompleted = sub.completionStatus?.toLowerCase() === "yes";
                        const type = sub.subconceptType?.toLowerCase();

                        const isVideo = type === "video";

                        return (
                          <li
                            key={sub.subconceptId}
                            onClick={() =>
                              onSelectSubconcept(sub.subconceptLink, sub.subconceptId, sub.subconceptType)
                            }
                            className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group ${
                              currentActiveId === sub.subconceptId
                                ? "bg-[#E0F2FE] text-[#0EA5E9]"
                                : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"
                            }`}
                          >
                            <RoundCheckbox
                              completed={subCompleted}
                              active={currentActiveId === sub.subconceptId}
                            />

                            {/* Icon based on type */}
                            {isVideo ? (
                              <Video size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                            ) : (
                              <FileText size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                            )}

                            <span className="text-sm flex-1">
                              {`${unitIndex + 1}.${subIndex + 1} ${sub.subconceptDesc}`}
                            </span>
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

      {/* Mobile */}
      <div className="md:hidden flex flex-col w-full border-t border-gray-300 mt-4 bg-white">
        {/* Program Name on Mobile */}
        <div className="px-4 py-2 text-[#0EA5E9] font-semibold text-base border-b border-gray-200 truncate">
          {programName || "Program"}
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
                  {openStages.includes(stage.stageId) ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </button>

              {openStages.includes(stage.stageId) && (
                <ul className="mt-2 flex flex-col gap-1 text-sm text-gray-700">
                  {stage.units.map((unit: any, unitIndex: number) => (
                    <div key={unit.unitId} className="flex flex-col">
                      <li
                        onClick={() =>
                          unit.unitLink &&
                          onSelectSubconcept(unit.unitLink, unit.unitId, "video")
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

                      {unit.subconcepts?.map((sub: any, subIndex: number) => {
                        const subCompleted =
                          sub.completionStatus?.toLowerCase() === "yes";
                        return (
                          <li
                            key={sub.subconceptId}
                            onClick={() =>
                              onSelectSubconcept(
                                sub.subconceptLink,
                                sub.subconceptId,
                                sub.subconceptType
                              )
                            }
                            className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-colors group ${
                              currentActiveId === sub.subconceptId
                                ? "bg-[#E0F2FE] text-[#0EA5E9]"
                                : "hover:text-[#0EA5E9] hover:bg-[#E0F2FE] text-gray-700"
                            }`}
                          >
                            <RoundCheckbox
                              completed={subCompleted}
                              active={currentActiveId === sub.subconceptId}
                            />
                            <Video size={14} className="text-gray-600 group-hover:text-[#0EA5E9]" />
                            <span className="text-sm flex-1">
                              {`${unitIndex + 1}.${subIndex + 1} ${sub.subconceptDesc}`}
                            </span>
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
