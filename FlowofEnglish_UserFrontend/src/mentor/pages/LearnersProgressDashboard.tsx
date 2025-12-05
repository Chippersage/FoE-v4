// src/mentor/pages/LearnersProgressDashboard.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { fetchProgramReport } from '@/lib/mentor-api';
import { Download, Target } from 'lucide-react';

// Import components
import ProgramHeader from '../components/analytics/ProgramHeader';
import ProgressOverviewCards from '../components/analytics/ProgressOverviewCards';
import CompletionChart from '../components/analytics/CompletionChart';
import StageAccordion from '../components/analytics/StageAccordion';
import ScoreDistributionChart from '../components/analytics/ScoreDistributionChart';
import TimeAnalysis from '../components/analytics/TimeAnalysis';
import SkillBreakdown from '../components/analytics/SkillBreakdown';

export default function LearnersProgressDashboard() {
  const { learnerId, programId } = useParams<{ 
    learnerId: string; 
    programId: string;
  }>();
  
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  // Use your existing useFetch hook
  const { data, isLoading, error, refresh } = useFetch(
    () => {
      if (!learnerId || !programId) return null;
      return fetchProgramReport(learnerId, programId);
    },
    [learnerId, programId]
  );

  // Handle exports (simplified for now)
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!data) return;
    
    const filename = `${data.userName || learnerId}_${data.programName || programId}_Report`;
    console.log(`Exporting as ${format}: ${filename}`);
    
    // TODO: Implement actual export functionality
    alert(`Exporting as ${format} - ${filename}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Failed to load analytics data: {error?.message || 'Unknown error'}
          </p>
          <button 
            onClick={() => refresh()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <ProgramHeader 
          programName={data.programName || programId || "Unknown Program"}
          programDesc={data.programDesc || ""}
          learnerName={data.userName || learnerId || "Unknown Learner"}
        />
        
        <div className="flex items-center gap-3">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              className={`px-3 py-2 text-sm ${viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button
              className={`px-3 py-2 text-sm ${viewMode === 'detailed' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </button>
          </div>
          
          <div className="relative group">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <button 
                onClick={() => handleExport('pdf')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as PDF
              </button>
              <button 
                onClick={() => handleExport('excel')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as Excel
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
              >
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ProgressOverviewCards data={data} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Completion Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Completion Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Progress Overview</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="h-4 w-4" />
                <span>Completion Rate</span>
              </div>
            </div>
            <CompletionChart data={data} />
          </div>

          {/* Stage-wise Progress - Only if data has stages */}
          {data.stages && data.stages.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Stage-wise Progress</h3>
                <span className="text-sm text-gray-500">
                  {data.completedStages || 0} of {data.totalStages || 0} stages completed
                </span>
              </div>
              <div className="space-y-2">
                {data.stages.map((stage: any) => (
                  <StageAccordion
                    key={stage.stageId}
                    stage={stage}
                    isExpanded={expandedStage === stage.stageId}
                    onToggle={() => setExpandedStage(
                      expandedStage === stage.stageId ? null : stage.stageId
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Analytics */}
        <div className="space-y-6">
          {/* Score Distribution - Only if data has scoreDistribution */}
          {data.scoreDistribution && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Score Distribution</h3>
              <ScoreDistributionChart distribution={data.scoreDistribution} />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {data.averageScore?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Time Analysis - Only if data has timestamps */}
          {(data.firstAttemptDate || data.lastAttemptDate) && (
            <TimeAnalysis 
              firstAttemptDate={data.firstAttemptDate}
              lastAttemptDate={data.lastAttemptDate}
            />
          )}

          {/* Skill Breakdown - Only if data has stages */}
          {data.stages && data.stages.length > 0 && (
            <SkillBreakdown stages={data.stages} />
          )}
        </div>
      </div>

      {/* Attempt History (Expanded View) */}
      {viewMode === 'detailed' && data.stages && data.stages.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Detailed Attempt History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subconcept
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Concept
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.stages.flatMap((stage: any) => 
                  stage.units.flatMap((unit: any) => 
                    unit.subconcepts.map((subconcept: any) => (
                      <tr key={subconcept.subconceptId}>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {subconcept.lastAttemptDate 
                            ? new Date(subconcept.lastAttemptDate * 1000).toLocaleDateString()
                            : 'N/A'
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {subconcept.subconceptDesc}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {subconcept.concept?.conceptName || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500"
                                style={{ width: `${((subconcept.highestScore || 0) / 5) * 100}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {subconcept.highestScore?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {subconcept.attemptCount || 0} attempts
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}