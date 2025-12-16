// @ts-nocheck
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getSidebarStages } from "./sidebarController";

const SidebarShell = () => {
  const [stages, setStages] = useState<any[]>([]);
  const [openStages, setOpenStages] = useState<string[]>([]);

  // Read sidebar data ONCE after mount
  useEffect(() => {
    const data = getSidebarStages();
    if (data?.length) {
      setStages(data);
    }
  }, []);

  const toggleStage = (stageId: string) => {
    setOpenStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-300 z-30 flex flex-col">

      {/* Spacer for Navbar */}
      <div className="h-16" />

      {/* Header */}
      <div className="px-4 py-2 font-semibold text-[#0EA5E9] border-b">
        Course Content
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {stages.map((stage, stageIndex) => {
          const isOpen = openStages.includes(stage.stageId);

          return (
            <div key={stage.stageId}>
              <button
                onClick={() => toggleStage(stage.stageId)}
                className="w-full flex justify-between items-center text-left text-sm font-medium py-2"
              >
                <span>{`Module ${stageIndex + 1}: ${stage.stageName}`}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isOpen && (
                <div className="ml-3 mt-2 space-y-1">
                  {stage.units.map((unit) =>
                    unit.subconcepts.map((sub) => (
                      <div
                        key={sub.subconceptId}
                        id={`sub-${sub.subconceptId}`}
                        className="p-2 rounded cursor-pointer hover:bg-[#E0F2FE]"
                      >
                        {sub.subconceptDesc}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarShell;
