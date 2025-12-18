import { useState } from "react";
import StageCollapsible from "./StageCollapsible";

interface ProgramData {
  stages?: Array<{
    stageName: string;
    units?: any[];
    completedUnits?: number;
  }>;
}

interface DetailedAttemptHistoryProps {
  programData?: ProgramData;
}

export default function DetailedAttemptHistory({ programData }: DetailedAttemptHistoryProps) {
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({});
  
  const toggleStage = (stageName: string) => {
    setOpenStages(prev => ({
      ...prev,
      [stageName]: !prev[stageName]
    }));
  };

  if (!programData?.stages) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow">
        No program data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {programData.stages.map((stage, index) => (
        <StageCollapsible
          key={index}
          stage={stage}
          isOpen={openStages[stage.stageName] || false}
          onToggle={() => toggleStage(stage.stageName)}
        />
      ))}
    </div>
  );
}