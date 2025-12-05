// components/analytics/StageAccordion.tsx
import { ChevronDown, ChevronUp, CheckCircle, Clock, Lock } from 'lucide-react';

export default function StageAccordion({ stage, isExpanded, onToggle }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'yes': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'no': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Lock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center flex-1">
          {getStatusIcon(stage.completionStatus)}
          <div className="ml-3 text-left flex-1">
            <h4 className="font-medium text-gray-900">{stage.stageName}</h4>
            <p className="text-sm text-gray-500 truncate">{stage.stageDesc}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {stage.completedUnits}/{stage.totalUnits} units
            </div>
            <div className="text-xs text-gray-500">
              Avg: {stage.averageScore.toFixed(1)} pts
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full ${getStatusColor(stage.completionPercentage)} transition-all duration-500`}
                style={{ width: `${stage.completionPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-12">
              {stage.completionPercentage.toFixed(0)}%
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stage.units.map((unit) => (
              <div key={unit.unitId} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 text-sm">{unit.unitName}</h5>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    unit.completionStatus === 'yes' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {unit.completionStatus === 'yes' ? 'Completed' : 'In Progress'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{unit.unitDesc}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Subconcepts:</span>
                    <span className="font-medium">
                      {unit.completedSubconcepts}/{unit.totalSubconcepts}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{unit.averageScore.toFixed(1)}</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${unit.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}