// components/analytics/DetailedAttemptsView.tsx
import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, ChevronDown, ChevronRight, TrendingUp, Target, Clock, CheckCircle, XCircle, 
  BarChart3, Hash, Users, BookOpen, Zap, Download, Maximize2, Minus, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper Functions
const formatDate = (timestamp: number) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getScoreColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-emerald-600';
  if (percentage >= 60) return 'text-amber-600';
  return 'text-rose-600';
};

const getScoreBgColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'bg-emerald-100 border-emerald-200';
  if (percentage >= 60) return 'bg-amber-100 border-amber-200';
  return 'bg-rose-100 border-rose-200';
};

// Compact Subconcept Row
const SubconceptRow = ({ subconcept, unitName, stageName }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  
  const sortedAttempts = useMemo(() => 
    subconcept.attempts?.sort((a, b) => b.startTimestamp - a.startTimestamp) || []
  , [subconcept.attempts]);
  
  const visibleAttempts = showAllAttempts ? sortedAttempts : sortedAttempts.slice(0, 3);
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Concept Type */}
          <div className="col-span-3 md:col-span-2 text-left">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {subconcept.concept?.conceptName || 'Unknown Concept'}
              </span>
            </div>
            <div className="text-xs text-gray-500 truncate mt-1">
              {stageName} • {unitName}
            </div>
          </div>
          
          {/* Subconcept Description */}
          <div className="col-span-5 md:col-span-4 text-left">
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
              {subconcept.subconceptDesc}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {subconcept.attemptCount || 0} attempts
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                Last: {formatDate(subconcept.lastAttemptDate)}
              </span>
            </div>
          </div>
          
          {/* Score & Progress */}
          <div className="col-span-4 md:col-span-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">
                  {subconcept.highestScore?.toFixed(1) || '0.0'}
                  <span className="text-xs text-gray-500 font-normal">/{subconcept.subconceptMaxscore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div 
                    className={`h-full ${
                      (subconcept.highestScore / subconcept.subconceptMaxscore) >= 0.8 ? 'bg-emerald-500' :
                      (subconcept.highestScore / subconcept.subconceptMaxscore) >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${(subconcept.highestScore / subconcept.subconceptMaxscore) * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-2">
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
          
          {/* Status */}
          <div className="col-span-3 md:col-span-3 text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              subconcept.completed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {subconcept.completed ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  In Progress
                </>
              )}
            </div>
          </div>
        </div>
      </button>
      
      {/* Attempts Detail - Animated */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Best Score</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {subconcept.highestScore?.toFixed(1)}/{subconcept.subconceptMaxscore}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Attempts</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {subconcept.attemptCount || 0}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {subconcept.attempts?.filter(a => a.successful).length || 0}/{subconcept.attempts?.length || 0}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Last Attempt</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDate(subconcept.lastAttemptDate)}
                  </div>
                </div>
              </div>
              
              {/* Attempts Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">Attempt History</div>
                  {sortedAttempts.length > 3 && (
                    <button
                      onClick={() => setShowAllAttempts(!showAllAttempts)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {showAllAttempts ? (
                        <>
                          <Minus className="h-3 w-3" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Show All ({sortedAttempts.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Score</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 hidden md:table-cell">Duration</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAttempts.map((attempt, index) => (
                        <motion.tr
                          key={attempt.attemptId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-3">
                            {formatDate(attempt.startTimestamp)}
                          </td>
                          <td className={`px-4 py-3 font-semibold ${getScoreColor(attempt.score, subconcept.subconceptMaxscore)}`}>
                            {attempt.score.toFixed(1)}/{subconcept.subconceptMaxscore}
                          </td>
                          <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                            {attempt.endTimestamp && attempt.startTimestamp
                              ? `${Math.round((attempt.endTimestamp - attempt.startTimestamp) / 60)}m`
                              : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              attempt.successful
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {attempt.successful ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Pass
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Fail
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Component
export default function DetailedAttemptsView({ stages }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, in-progress
  const [filterScore, setFilterScore] = useState('all'); // all, high, medium, low
  const [viewMode, setViewMode] = useState('list'); // list, compact, timeline
  
  // Flatten all subconcepts with their stage and unit info
  const allSubconcepts = useMemo(() => {
    const result = [];
    
    stages.forEach(stage => {
      stage.units.forEach(unit => {
        unit.subconcepts.forEach(subconcept => {
          result.push({
            ...subconcept,
            stageName: stage.stageName,
            unitName: unit.unitName,
            stageId: stage.stageId,
            unitId: unit.unitId
          });
        });
      });
    });
    
    return result;
  }, [stages]);
  
  // Filter subconcepts
  const filteredSubconcepts = useMemo(() => {
    return allSubconcepts.filter(subconcept => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        subconcept.subconceptDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subconcept.concept?.conceptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subconcept.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subconcept.unitName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'completed' && subconcept.completed) ||
        (filterStatus === 'in-progress' && !subconcept.completed);
      
      // Score filter
      const scorePercentage = (subconcept.highestScore / subconcept.subconceptMaxscore) * 100;
      const matchesScore = filterScore === 'all' ||
        (filterScore === 'high' && scorePercentage >= 80) ||
        (filterScore === 'medium' && scorePercentage >= 60 && scorePercentage < 80) ||
        (filterScore === 'low' && scorePercentage < 60);
      
      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [allSubconcepts, searchTerm, filterStatus, filterScore]);
  
  // Stats
  const stats = useMemo(() => {
    const total = allSubconcepts.length;
    const completed = allSubconcepts.filter(s => s.completed).length;
    const totalAttempts = allSubconcepts.reduce((sum, s) => sum + (s.attemptCount || 0), 0);
    const avgScore = allSubconcepts.reduce((sum, s) => sum + (s.highestScore || 0), 0) / total;
    const avgAttemptsPerSubconcept = totalAttempts / total;
    
    return { total, completed, totalAttempts, avgScore, avgAttemptsPerSubconcept };
  }, [allSubconcepts]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Detailed Attempt History</h3>
            <p className="text-gray-600 mt-1">Comprehensive view of all learning activities and attempts</p>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="list">List View</option>
              <option value="compact">Compact View</option>
              <option value="timeline">Timeline View</option>
            </select>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Subconcepts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Target className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <Zap className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgAttemptsPerSubconcept.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Attempts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search subconcepts, concepts, or stages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
            
            <select 
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
            >
              <option value="all">All Scores</option>
              <option value="high">High (≥80%)</option>
              <option value="medium">Medium (60-80%)</option>
              <option value="low">Low (&lt;60%)</option>
            </select>
            
            <button 
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterScore('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Results Info */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredSubconcepts.length}</span> of <span className="font-semibold">{allSubconcepts.length}</span> subconcepts
          </div>
          <div className="text-sm text-gray-500">
            Sorted by: <span className="font-medium text-gray-700">Latest Attempt</span>
          </div>
        </div>
      </div>
      
      {/* Subconcepts List */}
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="col-span-3 md:col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Concept
            </div>
            <div className="col-span-5 md:col-span-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subconcept
            </div>
            <div className="col-span-4 md:col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score & Progress
            </div>
            <div className="col-span-3 md:col-span-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </div>
          </div>
          
          {/* Table Body */}
          <AnimatePresence>
            {filteredSubconcepts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredSubconcepts.map((subconcept) => (
                  <SubconceptRow
                    key={`${subconcept.stageId}-${subconcept.unitId}-${subconcept.subconceptId}`}
                    subconcept={subconcept}
                    unitName={subconcept.unitName}
                    stageName={subconcept.stageName}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">No matching subconcepts found</div>
                <button 
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterScore('all');
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}