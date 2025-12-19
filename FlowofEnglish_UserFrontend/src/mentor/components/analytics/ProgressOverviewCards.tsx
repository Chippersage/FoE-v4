// components/analytics/ProgressOverviewCards.tsx
import { TrendingUp, Award, Calendar, BookOpen, FileText } from 'lucide-react';

export default function ProgressOverviewCards({ data }) {
  // Add this function at the top of the component
  const calculateAssignmentsMetrics = () => {
    let totalAssignments = 0;
    let attemptedAssignments = 0;
    
    // Use the existing API structure - check if direct values exist first
    if (data.totalAssignments !== undefined && data.completedAssignments !== undefined) {
      return {
        total: data.totalAssignments,
        attempted: data.completedAssignments,
        percentage: data.assignmentCompletionPercentage || 0
      };
    }
    
    // Fallback: Calculate from nested structure
    if (data.stages) {
      data.stages.forEach((stage: any) => {
        if (stage.units) {
          stage.units.forEach((unit: any) => {
            if (unit.subconcepts) {
              unit.subconcepts.forEach((subconcept: any) => {
                if (subconcept.subconceptType?.toLowerCase().includes('assignment')) {
                  totalAssignments++;
                  if (subconcept.attemptCount > 0) {
                    attemptedAssignments++;
                  }
                }
              });
            }
          });
        }
      });
    }
    
    return {
      total: totalAssignments,
      attempted: attemptedAssignments,
      percentage: totalAssignments > 0 ? (attemptedAssignments / totalAssignments) * 100 : 0
    };
  };

  const assignments = calculateAssignmentsMetrics();
  
  const cards = [
    {
      title: 'Modules Completion',
      value: `${data.completedStages || 0}/${data.totalStages || 0}`,
      percentage: data.stageCompletionPercentage || 0,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50',
      bgColor: 'bg-blue-600',
    },
    {
      title: 'Sessions Completion',
      value: `${data.completedUnits || 0}/${data.totalUnits || 0}`,
      percentage: data.unitCompletionPercentage || 0,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
      bgColor: 'bg-green-600',
    },
    {
      title: 'Activities Mastered',
      value: `${data.completedSubconcepts || 0}/${data.totalSubconcepts || 0}`,
      percentage: data.subconceptCompletionPercentage || 0,
      icon: Award,
      color: 'text-purple-600 bg-purple-50',
      bgColor: 'bg-purple-600',
    },
    {
      title: 'Assignments Progress',
      value: `${assignments.attempted}/${assignments.total} submitted`,
      percentage: assignments.percentage,
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50',
      bgColor: 'bg-gradient-to-r from-indigo-500 to-teal-400',
      isAssignments: true,
    },
    {
      title: 'Learning Duration',
      value: formatDuration(data.firstAttemptDate, data.lastAttemptDate),
      icon: Calendar,
      color: 'text-orange-600 bg-orange-50',
      bgColor: 'bg-orange-600',
      isDuration: true,
    },
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              {card.percentage !== undefined && !card.isDuration && (
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-gray-700">
                      {card.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {card.isAssignments ? 'attempted' : 'completed'}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
          {card.percentage !== undefined && !card.isDuration && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${card.bgColor} rounded-full transition-all duration-500`}
                  style={{ width: `${card.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function formatDuration(start, end) {
  if (!start || !end) return 'N/A';
  const diff = (end - start) / (60 * 60 * 24); // days
  if (diff < 30) return `${Math.floor(diff)} days`;
  if (diff < 365) return `${Math.floor(diff / 30)} months`;
  return `${Math.floor(diff / 365)} years`;
}