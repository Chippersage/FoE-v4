import { FileText, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { LearnerDetailedProgress, Stage, Subconcept } from '@/types/mentor.types';
import { motion } from 'framer-motion';

interface StudentAssignmentsProps {
  data: LearnerDetailedProgress;
  cohortName?: string;
  learnerName?: string;
  className?: string;
}

export default function StudentAssignments({  data,  cohortName,  learnerName, className = '' }: StudentAssignmentsProps) {
  
  // Extract all assignment subconcepts (subconceptType starts with "assignment")
  const extractAssignments = () => {
    const assignments: Array<{
      subconceptId: string;
      subconceptDesc: string;
      subconceptMaxscore: number;
      highestScore: number;
      attemptCount: number;
      lastAttemptDate?: number;
      attempts: any[];
      stageName: string;
      stageId: string;
      unitName: string;
      subconceptType: string;
    }> = [];

    data.stages?.forEach((stage: Stage) => {
      stage.units?.forEach((unit: any) => {
        unit.subconcepts?.forEach((subconcept: Subconcept) => {
          if (subconcept.subconceptType?.toLowerCase().includes('assignment')) {
            assignments.push({
              subconceptId: subconcept.subconceptId,
              subconceptDesc: subconcept.subconceptDesc,
              subconceptMaxscore: subconcept.subconceptMaxscore,
              highestScore: subconcept.highestScore,
              attemptCount: subconcept.attemptCount,
              lastAttemptDate: subconcept.lastAttemptDate,
              attempts: subconcept.attempts || [],
              stageName: stage.stageName,
              stageId: stage.stageId,
              unitName: unit.unitName,
              subconceptType: subconcept.subconceptType,
            });
          }
        });
      });
    });

    return assignments;
  };

  const assignments = extractAssignments();
  
  // Calculate summary statistics
  const totalAssignments = data.totalAssignments || assignments.length;
  const attemptedAssignments = assignments.filter(a => a.attemptCount > 0).length;
  const correctedAssignments = assignments.filter(a => {
    // Check if assignment has been corrected (has attempts and highestScore > 0)
    return a.attemptCount > 0 && a.highestScore > 0;
  }).length;
  const pendingAssignments = attemptedAssignments - correctedAssignments;

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not submitted';
    
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Format date for table
  const formatTableDate = (timestamp?: number) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (assignment: any) => {
    if (assignment.attemptCount === 0) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
          Not Started
        </span>
      );
    }
    
    if (assignment.highestScore > 0) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Corrected
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  };

  // Get corrected date
  const getCorrectedDate = (assignment: any) => {
    if (assignment.attemptCount === 0) return '--';
    if (assignment.highestScore === 0) return 'Awaiting correction';
    
    const lastAttempt = assignment.attempts?.[0];
    if (!lastAttempt) return '--';
    
    return formatTableDate(lastAttempt.endTimestamp);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      {/* Header with Stats */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Learners Assignments</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Cohort:</span> {cohortName}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Learner:</span> {learnerName || data.userName}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Total:</span> {totalAssignments}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Submitted:</span> {attemptedAssignments}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Pending:</span> {pendingAssignments}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Graded:</span> {correctedAssignments}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Summary */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">Completion</div>
              <div className="text-lg font-bold text-gray-800">
                {data.assignmentCompletionPercentage?.toFixed(0) || 
                 (totalAssignments > 0 ? ((correctedAssignments / totalAssignments) * 100).toFixed(0) : '0')}%
              </div>
            </div>
            <div className="w-12 h-12">
              <div className="relative w-full h-full">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray={`${data.assignmentCompletionPercentage || 0}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-600 font-medium">Total Assignments</div>
                <div className="text-lg font-bold text-gray-800">{totalAssignments}</div>
              </div>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-green-600 font-medium">Submitted</div>
                <div className="text-lg font-bold text-gray-800">{attemptedAssignments}</div>
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-yellow-600 font-medium">Pending Review</div>
                <div className="text-lg font-bold text-gray-800">{pendingAssignments}</div>
              </div>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-600 font-medium">Graded</div>
                <div className="text-lg font-bold text-gray-800">{correctedAssignments}</div>
              </div>
              <CheckCircle className="h-4 w-4 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">TOPIC</th>
              <th className="px-4 py-3 min-w-[120px]">Module</th>
              <th className="px-4 py-3 min-w-[100px]">Submitted Date</th>
              <th className="px-4 py-3 min-w-[100px]">SCORE</th>
              <th className="px-4 py-3 min-w-[120px]">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>No assignments found</div>
                    <div className="text-sm text-gray-400">Assignments will appear here when available</div>
                  </div>
                </td>
              </tr>
            ) : (
              assignments.map((assignment, index) => (
                <motion.tr
                  key={assignment.subconceptId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* TOPIC Column */}
                  <td className="px-4 py-3">
                    <div className="max-w-[200px]">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {assignment.subconceptDesc}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {assignment.unitName}
                      </div>
                    </div>
                  </td>

                  {/* Module Column */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 min-w-[120px]">
                      {assignment.stageName}
                    </div>
                  </td>

                  {/* Submitted Date Column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(assignment.lastAttemptDate)}
                    </div>
                  </td>

                  {/* SCORE Column */}
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">
                      {assignment.attemptCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="text-gray-800">
                            {assignment.highestScore}/{assignment.subconceptMaxscore}
                          </div>
                          {assignment.subconceptMaxscore > 0 && (
                            <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {((assignment.highestScore / assignment.subconceptMaxscore) * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-- / {assignment.subconceptMaxscore}</span>
                      )}
                    </div>
                  </td>

                  {/* STATUS Column */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(assignment)}
                      {assignment.highestScore > 0 && (
                        <div className="text-xs text-gray-500">
                          Corrected: {getCorrectedDate(assignment)}
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {assignments.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
            <div>
              Showing {assignments.length} assignments •
              <span className="ml-2">
                {attemptedAssignments} submitted • {correctedAssignments} graded
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Corrected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>Not Started</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}