// src/mentor/components/analytics/TimeAnalysis.tsx
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface TimeAnalysisProps {
  firstAttemptDate: number;
  lastAttemptDate: number;
}

export default function TimeAnalysis({ firstAttemptDate, lastAttemptDate }: TimeAnalysisProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    const diffInDays = Math.floor((lastAttemptDate - firstAttemptDate) / (60 * 60 * 24));
    if (diffInDays < 7) {
      return `${diffInDays} days`;
    } else if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)} weeks`;
    } else if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)} months`;
    } else {
      return `${Math.floor(diffInDays / 365)} years`;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Learning Timeline</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">First Attempt</p>
              <p className="text-sm text-gray-500">{formatDate(firstAttemptDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Attempt</p>
              <p className="text-sm text-gray-500">{formatDate(lastAttemptDate)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Learning Duration</p>
              <p className="text-sm text-gray-500">{calculateDuration()}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Start</span>
            <span>Progress</span>
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}