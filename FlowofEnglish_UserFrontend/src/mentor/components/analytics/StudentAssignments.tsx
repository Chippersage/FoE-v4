import { useUserContext } from '@/context/AuthContext';
import { submitCorrectedAssignment } from '@/mentor/mentor-api';
import type { Assignment, LearnerDetailedProgress, Stage, Subconcept, SubmitCorrectionParams, UserAssignmentsResponse } from '@/types/mentor.types';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Check, CheckCircle, ChevronDown, ChevronUp, Clock, Download, FileText, FileUp, Info, MoreVertical, Pause, Play, TrendingUp, X, 
  ExternalLink } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// Import React Paginate for modern pagination
import ReactPaginate from 'react-paginate';

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

interface ToastNotification {
  id: string;
  message: string;
  type: 'error' | 'success';
  visible: boolean;
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

// Toast Notification Component
const ToastNotification = ({ notification, onClose }: { 
  notification: ToastNotification; 
  onClose: (id: string) => void;
}) => {
  const { id, message, type, visible } = notification;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose(id);
      }, 5000); // Auto-close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible, id, onClose]);

  if (!visible) return null;

  const isError = type === 'error';
  const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = isError ? 'text-red-700' : 'text-green-700';
  const icon = isError ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`fixed top-6 right-6 z-50 max-w-md w-full md:w-auto border rounded-lg shadow-lg ${bgColor} p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${textColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Toast Container Component
const ToastContainer = ({ notifications, onClose }: { 
  notifications: ToastNotification[]; 
  onClose: (id: string) => void;
}) => {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Simple Image Popup Component
const SimpleImagePopup = ({ src, onClose }: { src: string | null; onClose: () => void }) => {
  if (!src) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      <img 
        src={src} 
        alt="Enlarged view" 
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Content Viewer Modal for HTML/References
const ContentViewerModal = ({ url, onClose }: { url: string | null; onClose: () => void }) => {
  if (!url) return null;

  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  const isPdf = url.match(/\.pdf$/i);
  const isAudio = url.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i);
  const isVideo = url.match(/\.(mp4|mov|avi|mkv|webm)$/i);

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Reference Content</h3>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4" />
            Open in new tab
          </a>
        </div>
        
        <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
          {isImage ? (
            <img 
              src={url} 
              alt="Reference" 
              className="max-w-full max-h-full mx-auto object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={`${url}#view=fitH`}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : isAudio ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-full max-w-lg">
                <div className="text-center mb-4">
                  <div className="text-lg font-medium text-gray-800">Audio Reference</div>
                  <div className="text-sm text-gray-600 mt-1">Click play to listen</div>
                </div>
                <audio
                  controls
                  className="w-full"
                  controlsList="nodownload"
                >
                  <source src={url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          ) : isVideo ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-full max-w-4xl">
                <video
                  controls
                  className="w-full rounded-lg"
                  controlsList="nodownload"
                >
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title="HTML Content"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Fixed Audio Player Component - No duplicate controls
const InlineAudioPlayer = ({ src, fileName }: { src: string; fileName: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // audio element and only show our custom controls
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={togglePlay}
        className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 truncate">{fileName}</div>
        <div className="flex items-center gap-2 mt-1">
          <audio
            ref={audioRef}
            src={src}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="0"
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            onChange={(e) => {
              if (audioRef.current) {
                const time = (parseInt(e.target.value) / 100) * audioRef.current.duration;
                audioRef.current.currentTime = time || 0;
              }
            }}
            onMouseDown={() => {
              if (audioRef.current && !isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
          />
        </div>
      </div>
      
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Audio options"
        >
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </button>
        
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <a
                href={src}
                download={fileName}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                onClick={() => setShowMenu(false)}
              >
                <Download className="h-4 w-4" />
                Download Audio
              </a>
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    if (!isPlaying) {
                      audioRef.current.play();
                      setIsPlaying(true);
                    }
                  }
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg w-full text-left"
              >
                <Play className="h-4 w-4" />
                Restart Audio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

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
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Add toast notification
  const addToast = (message: string, type: 'error' | 'success' = 'error') => {
    const id = Date.now().toString();
    const newToast: ToastNotification = {
      id,
      message,
      type,
      visible: true
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  // Remove toast notification
  const removeToast = (id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, visible: false } : toast
    ));
    
    // Remove from array after fade out animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  };

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

  // Pagination setup
  const pageCount = Math.ceil(assignments.length / itemsPerPage);
  const offset = pageNumber * itemsPerPage;
  const paginatedAssignments = assignments.slice(offset, offset + itemsPerPage);

  // Enhanced file category detection
  const getFileCategory = (fileType?: string, fileName?: string) => {
    const type = fileType || '';
    const name = (fileName || '').toLowerCase();

    if (type.startsWith('audio') || name.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/)) return 'audio';
    if (type.startsWith('image') || name.match(/\.(png|jpg|jpeg|webp|gif|bmp|svg)$/)) return 'image';
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (type.startsWith('video') || name.match(/\.(mp4|mov|avi|mkv|webm)$/)) return 'video';
    
    // Documents
    if (type.includes('word') || name.match(/\.(doc|docx)$/)) return 'word';
    if (type.includes('excel') || name.match(/\.(xls|xlsx)$/)) return 'excel';
    if (type.includes('powerpoint') || name.match(/\.(ppt|pptx)$/)) return 'powerpoint';
    if (type.includes('text') || name.match(/\.(txt|rtf)$/)) return 'text';

    return 'other';
  };

  // Enhanced Submitted File Viewer with inline rendering
  const SubmittedFileViewer = ({ file }: { file: any }) => {
    const category = getFileCategory(file?.fileType, file?.fileName);

    if (!file?.downloadUrl) return <span className="text-gray-400">No file</span>;

    switch (category) {
      case 'audio':
        return (
          <div className="mt-2">
            <InlineAudioPlayer src={file.downloadUrl} fileName={file.fileName} />
          </div>
        );

      case 'image':
        return (
          <div className="mt-2">
            <img
              src={file.downloadUrl}
              alt={file.fileName}
              className="max-h-[200px] rounded-lg cursor-pointer shadow hover:shadow-md transition-shadow"
              onClick={() => setPreviewImage(file.downloadUrl)}
            />
            <div className="text-xs text-gray-500 mt-1">
              Click to enlarge
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="mt-2">
            <iframe
              src={`${file.downloadUrl}#view=fitH`}
              className="w-full h-[300px] rounded border shadow-sm"
              title={file.fileName}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">{file.fileName}</span>
              <a
                href={file.downloadUrl}
                download
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="h-3 w-3" />
                Download
              </a>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="mt-2">
            <video
              controls
              className="w-full rounded-lg"
              controlsList="nodownload"
            >
              <source src={file.downloadUrl} type={file.fileType} />
              Your browser does not support the video tag.
            </video>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">{file.fileName}</span>
              <a
                href={file.downloadUrl}
                download
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="h-3 w-3" />
                Download
              </a>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-700">{file.fileName}</div>
                <div className="text-xs text-gray-500">
                  {file.fileType} • {(file.fileSize / 1024).toFixed(1)}KB
                </div>
              </div>
            </div>
            <a
              href={file.downloadUrl}
              download
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        );
    }
  };

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
          Yet to Start
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

  // Check if submit button should be enabled
  const isSubmitEnabled = (assignmentId: string) => {
    const correction = correctionData[assignmentId];
    if (!correction) return false;
    
    const hasScore = correction.score && correction.score.trim() !== '';
    const hasRemarks = correction.remarks && correction.remarks.trim() !== '';
    
    return hasScore && hasRemarks;
  };

  // Enhanced toggle expansion with better view management
  const toggleExpansion = (assignmentId: string) => {
    // If clicking on already expanded, close it
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(null);
      setExpandedAssignments(prev =>
        prev.map(item =>
          item.assignmentId === assignmentId
            ? { ...item, isExpanded: false }
            : item
        )
      );
    } else {
      // Close any previously expanded and open new one
      setSelectedAssignmentId(assignmentId);
      setExpandedAssignments(prev =>
        prev.map(item =>
          item.assignmentId === assignmentId
            ? { ...item, isExpanded: true }
            : { ...item, isExpanded: false }
        )
      );
    }
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
        
        // Show toast notification for file error
        addToast(validationError, 'error');
        
        // Clear error after 5 seconds
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
    return date.toISOString();
  };

  // Submit correction
  const handleSubmitCorrection = async (assignmentId: string) => {
    const validationError = validateCorrection(assignmentId);
    if (validationError) {
      // Show toast notification for validation error
      addToast(validationError, 'error');
      return;
    }

    setSubmitting(assignmentId);

    try {
      const assignment = assignments.find(a => a.assignmentId === assignmentId);
      const correction = correctionData[assignmentId];

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const params: SubmitCorrectionParams = {
        score: parseFloat(correction.score),
        remarks: correction.remarks,
        correctedDate: formatDateForBackend(new Date()),
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
      setSelectedAssignmentId(null);

      // Show success toast
      addToast('Correction submitted successfully!', 'success');

    } catch (err: any) {
      // Show error toast
      addToast(err.message || 'Failed to submit correction', 'error');
    } finally {
      setSubmitting(null);
    }
  };

  // Handle page change for pagination
  const handlePageClick = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
    // Scroll to top of table
    const tableElement = document.querySelector('.assignments-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Enhanced Render Dependencies - Opens content in modal on same page
  const renderDependencies = (dependencies: any[]) => {
    if (!dependencies || dependencies.length === 0) {
      return <span className="text-gray-400">No dependencies</span>;
    }

    const handleReferenceClick = (url: string, e: React.MouseEvent) => {
      e.preventDefault();
      setPreviewContent(url);
    };

    return (
      <div className="space-y-1">
        {dependencies.map((dep, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{dep.subconceptDesc}</span>
            <button
              onClick={(e) => handleReferenceClick(dep.subconceptLink, e)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              View Reference
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Render file info section
  const renderFileInfo = () => {
    const allowed = [
      `PDF (${formatBytes(MAX_FILE_SIZES.PDF)})`,
      `Images (${formatBytes(MAX_FILE_SIZES.IMAGE)})`,
      `Audio (${formatBytes(MAX_FILE_SIZES.AUDIO)})`,
      `Video (${formatBytes(MAX_FILE_SIZES.VIDEO)})`,
      `Docs (${formatBytes(MAX_FILE_SIZES.DOCUMENT)})`,
    ].join(', ');

    return (
      <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1 flex items-center gap-1">
        <Info className="h-3 w-3" />
        <span>
          <b>Allowed:</b> {allowed}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer
        notifications={toasts}
        onClose={removeToast}
      />

      {/* Image Preview Popup */}
      {previewImage && (
        <SimpleImagePopup
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Content Viewer Modal for References */}
      {previewContent && (
        <ContentViewerModal
          url={previewContent}
          onClose={() => setPreviewContent(null)}
        />
      )}

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
        <div className="overflow-x-auto assignments-table">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">TOPIC</th>
                <th className="px-4 py-3 min-w-[120px]">Session</th>
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
                paginatedAssignments.map((assignment, index) => {
                  const isExpanded = expandedAssignments.find(
                    item => item.assignmentId === assignment.assignmentId
                  )?.isExpanded || false;
                  const correction = correctionData[assignment.assignmentId];
                  
                  return (
                    <React.Fragment key={assignment.assignmentId}>
                      {/* Main table row with highlighted background when expanded */}
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`transition-colors ${isExpanded ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}
                      >
                        {/* TOPIC Column */}
                        <td className="px-4 py-3">
                          <div className="max-w-[200px]">
                            <div className="font-medium text-gray-800 text-sm truncate">
                              {assignment.subconceptDesc}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {assignment.stageName}
                            </div>
                          </div>
                        </td>

                        {/* Session Column */}
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700 min-w-[120px]">
                            {assignment.unitName}
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
                            className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                              isExpanded 
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
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
                                {assignment.status === 'graded' ? 'View' : 'Evaluate'}
                              </>
                            )}
                          </button>
                        </td>
                      </motion.tr>

                      {/* Expanded Correction Form - Optimized View */}
                      {isExpanded && assignment.status !== 'not_started' && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 bg-blue-50/30">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3 }}
                              className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-gray-800 text-sm">
                                  {assignment.status === 'graded' ? 'Evaluation Details' : 'Correct Assignment'}
                                </h4>
                                {assignment.status === 'graded' && (
                                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                    Already Graded
                                  </span>
                                )}
                              </div>
                              
                              {/* Compact layout */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Column 1: Submitted File */}
                                <div className="lg:col-span-1">
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Submitted File
                                      </label>
                                      {assignment.submittedFile ? (
                                        <SubmittedFileViewer file={assignment.submittedFile} />
                                      ) : (
                                        <span className="text-sm text-gray-400">No file submitted</span>
                                      )}
                                    </div>

                                    {/* References */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        References
                                      </label>
                                      {renderDependencies(assignment.dependencies || [])}
                                    </div>
                                  </div>
                                </div>

                                {/* Column 2: Grading Form */}
                                <div className="lg:col-span-2 space-y-4">
                                  {/* Score and Remarks Row */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Score */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Score <span className="text-red-500">*</span>
                                        <span className="text-gray-500 text-xs"> (Max: {assignment.subconceptMaxscore})</span>
                                      </label>
                                      {assignment.status === 'graded' ? (
                                        <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">
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
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                          placeholder="Enter score"
                                        />
                                      )}
                                    </div>

                                    {/* Date */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Date
                                      </label>
                                      <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-600">
                                        {assignment.status === 'graded' && assignment.correctedDate 
                                          ? formatTableDate(assignment.correctedDate)
                                          : new Date().toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Remarks */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Remarks <span className="text-red-500">*</span>
                                    </label>
                                    {assignment.status === 'graded' ? (
                                      <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700 min-h-[60px]">
                                        {assignment.remarks || 'No remarks provided'}
                                      </div>
                                    ) : (
                                      <textarea
                                        value={correction?.remarks || ''}
                                        onChange={(e) => handleCorrectionChange(assignment.assignmentId, 'remarks', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        rows={2}
                                        placeholder="Enter remarks"
                                      />
                                    )}
                                  </div>

                                  {/* Correction File and Submit Row */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    {/* Correction File */}
                                    {assignment.status !== 'graded' && (
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Correction File (Optional)
                                        </label>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                                              <FileUp className="h-3 w-3" />
                                              <span>Upload</span>
                                              <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(assignment.assignmentId, e.target.files?.[0] || null)}
                                                accept={ALLOWED_FILE_TYPES.join(',')}
                                              />
                                            </label>
                                            {correction?.file && (
                                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <span className="truncate max-w-[100px]">{correction.file.name}</span>
                                                <button
                                                  onClick={() => handleFileUpload(assignment.assignmentId, null)}
                                                  className="text-red-500 hover:text-red-700"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                          {renderFileInfo()}
                                        </div>
                                      </div>
                                    )}

                                    {/* Submit Button - Disabled until score and remarks are filled */}
                                    {assignment.status !== 'graded' && (
                                      <div>
                                        <button
                                          onClick={() => handleSubmitCorrection(assignment.assignmentId)}
                                          disabled={!isSubmitEnabled(assignment.assignmentId) || submitting === assignment.assignmentId}
                                          className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                                            isSubmitEnabled(assignment.assignmentId)
                                              ? 'bg-green-600 text-white hover:bg-green-700'
                                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                          } ${submitting === assignment.assignmentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                          {submitting === assignment.assignmentId ? (
                                            <>
                                              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                              Submitting...
                                            </>
                                          ) : (
                                            <>
                                              <Check className="h-3 w-3" />
                                              Submit Correction
                                            </>
                                          )}
                                        </button>
                                        {!isSubmitEnabled(assignment.assignmentId) && (
                                          <div className="text-xs text-gray-500 mt-1 text-center">
                                            Fill score and remarks to enable submit
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Corrected File Display */}
                                    {assignment.status === 'graded' && assignment.correctedFile && (
                                      <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                          Corrected File
                                        </label>
                                        <a
                                          href={assignment.correctedFile.downloadUrl}
                                          download
                                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                        >
                                          <Download className="h-3 w-3" />
                                          Download Corrected File
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
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

        {/* Pagination */}
        {assignments.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{offset + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(offset + itemsPerPage, assignments.length)}
                </span>{' '}
                of <span className="font-medium">{assignments.length}</span> assignments
              </div>
              
              <ReactPaginate
                previousLabel={
                  <span className="flex items-center gap-1 text-sm">
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    Previous
                  </span>
                }
                nextLabel={
                  <span className="flex items-center gap-1 text-sm">
                    Next
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </span>
                }
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="flex items-center gap-1"
                pageClassName=""
                pageLinkClassName="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-700"
                activeClassName=""
                activeLinkClassName="px-3 py-1.5 text-sm rounded bg-blue-50 border border-blue-200 text-blue-600 font-medium"
                previousClassName="mr-2"
                nextClassName="ml-2"
                previousLinkClassName="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-1"
                nextLinkClassName="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center gap-1"
                disabledClassName="opacity-50 cursor-not-allowed"
                disabledLinkClassName="hover:bg-transparent"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {/* {assignments.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{assignments.length}</span> assignments •
                <span className="ml-2">
                  <span className="font-medium">{submittedAssignments}</span> submitted •{' '}
                  <span className="font-medium">{gradedAssignments}</span> graded •{' '}
                  <span className="font-medium">{pendingAssignments}</span> pending
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Graded</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-xs">Not Started</span>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </motion.div>
    </>
  );
}