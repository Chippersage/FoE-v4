// components/analytics/ProgressOverviewCards.tsx
import { TrendingUp, Award, Calendar, BookOpen } from 'lucide-react';

export default function ProgressOverviewCards({ data }) {
  const cards = [
    {
      title: 'Stage Completion',
      value: `${data.completedStages}/${data.totalStages}`,
      percentage: data.stageCompletionPercentage,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50',
      bgColor: 'bg-blue-600',
    },
    {
      title: 'Unit Completion',
      value: `${data.completedUnits}/${data.totalUnits}`,
      percentage: data.unitCompletionPercentage,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
      bgColor: 'bg-green-600',
    },
    {
      title: 'Subconcept Mastery',
      value: `${data.completedSubconcepts}/${data.totalSubconcepts}`,
      percentage: data.subconceptCompletionPercentage,
      icon: Award,
      color: 'text-purple-600 bg-purple-50',
      bgColor: 'bg-purple-600',
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
              {card.percentage !== undefined && (
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-gray-700">
                      {card.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">completed</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
          {card.percentage !== undefined && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${card.bgColor} rounded-full transition-all duration-500`}
                  style={{ width: `${card.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function formatDuration(start, end) {
  const diff = (end - start) / (60 * 60 * 24); // days
  if (diff < 30) return `${Math.floor(diff)} days`;
  if (diff < 365) return `${Math.floor(diff / 30)} months`;
  return `${Math.floor(diff / 365)} years`;
}