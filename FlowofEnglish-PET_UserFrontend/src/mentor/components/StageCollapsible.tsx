import { ChevronDown, ChevronRight } from "lucide-react";
import UnitCollapsible from "./UnitCollapsible";

interface Stage {
  stageName: string;
  units?: any[];
  completedUnits?: number;
}

interface StageCollapsibleProps {
  stage: Stage;
  isOpen: boolean;
  onToggle: () => void;
}

export default function StageCollapsible({ stage, isOpen, onToggle }: StageCollapsibleProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-2 md:mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 md:p-3 hover:bg-gray-50 transition-colors duration-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        <div className="flex items-center gap-2 md:gap-2 flex-1 min-w-0">
          {isOpen ? (
            <ChevronDown size={16} className="flex-shrink-0 text-gray-600" />
          ) : (
            <ChevronRight size={16} className="flex-shrink-0 text-gray-600" />
          )}
          <div className="text-left flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 text-sm md:text-sm truncate">
              {stage.stageName}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {stage.units?.length || 0} unit{stage.units?.length !== 1 ? 's' : ''} • {stage.completedUnits || 0} completed
            </p>
          </div>
        </div>
        {/* Removed expanded/collapsed badge */}
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-200 p-1.5 sm:p-2 md:p-3 bg-gray-50/30">
          {stage.units?.map((unit, unitIndex) => (
            <div key={unitIndex} className="mb-1.5 last:mb-0">
              <UnitCollapsible unit={unit} />
            </div>
          ))}
          {(!stage.units || stage.units.length === 0) && (
            <div className="text-center py-3 text-gray-500 text-xs">
              No units available
            </div>
          )}
        </div>
      )}
    </div>
  );
}