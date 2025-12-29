import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Calendar, CheckCircle, Clock, TrendingUp, ChevronDown, ChevronUp, Download, Upload, X, AlertCircle, Check, FileUp, Info } from 'lucide-react';
import type { LearnerDetailedProgress, Stage, Subconcept, UserAssignmentsResponse, Assignment, SubmitCorrectionParams } from '@/types/mentor.types';
import { motion } from 'framer-motion';
import { submitCorrectedAssignment } from '@/lib/mentor-api';
import { useUserContext } from '@/context/AuthContext';

interface StudentAssignmentsProps {
  data: LearnerDetailedProgress;
  assignmentsData?: UserAssignmentsResponse;
  cohortId?: string;
  cohortName?: string;
  learnerName?: string;
  programId?: string;
  className?: string;
  onRefresh?: () => void;
}

interface ExpandedAssignment {
  assignmentId: string;
  isExpanded: boolean;
}

// File validation constants (adjust based on your backend)
const MAX_FILE_SIZES = {
  PDF: 1 * 1024 * 1024, // 1MB
  IMAGE: 1 * 1024 * 1024, // 1MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  VIDEO: 30 * 1024 * 1024, // 30MB
  DOCUMENT: 5 * 1024 * 1024, // 5MB
};

const ALLOWED_FILE_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
];

