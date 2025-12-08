// src/mentor/pages/LearnersProgressDashboard.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { fetchMentorCohortUsers, fetchProgramReport } from '@/lib/mentor-api';
import { Download, Target, ChevronDown } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
// Import components
import ProgramHeader from '../components/analytics/ProgramHeader';
import ProgressOverviewCards from '../components/analytics/ProgressOverviewCards';
import CompletionChart from '../components/analytics/CompletionChart';
import StageAccordion from '../components/analytics/StageAccordion';
import ScoreDistributionChart from '../components/analytics/ScoreDistributionChart';
import TimeAnalysis from '../components/analytics/TimeAnalysis';
import SkillBreakdown from '../components/analytics/SkillBreakdown';

export default function LearnersProgressDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { cohortId, learnerId: urlLearnerId, programId: urlProgramId } = useParams<{
    cohortId: string;
    learnerId?: string;
    programId?: string;
  }>();
  
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(
    urlLearnerId || null
  );
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const mentorId = user?.userId || "";

  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('overview');

  // Parse query parameters for programId
  const queryParams = new URLSearchParams(location.search);
  const queryProgramId = queryParams.get('programId');

  //  1. Load all users for dropdown
  const { data: cohortData, isLoading: usersLoading } = useFetch(
    () => {
      if (!mentorId || !cohortId) return null;
      return fetchMentorCohortUsers(mentorId, cohortId);
    },
    [mentorId, cohortId]
  );

  // Determine programId from various sources
  const progId = queryProgramId || urlProgramId || cohortData?.cohort?.program?.programId;

  // Update URL when learner is selected (without navigating away)
  useEffect(() => {
    if (!cohortId) return;
    
    if (selectedLearnerId && progId) {
      // Update URL without triggering navigation
      const newPath = `/mentor/${cohortId}/analytics?learnerId=${selectedLearnerId}&programId=${progId}`;
      navigate(newPath, { replace: true });
    } else if (selectedLearnerId) {
      const newPath = `/mentor/${cohortId}/analytics?learnerId=${selectedLearnerId}`;
      navigate(newPath, { replace: true });
    }
  }, [selectedLearnerId, progId, cohortId, navigate]);

  //  2. Load learner data ONLY after selection
  const { data, isLoading, error, refresh } = useFetch(
    () => {
      if (!selectedLearnerId || !progId) return null;
      return fetchProgramReport(selectedLearnerId, progId);
    },
    [selectedLearnerId, progId]
  );

  // Initialize selected learner from URL params
  useEffect(() => {
    if (urlLearnerId && urlLearnerId !== selectedLearnerId) {
      setSelectedLearnerId(urlLearnerId);
    }
  }, [urlLearnerId]);

  // Get selected learner name for display
  const selectedLearner = cohortData?.users?.find(
    user => user.userId === selectedLearnerId
  );

  // Handle learner selection
  const handleSelectLearner = (userId: string) => {
    if (!userId) {
      setSelectedLearnerId(null);
      // Reset URL when no learner is selected
      navigate(`/mentor/${cohortId}/analytics`, { replace: true });
      return;
    }
    
    setSelectedLearnerId(userId);
    setShowUserDropdown(false);
  };

  // If no learner selected, show dropdown
  if (!selectedLearnerId) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600">Select a learner to view their progress analytics</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Select Learner</h2>
            <p className="text-gray-600 text-sm">Choose a learner from your cohort to view their detailed analytics</p>
          </div>

          {usersLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* User Selection Dropdown */}
              <div className="relative mb-8 max-w-md">
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    value=""
                    onChange={(e) => handleSelectLearner(e.target.value)}
                  >
                    <option value="">Select a learner...</option>
                    {cohortData?.users
                      ?.filter(
                        (u) => u.userType === "Learner" && u.status === "ACTIVE"
                      )
                      .map((user) => (
                        <option key={user.userId} value={user.userId}>
                          {user.userName} ({user.userId})
                        </option>
                      ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-700 mb-4">
                  Available Learners: {cohortData?.users?.filter(u => u.userType === "Learner" && u.status === "ACTIVE").length || 0}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cohortData?.users
                    ?.filter(
                      (u) => u.userType === "Learner" && u.status === "ACTIVE"
                    )
                    .slice(0, 10) // Show only first 10 learners as preview
                    .map((user) => (
                      <button
                        key={user.userId}
                        onClick={() => handleSelectLearner(user.userId)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.userName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{user.userName}</h4>
                            <p className="text-sm text-gray-500">{user.userId}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Handle exports (simplified for now)
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!data) return;
    
    const filename = `${data.userName || selectedLearnerId}_${data.programName || progId}_Report`;
    console.log(`Exporting as ${format}: ${filename}`);
    
    // TODO: Implement actual export functionality
    alert(`Exporting as ${format} - ${filename}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load analytics</h3>
          <p className="text-red-600 mb-4">{error?.message || 'Unable to load learner data'}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => refresh()}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => setSelectedLearnerId(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Select Different Learner
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header with Learner Selection and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
            {/* Back to selection button */}
            <button
              onClick={() => setSelectedLearnerId(null)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
              Back to selection
            </button>
            
            {/* Learner Selector */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {selectedLearner?.userName?.charAt(0).toUpperCase() || 'L'}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-800">
                    {selectedLearner?.userName || data.userName || selectedLearnerId}
                  </div>
                  <div className="text-xs text-gray-500">Viewing analytics</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select Learner
                      </div>
                      {cohortData?.users
                        ?.filter(
                          (u) => u.userType === "Learner" && u.status === "ACTIVE"
                        )
                        .map((user) => (
                          <button
                            key={user.userId}
                            onClick={() => handleSelectLearner(user.userId)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-gray-50 ${
                              selectedLearnerId === user.userId ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {user.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{user.userName}</div>
                              <div className="text-xs text-gray-500 truncate">{user.userId}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <ProgramHeader 
            programName={data.programName || progId || "Unknown Program"}
            programDesc={data.programDesc || ""}
            learnerName={data.userName || selectedLearnerId || "Unknown Learner"}
          />
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
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

        {/* Right Column - Analytics (REORDERED) */}
        <div className="space-y-6">
          {/* 1. Learning Timeline - Moved to FIRST position */}
          {(data.firstAttemptDate || data.lastAttemptDate) && (
            <TimeAnalysis 
              firstAttemptDate={data.firstAttemptDate}
              lastAttemptDate={data.lastAttemptDate}
            />
          )}

          {/* 2. Skill Development - Moved to SECOND position */}
          {data.stages && data.stages.length > 0 && (
            <SkillBreakdown stages={data.stages} />
          )}

          {/* 3. Score Distribution - Moved to THIRD position */}
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