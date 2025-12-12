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
    <div className="bg-white rounded-xl shadow mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <div className="text-left">
            <h3 className="font-semibold text-lg">{stage.stageName}</h3>
            <p className="text-sm text-gray-500">
              {stage.units?.length || 0} units • {stage.completedUnits || 0} completed
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${isOpen ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {isOpen ? 'Expanded' : 'Collapsed'}
        </span>
      </button>
      
      {isOpen && (
        <div className="border-t p-4 bg-gray-50">
          {stage.units?.map((unit, unitIndex) => (
            <UnitCollapsible key={unitIndex} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}