export default function StudentAssignments({ data, assignmentsData, cohortId, cohortName, learnerName, programId, className = '',
  onRefresh 
}: StudentAssignmentsProps) {
  const { user } = useUserContext();
  const [expandedAssignments, setExpandedAssignments] = useState<ExpandedAssignment[]>([]);
  const [correctionData, setCorrectionData] = useState<{
    [assignmentId: string]: {
      score: string;
      remarks: string;
      file: File | null;
      fileError?: string;
    }
  }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract all assignment subconcepts from program report
  const extractProgramAssignments = () => {
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

  // Merge data from both APIs
  const mergeAssignmentsData = useMemo(() => {
    const programAssignments = extractProgramAssignments();
    const userAssignments = assignmentsData?.assignments || [];

    // Create a map of user assignments by subconceptId for quick lookup
    const userAssignmentsMap = new Map<string, Assignment>();
    userAssignments.forEach(assignment => {
      userAssignmentsMap.set(assignment.subconcept.subconceptId, assignment);
    });

    // Merge the data
    return programAssignments.map(programAssignment => {
      const userAssignment = userAssignmentsMap.get(programAssignment.subconceptId);
      
      if (userAssignment) {
        // Data exists in both APIs - use the user assignments data for detailed info
        return {
          ...programAssignment,
          // Override with user assignment data
          highestScore: userAssignment.score || programAssignment.highestScore,
          lastAttemptDate: userAssignment.submittedDate,
          submittedDate: userAssignment.submittedDate,
          correctedDate: userAssignment.correctedDate,
          remarks: userAssignment.remarks,
          assignmentId: userAssignment.assignmentId,
          submittedFile: userAssignment.submittedFile,
          correctedFile: userAssignment.correctedFile,
          dependencies: userAssignment.subconcept.dependencies,
          status: userAssignment.score !== undefined && userAssignment.score !== null ? 'graded' : 
                userAssignment.submittedDate ? 'submitted' : 'not_started'
        };
      } else {
        // Only exists in program report
        return {
          ...programAssignment,
          assignmentId: `${learnerName || 'user'}-${programAssignment.subconceptId}`,
          status: programAssignment.attemptCount > 0 ? 'submitted' : 'not_started',
          submittedDate: programAssignment.lastAttemptDate,
          correctedDate: undefined,
          remarks: undefined,
          submittedFile: undefined,
          correctedFile: undefined,
          dependencies: undefined
        };
      }
    });
  }, [data, assignmentsData, learnerName]);

  const assignments = mergeAssignmentsData;
  
  // Calculate summary statistics
  const totalAssignments = data.totalAssignments || assignments.length;
  const submittedAssignments = assignmentsData?.submitted || assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
  const pendingAssignments = assignmentsData?.pendingReview || assignments.filter(a => a.status === 'submitted').length;
  const gradedAssignments = assignmentsData?.evaluated || assignments.filter(a => a.status === 'graded').length;

  // Initialize expanded state
  useEffect(() => {
    setExpandedAssignments(assignments.map(assignment => ({
      assignmentId: assignment.assignmentId,
      isExpanded: false
    })));
  }, [assignments]);

  // Initialize correction data
  useEffect(() => {
    const initialCorrectionData: typeof correctionData = {};
    assignments.forEach(assignment => {
      if (assignment.assignmentId) {
        initialCorrectionData[assignment.assignmentId] = {
          score: assignment.highestScore?.toString() || '',
          remarks: assignment.remarks || '',
          file: null,
          fileError: undefined
        };
      }
    });
    setCorrectionData(initialCorrectionData);
  }, [assignments]);

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
    if (assignment.status === 'not_started') {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
          Not Started
        </span>
      );
    }
    
    if (assignment.status === 'graded') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Graded
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending Review
      </span>
    );
  };

  // Toggle expansion
  const toggleExpansion = (assignmentId: string) => {
    setExpandedAssignments(prev =>
      prev.map(item =>
        item.assignmentId === assignmentId
          ? { ...item, isExpanded: !item.isExpanded }
          : item
      )
    );
  };

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const allowedTypes = ALLOWED_FILE_TYPES.map(t => {
        if (t.includes('image/')) return 'Images';
        if (t.includes('audio/')) return 'Audio';
        if (t.includes('video/')) return 'Video';
        if (t.includes('application/pdf')) return 'PDF';
        if (t.includes('application/vnd.openxmlformats')) return 'Documents';
        if (t.includes('text/')) return 'Text';
        return t;
      });
      const uniqueTypes = [...new Set(allowedTypes)];
      return `File type not allowed. Allowed types: ${uniqueTypes.join(', ')}`;
    }

    // Check file size based on type
    let maxSize = MAX_FILE_SIZES.DOCUMENT; // Default
    if (file.type.includes('image/')) {
      maxSize = MAX_FILE_SIZES.IMAGE;
    } else if (file.type.includes('audio/')) {
      maxSize = MAX_FILE_SIZES.AUDIO;
    } else if (file.type.includes('video/')) {
      maxSize = MAX_FILE_SIZES.VIDEO;
    } else if (file.type === 'application/pdf') {
      maxSize = MAX_FILE_SIZES.PDF;
    }

    if (file.size > maxSize) {
      const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0);
      return `File too large. Maximum size for ${file.type.split('/')[0]} files is ${sizeInMB}MB`;
    }

    return null;
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file upload with validation
  const handleFileUpload = (assignmentId: string, file: File | null) => {
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setCorrectionData(prev => ({
          ...prev,
          [assignmentId]: {
            ...prev[assignmentId],
            file: null,
            fileError: validationError
          }
        }));
        setTimeout(() => {
          setCorrectionData(prev => ({
            ...prev,
            [assignmentId]: {
              ...prev[assignmentId],
              fileError: undefined
            }
          }));
        }, 5000);
        return;
      }
    }

    setCorrectionData(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        file,
        fileError: undefined
      }
    }));
  };

  // Handle correction input change
  const handleCorrectionChange = (assignmentId: string, field: 'score' | 'remarks', value: string) => {
    setCorrectionData(prev => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [field]: value
      }
    }));
  };

  // Validate correction data
  const validateCorrection = (assignmentId: string) => {
    const correction = correctionData[assignmentId];
    const assignment = assignments.find(a => a.assignmentId === assignmentId);
    
    if (!correction.score || !correction.score.trim()) {
      return 'Score is required';
    }
    
    const scoreNum = parseFloat(correction.score);
    if (isNaN(scoreNum)) {
      return 'Score must be a number';
    }
    
    if (scoreNum < 0) {
      return 'Score cannot be negative';
    }
    
    if (assignment?.subconceptMaxscore && scoreNum > assignment.subconceptMaxscore) {
      return `Score cannot exceed ${assignment.subconceptMaxscore}`;
    }
    
    if (!correction.remarks || !correction.remarks.trim()) {
      return 'Remarks are required';
    }

    if (correction.fileError) {
      return correction.fileError;
    }
    
    return null;
  };

  // Format date to ISO string for backend
  const formatDateForBackend = (date: Date): string => {
    // Backend expects ISO 8601 format with timezone
    return date.toISOString(); // This will give "2025-12-26T12:50:37.482Z"
  };

  // Submit correction
  const handleSubmitCorrection = async (assignmentId: string) => {
    const validationError = validateCorrection(assignmentId);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSubmitting(assignmentId);
    setError(null);

    try {
      const assignment = assignments.find(a => a.assignmentId === assignmentId);
      const correction = correctionData[assignmentId];

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const params: SubmitCorrectionParams = {
        score: parseFloat(correction.score),
        remarks: correction.remarks,
        correctedDate: formatDateForBackend(new Date()), // Send in correct ISO format
        file: correction.file || undefined
      };

      await submitCorrectedAssignment(assignmentId, params);
      
      // Refresh data
      if (onRefresh) {
        onRefresh();
      }

      // Close expansion
      setExpandedAssignments(prev =>
        prev.map(item =>
          item.assignmentId === assignmentId
            ? { ...item, isExpanded: false }
            : item
        )
      );

      // Show success message
      setError('Correction submitted successfully!');
      setTimeout(() => setError(null), 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to submit correction');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(null);
    }
  };

  // Render dependencies
  const renderDependencies = (dependencies: any[]) => {
    if (!dependencies || dependencies.length === 0) {
      return <span className="text-gray-400">No dependencies</span>;
    }

    return (
      <div className="space-y-1">
        {dependencies.map((dep, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{dep.subconceptDesc}</span>
            <a
              href={dep.subconceptLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              View Reference
            </a>
          </div>
        ))}
      </div>
    );
  };

  // Render file info section
  const renderFileInfo = () => (
    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Allowed file types and sizes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>PDF: Max {formatBytes(MAX_FILE_SIZES.PDF)}</li>
            <li>Images: Max {formatBytes(MAX_FILE_SIZES.IMAGE)}</li>
            <li>Audio: Max {formatBytes(MAX_FILE_SIZES.AUDIO)}</li>
            <li>Video: Max {formatBytes(MAX_FILE_SIZES.VIDEO)}</li>
            <li>Documents: Max {formatBytes(MAX_FILE_SIZES.DOCUMENT)}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      {/* Error/Success Message */}
      {error && (
        <div className={`p-4 border-b ${error.includes('success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`flex items-center gap-2 ${error.includes('success') ? 'text-green-700' : 'text-red-700'}`}>
            {error.includes('success') ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
                  <span className="font-medium">Submitted:</span> {submittedAssignments}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Pending:</span> {pendingAssignments}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Graded:</span> {gradedAssignments}
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
                 (totalAssignments > 0 ? ((gradedAssignments / totalAssignments) * 100).toFixed(0) : '0')}%
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
                <div className="text-lg font-bold text-gray-800">{submittedAssignments}</div>
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
                <div className="text-lg font-bold text-gray-800">{gradedAssignments}</div>
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
              <th className="px-4 py-3 min-w-[80px]">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>No assignments found</div>
                    <div className="text-sm text-gray-400">Assignments will appear here when available</div>
                  </div>
                </td>
              </tr>
            ) : (
              assignments.map((assignment, index) => {
                const isExpanded = expandedAssignments.find(
                  item => item.assignmentId === assignment.assignmentId
                )?.isExpanded || false;
                const correction = correctionData[assignment.assignmentId];
                
                return (
                  <React.Fragment key={assignment.assignmentId}>
                    <motion.tr
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
                          {formatDate(assignment.submittedDate)}
                        </div>
                      </td>

                      {/* SCORE Column */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {assignment.status !== 'not_started' ? (
                            <div className="flex items-center gap-2">
                              <div className="text-gray-800">
                                {assignment.highestScore || 0}/{assignment.subconceptMaxscore}
                              </div>
                              {assignment.subconceptMaxscore > 0 && (
                                <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {(((assignment.highestScore || 0) / assignment.subconceptMaxscore) * 100).toFixed(0)}%
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
                          {assignment.status === 'graded' && assignment.correctedDate && (
                            <div className="text-xs text-gray-500">
                              Corrected: {formatTableDate(assignment.correctedDate)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ACTION Column */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpansion(assignment.assignmentId)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          disabled={assignment.status === 'not_started'}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" />
                              {assignment.status === 'graded' ? 'View' : 'Correct'}
                            </>
                          )}
                        </button>
                      </td>
                    </motion.tr>

                    {/* Expanded Correction Form */}
                    {isExpanded && assignment.status !== 'not_started' && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-800">
                                {assignment.status === 'graded' ? 'Correction Details' : 'Correct Assignment'}
                              </h4>
                              {assignment.status === 'graded' && (
                                <span className="text-sm text-green-600 font-medium">
                                  Already Graded
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left Column */}
                              <div className="space-y-4">
                                {/* Submitted File */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Submitted File
                                  </label>
                                  {assignment.submittedFile ? (
                                    <a
                                      href={assignment.submittedFile.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download Submitted File
                                    </a>
                                  ) : (
                                    <span className="text-gray-400">No file submitted</span>
                                  )}
                                </div>

                                {/* References */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    References
                                  </label>
                                  {renderDependencies(assignment.dependencies || [])}
                                </div>

                                {/* Corrected File (if already graded) */}
                                {assignment.status === 'graded' && assignment.correctedFile && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Corrected File
                                    </label>
                                    <a
                                      href={assignment.correctedFile.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download Corrected File
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Right Column */}
                              <div className="space-y-4">
                                {/* Score */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Score {assignment.status !== 'graded' && '*'} 
                                    <span className="text-gray-500 text-xs"> (Max: {assignment.subconceptMaxscore})</span>
                                  </label>
                                  {assignment.status === 'graded' ? (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
                                      <span className="font-medium">{assignment.highestScore}</span> / {assignment.subconceptMaxscore}
                                    </div>
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
                                      max={assignment.subconceptMaxscore}
                                      step="0.1"
                                      value={correction?.score || ''}
                                      onChange={(e) => handleCorrectionChange(assignment.assignmentId, 'score', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                      placeholder="Enter score"
                                      disabled={assignment.status === 'graded'}
                                    />
                                  )}
                                </div>

                                {/* Remarks */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Remarks {assignment.status !== 'graded' && '*'}
                                  </label>
                                  {assignment.status === 'graded' ? (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-700 min-h-[80px]">
                                      {assignment.remarks || 'No remarks provided'}
                                    </div>
                                  ) : (
                                    <textarea
                                      value={correction?.remarks || ''}
                                      onChange={(e) => handleCorrectionChange(assignment.assignmentId, 'remarks', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                      rows={3}
                                      placeholder="Enter remarks"
                                      disabled={assignment.status === 'graded'}
                                    />
                                  )}
                                </div>

                                {/* Correction File (only for pending assignments) */}
                                {assignment.status !== 'graded' && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Correction File (Optional)
                                    </label>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                                          <FileUp className="h-4 w-4" />
                                          <span>Upload File</span>
                                          <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(assignment.assignmentId, e.target.files?.[0] || null)}
                                            accept={ALLOWED_FILE_TYPES.join(',')}
                                          />
                                        </label>
                                        {correction?.file && (
                                          <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FileText className="h-4 w-4" />
                                            <span className="truncate max-w-[150px]">{correction.file.name}</span>
                                            <span className="text-xs text-gray-500">
                                              ({formatBytes(correction.file.size)})
                                            </span>
                                            <button
                                              onClick={() => handleFileUpload(assignment.assignmentId, null)}
                                              className="text-red-500 hover:text-red-700"
                                              type="button"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      {correction?.fileError && (
                                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                          {correction.fileError}
                                        </div>
                                      )}
                                      {renderFileInfo()}
                                    </div>
                                  </div>
                                )}

                                {/* Date of Correction */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Correction
                                  </label>
                                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                                    {assignment.status === 'graded' && assignment.correctedDate 
                                      ? formatTableDate(assignment.correctedDate)
                                      : new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                  </div>
                                </div>

                                {/* Submit Button (only for pending assignments) */}
                                {assignment.status !== 'graded' && (
                                  <div className="pt-2">
                                    <button
                                      onClick={() => handleSubmitCorrection(assignment.assignmentId)}
                                      disabled={submitting === assignment.assignmentId}
                                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {submitting === assignment.assignmentId ? (
                                        <>
                                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          Submitting...
                                        </>
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4" />
                                          Submit Correction
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
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
                {submittedAssignments} submitted • {gradedAssignments} graded
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Graded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pending Review</span>
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



// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { FileText, Calendar, CheckCircle, Clock, TrendingUp, ChevronDown, ChevronUp, Download, Upload, X, AlertCircle, Check, FileUp } from 'lucide-react';
// import type { LearnerDetailedProgress, Stage, Subconcept, UserAssignmentsResponse, Assignment, SubmitCorrectionParams } from '@/types/mentor.types';
// import { motion } from 'framer-motion';
// import { submitCorrectedAssignment } from '@/lib/mentor-api';
// import { useUserContext } from '@/context/AuthContext';

// interface StudentAssignmentsProps {
//   data: LearnerDetailedProgress;
//   assignmentsData?: UserAssignmentsResponse;
//   cohortId?: string;
//   cohortName?: string;
//   learnerName?: string;
//   programId?: string;
//   className?: string;
//   onRefresh?: () => void;
// }

// interface ExpandedAssignment {
//   assignmentId: string;
//   isExpanded: boolean;
// }

// export default function StudentAssignments({ 
//   data, 
//   assignmentsData, 
//   cohortId,
//   cohortName, 
//   learnerName, 
//   programId,
//   className = '',
//   onRefresh 
// }: StudentAssignmentsProps) {
//   const { user } = useUserContext();
//   const [expandedAssignments, setExpandedAssignments] = useState<ExpandedAssignment[]>([]);
//   const [correctionData, setCorrectionData] = useState<{
//     [assignmentId: string]: {
//       score: string;
//       remarks: string;
//       file: File | null;
//     }
//   }>({});
//   const [submitting, setSubmitting] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Extract all assignment subconcepts from program report
//   const extractProgramAssignments = () => {
//     const assignments: Array<{
//       subconceptId: string;
//       subconceptDesc: string;
//       subconceptMaxscore: number;
//       highestScore: number;
//       attemptCount: number;
//       lastAttemptDate?: number;
//       attempts: any[];
//       stageName: string;
//       stageId: string;
//       unitName: string;
//       subconceptType: string;
//     }> = [];

//     data.stages?.forEach((stage: Stage) => {
//       stage.units?.forEach((unit: any) => {
//         unit.subconcepts?.forEach((subconcept: Subconcept) => {
//           if (subconcept.subconceptType?.toLowerCase().includes('assignment')) {
//             assignments.push({
//               subconceptId: subconcept.subconceptId,
//               subconceptDesc: subconcept.subconceptDesc,
//               subconceptMaxscore: subconcept.subconceptMaxscore,
//               highestScore: subconcept.highestScore,
//               attemptCount: subconcept.attemptCount,
//               lastAttemptDate: subconcept.lastAttemptDate,
//               attempts: subconcept.attempts || [],
//               stageName: stage.stageName,
//               stageId: stage.stageId,
//               unitName: unit.unitName,
//               subconceptType: subconcept.subconceptType,
//             });
//           }
//         });
//       });
//     });

//     return assignments;
//   };

//   // Merge data from both APIs
//   const mergeAssignmentsData = useMemo(() => {
//     const programAssignments = extractProgramAssignments();
//     const userAssignments = assignmentsData?.assignments || [];

//     // Create a map of user assignments by subconceptId for quick lookup
//     const userAssignmentsMap = new Map<string, Assignment>();
//     userAssignments.forEach(assignment => {
//       userAssignmentsMap.set(assignment.subconcept.subconceptId, assignment);
//     });

//     // Merge the data
//     return programAssignments.map(programAssignment => {
//       const userAssignment = userAssignmentsMap.get(programAssignment.subconceptId);
      
//       if (userAssignment) {
//         // Data exists in both APIs - use the user assignments data for detailed info
//         return {
//           ...programAssignment,
//           // Override with user assignment data
//           highestScore: userAssignment.score || programAssignment.highestScore,
//           lastAttemptDate: userAssignment.submittedDate,
//           submittedDate: userAssignment.submittedDate,
//           correctedDate: userAssignment.correctedDate,
//           remarks: userAssignment.remarks,
//           assignmentId: userAssignment.assignmentId,
//           submittedFile: userAssignment.submittedFile,
//           correctedFile: userAssignment.correctedFile,
//           dependencies: userAssignment.subconcept.dependencies,
//           status: userAssignment.score !== undefined && userAssignment.score !== null ? 'graded' : 
//                  userAssignment.submittedDate ? 'submitted' : 'not_started'
//         };
//       } else {
//         // Only exists in program report
//         return {
//           ...programAssignment,
//           assignmentId: `${learnerName || 'user'}-${programAssignment.subconceptId}`,
//           status: programAssignment.attemptCount > 0 ? 'submitted' : 'not_started',
//           submittedDate: programAssignment.lastAttemptDate,
//           correctedDate: undefined,
//           remarks: undefined,
//           submittedFile: undefined,
//           correctedFile: undefined,
//           dependencies: undefined
//         };
//       }
//     });
//   }, [data, assignmentsData, learnerName]);

//   const assignments = mergeAssignmentsData;
  
//   // Calculate summary statistics
//   const totalAssignments = data.totalAssignments || assignments.length;
//   const submittedAssignments = assignmentsData?.submitted || assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
//   const pendingAssignments = assignmentsData?.pendingReview || assignments.filter(a => a.status === 'submitted').length;
//   const gradedAssignments = assignmentsData?.evaluated || assignments.filter(a => a.status === 'graded').length;

//   // Initialize expanded state
//   useEffect(() => {
//     setExpandedAssignments(assignments.map(assignment => ({
//       assignmentId: assignment.assignmentId,
//       isExpanded: false
//     })));
//   }, [assignments]);

//   // Initialize correction data
//   useEffect(() => {
//     const initialCorrectionData: typeof correctionData = {};
//     assignments.forEach(assignment => {
//       if (assignment.assignmentId) {
//         initialCorrectionData[assignment.assignmentId] = {
//           score: assignment.highestScore?.toString() || '',
//           remarks: assignment.remarks || '',
//           file: null
//         };
//       }
//     });
//     setCorrectionData(initialCorrectionData);
//   }, [assignments]);

//   // Format date
//   const formatDate = (timestamp?: number) => {
//     if (!timestamp) return 'Not submitted';
    
//     const date = new Date(timestamp * 1000);
//     const now = new Date();
//     const diffTime = Math.abs(now.getTime() - date.getTime());
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) {
//       return 'Today';
//     } else if (diffDays === 1) {
//       return 'Yesterday';
//     } else if (diffDays < 7) {
//       return `${diffDays} days ago`;
//     } else {
//       return date.toLocaleDateString('en-US', { 
//         month: 'short', 
//         day: 'numeric',
//         year: 'numeric'
//       });
//     }
//   };

//   // Format date for table
//   const formatTableDate = (timestamp?: number) => {
//     if (!timestamp) return '--';
//     const date = new Date(timestamp * 1000);
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: '2-digit'
//     });
//   };

//   // Get status badge
//   const getStatusBadge = (assignment: any) => {
//     if (assignment.status === 'not_started') {
//       return (
//         <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
//           Not Started
//         </span>
//       );
//     }
    
//     if (assignment.status === 'graded') {
//       return (
//         <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
//           <CheckCircle className="h-3 w-3" />
//           Graded
//         </span>
//       );
//     }
    
//     return (
//       <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
//         <Clock className="h-3 w-3" />
//         Pending Review
//       </span>
//     );
//   };

//   // Toggle expansion
//   const toggleExpansion = (assignmentId: string) => {
//     setExpandedAssignments(prev =>
//       prev.map(item =>
//         item.assignmentId === assignmentId
//           ? { ...item, isExpanded: !item.isExpanded }
//           : item
//       )
//     );
//   };

//   // Handle correction input change
//   const handleCorrectionChange = (assignmentId: string, field: 'score' | 'remarks', value: string) => {
//     setCorrectionData(prev => ({
//       ...prev,
//       [assignmentId]: {
//         ...prev[assignmentId],
//         [field]: value
//       }
//     }));
//   };

//   // Handle file upload
//   const handleFileUpload = (assignmentId: string, file: File | null) => {
//     setCorrectionData(prev => ({
//       ...prev,
//       [assignmentId]: {
//         ...prev[assignmentId],
//         file
//       }
//     }));
//   };

//   // Validate correction data
//   const validateCorrection = (assignmentId: string) => {
//     const correction = correctionData[assignmentId];
//     const assignment = assignments.find(a => a.assignmentId === assignmentId);
    
//     if (!correction.score || !correction.score.trim()) {
//       return 'Score is required';
//     }
    
//     const scoreNum = parseFloat(correction.score);
//     if (isNaN(scoreNum)) {
//       return 'Score must be a number';
//     }
    
//     if (assignment?.subconceptMaxscore && scoreNum > assignment.subconceptMaxscore) {
//       return `Score cannot exceed ${assignment.subconceptMaxscore}`;
//     }
    
//     if (!correction.remarks || !correction.remarks.trim()) {
//       return 'Remarks are required';
//     }
    
//     return null;
//   };

//   // Submit correction
//   const handleSubmitCorrection = async (assignmentId: string) => {
//     const validationError = validateCorrection(assignmentId);
//     if (validationError) {
//       setError(validationError);
//       setTimeout(() => setError(null), 3000);
//       return;
//     }

//     setSubmitting(assignmentId);
//     setError(null);

//     try {
//       const assignment = assignments.find(a => a.assignmentId === assignmentId);
//       const correction = correctionData[assignmentId];

//       if (!assignment) {
//         throw new Error('Assignment not found');
//       }

//       const params: SubmitCorrectionParams = {
//         score: parseFloat(correction.score),
//         remarks: correction.remarks,
//         correctedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
//         file: correction.file || undefined
//       };

//       await submitCorrectedAssignment(assignmentId, params);
      
//       // Refresh data
//       if (onRefresh) {
//         onRefresh();
//       }

//       // Close expansion
//       setExpandedAssignments(prev =>
//         prev.map(item =>
//           item.assignmentId === assignmentId
//             ? { ...item, isExpanded: false }
//             : item
//         )
//       );

//     } catch (err: any) {
//       setError(err.message || 'Failed to submit correction');
//       setTimeout(() => setError(null), 3000);
//     } finally {
//       setSubmitting(null);
//     }
//   };

//   // Render dependencies
//   const renderDependencies = (dependencies: any[]) => {
//     if (!dependencies || dependencies.length === 0) {
//       return <span className="text-gray-400">No dependencies</span>;
//     }

//     return (
//       <div className="space-y-1">
//         {dependencies.map((dep, index) => (
//           <div key={index} className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">{dep.subconceptDesc}</span>
//             <a
//               href={dep.subconceptLink}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-xs text-blue-600 hover:text-blue-800 underline"
//             >
//               View Reference
//             </a>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//       className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
//     >
//       {/* Error Message */}
//       {error && (
//         <div className="p-4 bg-red-50 border-b border-red-200">
//           <div className="flex items-center gap-2 text-red-700">
//             <AlertCircle className="h-4 w-4" />
//             <span className="text-sm font-medium">{error}</span>
//             <button
//               onClick={() => setError(null)}
//               className="ml-auto"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header with Stats */}
//       <div className="p-4 border-b border-gray-200">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-indigo-50 rounded-lg">
//               <FileText className="h-5 w-5 text-indigo-600" />
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800">Learners Assignments</h3>
//               <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
//                 <span className="flex items-center gap-1">
//                   <span className="font-medium">Cohort:</span> {cohortName}
//                 </span>
//                 <span className="text-gray-300">•</span>
//                 <span className="flex items-center gap-1">
//                   <span className="font-medium">Learner:</span> {learnerName || data.userName}
//                 </span>
//                 <span className="text-gray-300">•</span>
//                 <span className="flex items-center gap-1">
//                   <span className="font-medium">Total:</span> {totalAssignments}
//                 </span>
//                 <span className="text-gray-300">•</span>
//                 <span className="flex items-center gap-1">
//                   <span className="font-medium">Submitted:</span> {submittedAssignments}
//                 </span>
//                 <span className="text-gray-300">•</span>
//                 <span className="flex items-center gap-1">
//                   <span className="font-medium">Pending:</span> {pendingAssignments}
//                 </span>
//                 <span className="text-gray-300">•</span>
//                 <span className="flex items-center gap-1">
//                   <span className="font-medium">Graded:</span> {gradedAssignments}
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           {/* Progress Summary */}
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <div className="text-sm font-medium text-gray-600">Completion</div>
//               <div className="text-lg font-bold text-gray-800">
//                 {data.assignmentCompletionPercentage?.toFixed(0) || 
//                  (totalAssignments > 0 ? ((gradedAssignments / totalAssignments) * 100).toFixed(0) : '0')}%
//               </div>
//             </div>
//             <div className="w-12 h-12">
//               <div className="relative w-full h-full">
//                 <svg className="w-full h-full" viewBox="0 0 36 36">
//                   <path
//                     d="M18 2.0845
//                       a 15.9155 15.9155 0 0 1 0 31.831
//                       a 15.9155 15.9155 0 0 1 0 -31.831"
//                     fill="none"
//                     stroke="#e5e7eb"
//                     strokeWidth="3"
//                   />
//                   <path
//                     d="M18 2.0845
//                       a 15.9155 15.9155 0 0 1 0 31.831
//                       a 15.9155 15.9155 0 0 1 0 -31.831"
//                     fill="none"
//                     stroke="#4f46e5"
//                     strokeWidth="3"
//                     strokeDasharray={`${data.assignmentCompletionPercentage || 0}, 100`}
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Stats Row */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
//           <div className="bg-blue-50 p-3 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-xs text-blue-600 font-medium">Total Assignments</div>
//                 <div className="text-lg font-bold text-gray-800">{totalAssignments}</div>
//               </div>
//               <FileText className="h-4 w-4 text-blue-500" />
//             </div>
//           </div>
//           <div className="bg-green-50 p-3 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-xs text-green-600 font-medium">Submitted</div>
//                 <div className="text-lg font-bold text-gray-800">{submittedAssignments}</div>
//               </div>
//               <TrendingUp className="h-4 w-4 text-green-500" />
//             </div>
//           </div>
//           <div className="bg-yellow-50 p-3 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-xs text-yellow-600 font-medium">Pending Review</div>
//                 <div className="text-lg font-bold text-gray-800">{pendingAssignments}</div>
//               </div>
//               <Clock className="h-4 w-4 text-yellow-500" />
//             </div>
//           </div>
//           <div className="bg-purple-50 p-3 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-xs text-purple-600 font-medium">Graded</div>
//                 <div className="text-lg font-bold text-gray-800">{gradedAssignments}</div>
//               </div>
//               <CheckCircle className="h-4 w-4 text-purple-500" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Assignments Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               <th className="px-4 py-3">TOPIC</th>
//               <th className="px-4 py-3 min-w-[120px]">Module</th>
//               <th className="px-4 py-3 min-w-[100px]">Submitted Date</th>
//               <th className="px-4 py-3 min-w-[100px]">SCORE</th>
//               <th className="px-4 py-3 min-w-[120px]">STATUS</th>
//               <th className="px-4 py-3 min-w-[80px]">ACTION</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {assignments.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
//                   <div className="flex flex-col items-center gap-2">
//                     <FileText className="h-8 w-8 text-gray-400" />
//                     <div>No assignments found</div>
//                     <div className="text-sm text-gray-400">Assignments will appear here when available</div>
//                   </div>
//                 </td>
//               </tr>
//             ) : (
//               assignments.map((assignment, index) => {
//                 const isExpanded = expandedAssignments.find(
//                   item => item.assignmentId === assignment.assignmentId
//                 )?.isExpanded || false;
                
//                 return (
//                   <React.Fragment key={assignment.assignmentId}>
//                     <motion.tr
//                       initial={{ opacity: 0, y: 10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       {/* TOPIC Column */}
//                       <td className="px-4 py-3">
//                         <div className="max-w-[200px]">
//                           <div className="font-medium text-gray-800 text-sm truncate">
//                             {assignment.subconceptDesc}
//                           </div>
//                           <div className="text-xs text-gray-500 truncate">
//                             {assignment.unitName}
//                           </div>
//                         </div>
//                       </td>

//                       {/* Module Column */}
//                       <td className="px-4 py-3">
//                         <div className="text-sm text-gray-700 min-w-[120px]">
//                           {assignment.stageName}
//                         </div>
//                       </td>

//                       {/* Submitted Date Column */}
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-2 text-sm text-gray-700">
//                           <Calendar className="h-3.5 w-3.5 text-gray-400" />
//                           {formatDate(assignment.submittedDate)}
//                         </div>
//                       </td>

//                       {/* SCORE Column */}
//                       <td className="px-4 py-3">
//                         <div className="text-sm font-medium">
//                           {assignment.status !== 'not_started' ? (
//                             <div className="flex items-center gap-2">
//                               <div className="text-gray-800">
//                                 {assignment.highestScore || 0}/{assignment.subconceptMaxscore}
//                               </div>
//                               {assignment.subconceptMaxscore > 0 && (
//                                 <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
//                                   {(((assignment.highestScore || 0) / assignment.subconceptMaxscore) * 100).toFixed(0)}%
//                                 </div>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="text-gray-400">-- / {assignment.subconceptMaxscore}</span>
//                           )}
//                         </div>
//                       </td>

//                       {/* STATUS Column */}
//                       <td className="px-4 py-3">
//                         <div className="flex flex-col gap-1">
//                           {getStatusBadge(assignment)}
//                           {assignment.status === 'graded' && assignment.correctedDate && (
//                             <div className="text-xs text-gray-500">
//                               Corrected: {formatTableDate(assignment.correctedDate)}
//                             </div>
//                           )}
//                         </div>
//                       </td>

//                       {/* ACTION Column */}
//                       <td className="px-4 py-3">
//                         <button
//                           onClick={() => toggleExpansion(assignment.assignmentId)}
//                           className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
//                           disabled={assignment.status === 'not_started'}
//                         >
//                           {isExpanded ? (
//                             <>
//                               <ChevronUp className="h-3 w-3" />
//                               Hide
//                             </>
//                           ) : (
//                             <>
//                               <ChevronDown className="h-3 w-3" />
//                               Correct
//                             </>
//                           )}
//                         </button>
//                       </td>
//                     </motion.tr>

//                     {/* Expanded Correction Form */}
//                     {isExpanded && assignment.status !== 'not_started' && (
//                       <tr>
//                         <td colSpan={6} className="px-4 py-4 bg-gray-50">
//                           <div className="bg-white border border-gray-200 rounded-lg p-4">
//                             <h4 className="font-medium text-gray-800 mb-4">Correct Assignment</h4>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                               {/* Left Column */}
//                               <div className="space-y-4">
//                                 {/* Submitted File */}
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Submitted File
//                                   </label>
//                                   {assignment.submittedFile ? (
//                                     <a
//                                       href={assignment.submittedFile.downloadUrl}
//                                       target="_blank"
//                                       rel="noopener noreferrer"
//                                       className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                                     >
//                                       <Download className="h-4 w-4" />
//                                       Download Submitted File
//                                     </a>
//                                   ) : (
//                                     <span className="text-gray-400">No file submitted</span>
//                                   )}
//                                 </div>

//                                 {/* References */}
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     References
//                                   </label>
//                                   {renderDependencies(assignment.dependencies || [])}
//                                 </div>
//                               </div>

//                               {/* Right Column */}
//                               <div className="space-y-4">
//                                 {/* Score */}
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Score * <span className="text-gray-500 text-xs">(Max: {assignment.subconceptMaxscore})</span>
//                                   </label>
//                                   <input
//                                     type="number"
//                                     min="0"
//                                     max={assignment.subconceptMaxscore}
//                                     value={correctionData[assignment.assignmentId]?.score || ''}
//                                     onChange={(e) => handleCorrectionChange(assignment.assignmentId, 'score', e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                                     placeholder="Enter score"
//                                   />
//                                 </div>

//                                 {/* Remarks */}
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Remarks *
//                                   </label>
//                                   <textarea
//                                     value={correctionData[assignment.assignmentId]?.remarks || ''}
//                                     onChange={(e) => handleCorrectionChange(assignment.assignmentId, 'remarks', e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                                     rows={3}
//                                     placeholder="Enter remarks"
//                                   />
//                                 </div>

//                                 {/* Correction File */}
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Correction File (Optional)
//                                   </label>
//                                   <div className="flex items-center gap-3">
//                                     <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
//                                       <FileUp className="h-4 w-4" />
//                                       <span>Upload File</span>
//                                       <input
//                                         type="file"
//                                         className="hidden"
//                                         onChange={(e) => handleFileUpload(assignment.assignmentId, e.target.files?.[0] || null)}
//                                       />
//                                     </label>
//                                     {correctionData[assignment.assignmentId]?.file && (
//                                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                                         <FileText className="h-4 w-4" />
//                                         <span>{correctionData[assignment.assignmentId]?.file?.name}</span>
//                                         <button
//                                           onClick={() => handleFileUpload(assignment.assignmentId, null)}
//                                           className="text-red-500 hover:text-red-700"
//                                         >
//                                           <X className="h-3 w-3" />
//                                         </button>
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {/* Date of Correction */}
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Date of Correction
//                                   </label>
//                                   <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
//                                     {new Date().toLocaleDateString('en-US', {
//                                       weekday: 'long',
//                                       year: 'numeric',
//                                       month: 'long',
//                                       day: 'numeric'
//                                     })}
//                                   </div>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <div className="pt-2">
//                                   <button
//                                     onClick={() => handleSubmitCorrection(assignment.assignmentId)}
//                                     disabled={submitting === assignment.assignmentId}
//                                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                   >
//                                     {submitting === assignment.assignmentId ? (
//                                       <>
//                                         <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                                         Submitting...
//                                       </>
//                                     ) : (
//                                       <>
//                                         <Check className="h-4 w-4" />
//                                         Submit Correction
//                                       </>
//                                     )}
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Footer */}
//       {assignments.length > 0 && (
//         <div className="p-4 border-t border-gray-200">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
//             <div>
//               Showing {assignments.length} assignments •
//               <span className="ml-2">
//                 {submittedAssignments} submitted • {gradedAssignments} graded
//               </span>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                 <span>Graded</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
//                 <span>Pending Review</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
//                 <span>Not Started</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </motion.div>
//   );
// }




// // import { FileText, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
// // import type { LearnerDetailedProgress, Stage, Subconcept } from '@/types/mentor.types';
// // import { motion } from 'framer-motion';

// // interface StudentAssignmentsProps {
// //   data: LearnerDetailedProgress;
// //   cohortName?: string;
// //   learnerName?: string;
// //   className?: string;
// // }

// // export default function StudentAssignments({  data,  cohortName,  learnerName, className = '' }: StudentAssignmentsProps) {
  
// //   // Extract all assignment subconcepts (subconceptType starts with "assignment")
// //   const extractAssignments = () => {
// //     const assignments: Array<{
// //       subconceptId: string;
// //       subconceptDesc: string;
// //       subconceptMaxscore: number;
// //       highestScore: number;
// //       attemptCount: number;
// //       lastAttemptDate?: number;
// //       attempts: any[];
// //       stageName: string;
// //       stageId: string;
// //       unitName: string;
// //       subconceptType: string;
// //     }> = [];

// //     data.stages?.forEach((stage: Stage) => {
// //       stage.units?.forEach((unit: any) => {
// //         unit.subconcepts?.forEach((subconcept: Subconcept) => {
// //           if (subconcept.subconceptType?.toLowerCase().includes('assignment')) {
// //             assignments.push({
// //               subconceptId: subconcept.subconceptId,
// //               subconceptDesc: subconcept.subconceptDesc,
// //               subconceptMaxscore: subconcept.subconceptMaxscore,
// //               highestScore: subconcept.highestScore,
// //               attemptCount: subconcept.attemptCount,
// //               lastAttemptDate: subconcept.lastAttemptDate,
// //               attempts: subconcept.attempts || [],
// //               stageName: stage.stageName,
// //               stageId: stage.stageId,
// //               unitName: unit.unitName,
// //               subconceptType: subconcept.subconceptType,
// //             });
// //           }
// //         });
// //       });
// //     });

// //     return assignments;
// //   };

// //   const assignments = extractAssignments();
  
// //   // Calculate summary statistics
// //   const totalAssignments = data.totalAssignments || assignments.length;
// //   const attemptedAssignments = assignments.filter(a => a.attemptCount > 0).length;
// //   const correctedAssignments = assignments.filter(a => {
// //     // Check if assignment has been corrected (has attempts and highestScore > 0)
// //     return a.attemptCount > 0 && a.highestScore > 0;
// //   }).length;
// //   const pendingAssignments = attemptedAssignments - correctedAssignments;

// //   // Format date
// //   const formatDate = (timestamp?: number) => {
// //     if (!timestamp) return 'Not submitted';
    
// //     const date = new Date(timestamp * 1000);
// //     const now = new Date();
// //     const diffTime = Math.abs(now.getTime() - date.getTime());
// //     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
// //     if (diffDays === 0) {
// //       return 'Today';
// //     } else if (diffDays === 1) {
// //       return 'Yesterday';
// //     } else if (diffDays < 7) {
// //       return `${diffDays} days ago`;
// //     } else {
// //       return date.toLocaleDateString('en-US', { 
// //         month: 'short', 
// //         day: 'numeric',
// //         year: 'numeric'
// //       });
// //     }
// //   };

// //   // Format date for table
// //   const formatTableDate = (timestamp?: number) => {
// //     if (!timestamp) return '--';
// //     const date = new Date(timestamp * 1000);
// //     return date.toLocaleDateString('en-US', { 
// //       month: 'short', 
// //       day: 'numeric',
// //       year: '2-digit'
// //     });
// //   };

// //   // Get status badge
// //   const getStatusBadge = (assignment: any) => {
// //     if (assignment.attemptCount === 0) {
// //       return (
// //         <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
// //           Not Started
// //         </span>
// //       );
// //     }
    
// //     if (assignment.highestScore > 0) {
// //       return (
// //         <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
// //           <CheckCircle className="h-3 w-3" />
// //           Corrected
// //         </span>
// //       );
// //     }
    
// //     return (
// //       <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
// //         <Clock className="h-3 w-3" />
// //         Pending
// //       </span>
// //     );
// //   };

// //   // Get corrected date
// //   const getCorrectedDate = (assignment: any) => {
// //     if (assignment.attemptCount === 0) return '--';
// //     if (assignment.highestScore === 0) return 'Awaiting correction';
    
// //     const lastAttempt = assignment.attempts?.[0];
// //     if (!lastAttempt) return '--';
    
// //     return formatTableDate(lastAttempt.endTimestamp);
// //   };

// //   return (
// //     <motion.div 
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.3 }}
// //       className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
// //     >
// //       {/* Header with Stats */}
// //       <div className="p-4 border-b border-gray-200">
// //         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
// //           <div className="flex items-center gap-3">
// //             <div className="p-2 bg-indigo-50 rounded-lg">
// //               <FileText className="h-5 w-5 text-indigo-600" />
// //             </div>
// //             <div>
// //               <h3 className="text-lg font-semibold text-gray-800">Learners Assignments</h3>
// //               <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
// //                 <span className="flex items-center gap-1">
// //                   <span className="font-medium">Cohort:</span> {cohortName}
// //                 </span>
// //                 <span className="text-gray-300">•</span>
// //                 <span className="flex items-center gap-1">
// //                   <span className="font-medium">Learner:</span> {learnerName || data.userName}
// //                 </span>
// //                 <span className="text-gray-300">•</span>
// //                 <span className="flex items-center gap-1">
// //                   <span className="font-medium">Total:</span> {totalAssignments}
// //                 </span>
// //                 <span className="text-gray-300">•</span>
// //                 <span className="flex items-center gap-1">
// //                   <span className="font-medium">Submitted:</span> {attemptedAssignments}
// //                 </span>
// //                 <span className="text-gray-300">•</span>
// //                 <span className="flex items-center gap-1">
// //                   <span className="font-medium">Pending:</span> {pendingAssignments}
// //                 </span>
// //                 <span className="text-gray-300">•</span>
// //                 <span className="flex items-center gap-1">
// //                   <span className="font-medium">Graded:</span> {correctedAssignments}
// //                 </span>
// //               </div>
// //             </div>
// //           </div>
          
// //           {/* Progress Summary */}
// //           <div className="flex items-center gap-3">
// //             <div className="text-right">
// //               <div className="text-sm font-medium text-gray-600">Completion</div>
// //               <div className="text-lg font-bold text-gray-800">
// //                 {data.assignmentCompletionPercentage?.toFixed(0) || 
// //                  (totalAssignments > 0 ? ((correctedAssignments / totalAssignments) * 100).toFixed(0) : '0')}%
// //               </div>
// //             </div>
// //             <div className="w-12 h-12">
// //               <div className="relative w-full h-full">
// //                 <svg className="w-full h-full" viewBox="0 0 36 36">
// //                   <path
// //                     d="M18 2.0845
// //                       a 15.9155 15.9155 0 0 1 0 31.831
// //                       a 15.9155 15.9155 0 0 1 0 -31.831"
// //                     fill="none"
// //                     stroke="#e5e7eb"
// //                     strokeWidth="3"
// //                   />
// //                   <path
// //                     d="M18 2.0845
// //                       a 15.9155 15.9155 0 0 1 0 31.831
// //                       a 15.9155 15.9155 0 0 1 0 -31.831"
// //                     fill="none"
// //                     stroke="#4f46e5"
// //                     strokeWidth="3"
// //                     strokeDasharray={`${data.assignmentCompletionPercentage || 0}, 100`}
// //                   />
// //                 </svg>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Quick Stats Row */}
// //         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
// //           <div className="bg-blue-50 p-3 rounded-lg">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <div className="text-xs text-blue-600 font-medium">Total Assignments</div>
// //                 <div className="text-lg font-bold text-gray-800">{totalAssignments}</div>
// //               </div>
// //               <FileText className="h-4 w-4 text-blue-500" />
// //             </div>
// //           </div>
// //           <div className="bg-green-50 p-3 rounded-lg">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <div className="text-xs text-green-600 font-medium">Submitted</div>
// //                 <div className="text-lg font-bold text-gray-800">{attemptedAssignments}</div>
// //               </div>
// //               <TrendingUp className="h-4 w-4 text-green-500" />
// //             </div>
// //           </div>
// //           <div className="bg-yellow-50 p-3 rounded-lg">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <div className="text-xs text-yellow-600 font-medium">Pending Review</div>
// //                 <div className="text-lg font-bold text-gray-800">{pendingAssignments}</div>
// //               </div>
// //               <Clock className="h-4 w-4 text-yellow-500" />
// //             </div>
// //           </div>
// //           <div className="bg-purple-50 p-3 rounded-lg">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <div className="text-xs text-purple-600 font-medium">Graded</div>
// //                 <div className="text-lg font-bold text-gray-800">{correctedAssignments}</div>
// //               </div>
// //               <CheckCircle className="h-4 w-4 text-purple-500" />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Assignments Table */}
// //       <div className="overflow-x-auto">
// //         <table className="w-full">
// //           <thead className="bg-gray-50">
// //             <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //               <th className="px-4 py-3">TOPIC</th>
// //               <th className="px-4 py-3 min-w-[120px]">Module</th>
// //               <th className="px-4 py-3 min-w-[100px]">Submitted Date</th>
// //               <th className="px-4 py-3 min-w-[100px]">SCORE</th>
// //               <th className="px-4 py-3 min-w-[120px]">STATUS</th>
// //             </tr>
// //           </thead>
// //           <tbody className="divide-y divide-gray-200">
// //             {assignments.length === 0 ? (
// //               <tr>
// //                 <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
// //                   <div className="flex flex-col items-center gap-2">
// //                     <FileText className="h-8 w-8 text-gray-400" />
// //                     <div>No assignments found</div>
// //                     <div className="text-sm text-gray-400">Assignments will appear here when available</div>
// //                   </div>
// //                 </td>
// //               </tr>
// //             ) : (
// //               assignments.map((assignment, index) => (
// //                 <motion.tr
// //                   key={assignment.subconceptId}
// //                   initial={{ opacity: 0, y: 10 }}
// //                   animate={{ opacity: 1, y: 0 }}
// //                   transition={{ delay: index * 0.05 }}
// //                   className="hover:bg-gray-50 transition-colors"
// //                 >
// //                   {/* TOPIC Column */}
// //                   <td className="px-4 py-3">
// //                     <div className="max-w-[200px]">
// //                       <div className="font-medium text-gray-800 text-sm truncate">
// //                         {assignment.subconceptDesc}
// //                       </div>
// //                       <div className="text-xs text-gray-500 truncate">
// //                         {assignment.unitName}
// //                       </div>
// //                     </div>
// //                   </td>

// //                   {/* Module Column */}
// //                   <td className="px-4 py-3">
// //                     <div className="text-sm text-gray-700 min-w-[120px]">
// //                       {assignment.stageName}
// //                     </div>
// //                   </td>

// //                   {/* Submitted Date Column */}
// //                   <td className="px-4 py-3">
// //                     <div className="flex items-center gap-2 text-sm text-gray-700">
// //                       <Calendar className="h-3.5 w-3.5 text-gray-400" />
// //                       {formatDate(assignment.lastAttemptDate)}
// //                     </div>
// //                   </td>

// //                   {/* SCORE Column */}
// //                   <td className="px-4 py-3">
// //                     <div className="text-sm font-medium">
// //                       {assignment.attemptCount > 0 ? (
// //                         <div className="flex items-center gap-2">
// //                           <div className="text-gray-800">
// //                             {assignment.highestScore}/{assignment.subconceptMaxscore}
// //                           </div>
// //                           {assignment.subconceptMaxscore > 0 && (
// //                             <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
// //                               {((assignment.highestScore / assignment.subconceptMaxscore) * 100).toFixed(0)}%
// //                             </div>
// //                           )}
// //                         </div>
// //                       ) : (
// //                         <span className="text-gray-400">-- / {assignment.subconceptMaxscore}</span>
// //                       )}
// //                     </div>
// //                   </td>

// //                   {/* STATUS Column */}
// //                   <td className="px-4 py-3">
// //                     <div className="flex flex-col gap-1">
// //                       {getStatusBadge(assignment)}
// //                       {assignment.highestScore > 0 && (
// //                         <div className="text-xs text-gray-500">
// //                           Corrected: {getCorrectedDate(assignment)}
// //                         </div>
// //                       )}
// //                     </div>
// //                   </td>
// //                 </motion.tr>
// //               ))
// //             )}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Footer */}
// //       {assignments.length > 0 && (
// //         <div className="p-4 border-t border-gray-200">
// //           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
// //             <div>
// //               Showing {assignments.length} assignments •
// //               <span className="ml-2">
// //                 {attemptedAssignments} submitted • {correctedAssignments} graded
// //               </span>
// //             </div>
// //             <div className="flex items-center gap-4">
// //               <div className="flex items-center gap-2">
// //                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
// //                 <span>Corrected</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
// //                 <span>Pending</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
// //                 <span>Not Started</span>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </motion.div>
// //   );
// // }