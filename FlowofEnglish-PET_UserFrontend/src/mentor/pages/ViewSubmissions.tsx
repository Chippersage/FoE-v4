// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, ArrowPathRoundedSquareIcon, DocumentArrowDownIcon, EyeIcon, ArrowUpTrayIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon,
  ArrowTopRightOnSquareIcon, XMarkIcon, DocumentArrowUpIcon, CalendarIcon, ClockIcon, CheckIcon, InformationCircleIcon,
  PlayIcon, PauseIcon, DocumentIcon, PhotoIcon, MusicalNoteIcon, VideoCameraIcon, DocumentTextIcon, XCircleIcon
} from "@heroicons/react/24/outline";
import { fetchCohortAssignments, submitCorrectedAssignment } from "../mentor-api";
import type { CohortAssignment, CohortAssignmentsResponse, SubmitCorrectionParams } from "../mentor.types";

// Import React Paginate for modern pagination
import ReactPaginate from "react-paginate";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "video/webm",
  "video/ogg",
];

// File size limits by category
const MAX_FILE_SIZES = {
  PDF: 1 * 1024 * 1024,
  IMAGE: 1 * 1024 * 1024,
  AUDIO: 10 * 1024 * 1024,
  VIDEO: 30 * 1024 * 1024,
  DOCUMENT: 5 * 1024 * 1024,
};

interface ToastNotification {
  id: string;
  message: string;
  type: "error" | "success";
  visible: boolean;
}

interface CorrectionData {
  [assignmentId: string]: {
    score: string;
    remarks: string;
    file: File | null;
    fileError?: string;
  };
}

interface ExpandedAssignment {
  assignmentId: string;
  isExpanded: boolean;
}

// ==================== COMPONENTS ====================

const ToastNotification = ({
  notification,
  onClose,
}: {
  notification: ToastNotification;
  onClose: (id: string) => void;
}) => {
  const { id, message, type, visible } = notification;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose(id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, id, onClose]);

  if (!visible) return null;

  const isError = type === "error";
  const bgColor = isError
    ? "bg-red-50 border-red-200"
    : "bg-green-50 border-green-200";
  const textColor = isError ? "text-red-700" : "text-green-700";

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
          {isError ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <CheckCircleIcon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const ToastContainer = ({
  notifications,
  onClose,
}: {
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
        <XMarkIcon className="h-6 w-6" />
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
        <XMarkIcon className="h-6 w-6" />
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
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
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

// Inline Audio Player Component
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

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={togglePlay}
        className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex-shrink-0"
      >
        {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
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
          <ChevronDownIcon className="h-4 w-4 text-gray-600" />
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
                <DocumentArrowDownIcon className="h-4 w-4" />
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
                <PlayIcon className="h-4 w-4" />
                Restart Audio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// File Viewer Component
const SubmittedFileViewer = ({ file }: { file: any }) => {
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

  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
          {previewImage && (
            <SimpleImagePopup
              src={previewImage}
              onClose={() => setPreviewImage(null)}
            />
          )}
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
              <DocumentArrowDownIcon className="h-3 w-3" />
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
              <DocumentArrowDownIcon className="h-3 w-3" />
              Download
            </a>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
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
            <DocumentArrowDownIcon className="h-4 w-4" />
            Download
          </a>
        </div>
      );
  }
};

// Dependencies Renderer
const DependenciesRenderer = ({ dependencies, onViewReference }: { 
  dependencies: any[]; 
  onViewReference: (url: string) => void;
}) => {
  if (!dependencies || dependencies.length === 0) {
    return <span className="text-gray-400">No dependencies</span>;
  }

  return (
    <div className="space-y-1">
      {dependencies.map((dep, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{dep.subconceptDesc}</span>
          <button
            onClick={() => onViewReference(dep.subconceptLink)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            View Reference
          </button>
        </div>
      ))}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const ViewSubmissions: React.FC = () => {
  const navigate = useNavigate();

  const selected = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedCohortWithProgram") || "{}");
    } catch {
      return {};
    }
  }, []);

  const cohortId = selected?.cohortId;
  const cohortName = selected?.cohortName;
  const programId = selected?.program?.programId;

  const [assignments, setAssignments] = useState<CohortAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    correctedAssignments: 0,
    pendingAssignments: 0,
    cohortUserCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("userName");
  const [sortOrderAsc, setSortOrderAsc] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [correctionData, setCorrectionData] = useState<CorrectionData>({});
  const [expandedAssignments, setExpandedAssignments] = useState<ExpandedAssignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const addToast = (message: string, type: "error" | "success" = "error") => {
    const id = Date.now().toString();
    const newToast: ToastNotification = {
      id,
      message,
      type,
      visible: true,
    };
    
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 300);
  };

  useEffect(() => {
    if (!cohortId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchCohortAssignments(cohortId);
        if (!cancelled) {
          setAssignments(response.assignments);
          setStats(response.statistics);
          
          const initialCorrectionData: CorrectionData = {};
          response.assignments.forEach((assignment) => {
            initialCorrectionData[assignment.assignmentId] = {
              score: assignment.score?.toString() || "",
              remarks: assignment.remarks || "",
              file: null,
            };
          });
          setCorrectionData(initialCorrectionData);
          
          // Initialize expanded state
          setExpandedAssignments(response.assignments.map(assignment => ({
            assignmentId: assignment.assignmentId,
            isExpanded: false
          })));
        }
      } catch (err: any) {
        console.error("Error fetching submissions:", err);
        addToast(err.message || "Failed to fetch assignments", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [cohortId]);

  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = assignments.filter((a) => {
      if (!q) return true;
      return (
        String(a.user.userId).toLowerCase().includes(q) ||
        String(a.user.userName).toLowerCase().includes(q) ||
        String(a.subconcept.subconceptDesc).toLowerCase().includes(q) ||
        String(a.program.programName).toLowerCase().includes(q)
      );
    });

    list.sort((x, y) => {
      let a, b;
      
      switch (sortBy) {
        case "userName":
          a = x.user.userName.toLowerCase();
          b = y.user.userName.toLowerCase();
          break;
        case "topic":
          a = x.subconcept.subconceptDesc.toLowerCase();
          b = y.subconcept.subconceptDesc.toLowerCase();
          break;
        case "submittedDate":
          a = x.submittedDate;
          b = y.submittedDate;
          break;
        case "status":
          const xCorrected = Boolean(x.correctedDate);
          const yCorrected = Boolean(y.correctedDate);
          if (xCorrected && !yCorrected) return sortOrderAsc ? -1 : 1;
          if (!xCorrected && yCorrected) return sortOrderAsc ? 1 : -1;
          a = x.submittedDate;
          b = y.submittedDate;
          break;
        case "score":
          const xScore = x.score ?? -1;
          const yScore = y.score ?? -1;
          return sortOrderAsc ? xScore - yScore : yScore - xScore;
        default:
          a = x.user.userId.toLowerCase();
          b = y.user.userId.toLowerCase();
      }
      
      if (a < b) return sortOrderAsc ? -1 : 1;
      if (a > b) return sortOrderAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [assignments, searchQuery, sortBy, sortOrderAsc]);

  const pageCount = Math.ceil(filteredSorted.length / itemsPerPage);
  const offset = pageNumber * itemsPerPage;
  const paginatedAssignments = filteredSorted.slice(offset, offset + itemsPerPage);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrderAsc(!sortOrderAsc);
    } else {
      setSortBy(field);
      setSortOrderAsc(true);
    }
  };

  const handleCorrectionChange = (
    assignmentId: string,
    field: "score" | "remarks",
    value: string
  ) => {
    setCorrectionData((prev) => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] || { score: "", remarks: "", file: null }),
        [field]: value,
      },
    }));
  };

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
    let maxSize = MAX_FILE_SIZES.DOCUMENT;
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
        
        addToast(validationError, 'error');
        
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

    setCorrectionData((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        file,
        fileError: undefined
      },
    }));
  };

  const handleReset = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.assignmentId === assignmentId);
    if (assignment) {
      setCorrectionData((prev) => ({
        ...prev,
        [assignmentId]: {
          score: assignment.score?.toString() || "",
          remarks: assignment.remarks || "",
          file: null,
        },
      }));
    }
  };

  const isSubmitEnabled = (assignmentId: string) => {
    const correction = correctionData[assignmentId];
    if (!correction) return false;
    
    const hasScore = correction.score && correction.score.trim() !== '';
    const hasRemarks = correction.remarks && correction.remarks.trim() !== '';
    
    return hasScore && hasRemarks;
  };

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
    
    if (assignment?.subconcept.subconceptMaxscore && scoreNum > assignment.subconcept.subconceptMaxscore) {
      return `Score cannot exceed ${assignment.subconcept.subconceptMaxscore}`;
    }
    
    if (!correction.remarks || !correction.remarks.trim()) {
      return 'Remarks are required';
    }

    if (correction.fileError) {
      return correction.fileError;
    }
    
    return null;
  };

  const handleSave = async (assignmentId: string) => {
    const assignment = assignments.find((a) => a.assignmentId === assignmentId);
    if (!assignment) {
      addToast("Assignment not found", "error");
      return;
    }

    const validationError = validateCorrection(assignmentId);
    if (validationError) {
      addToast(validationError, "error");
      return;
    }

    const correction = correctionData[assignmentId];
    const score = parseFloat(correction?.score || "");
    const remarks = correction?.remarks?.trim() || "";

    setSubmitting(assignmentId);

    try {
      const params: SubmitCorrectionParams = {
        score,
        remarks,
        correctedDate: new Date().toISOString(),
        file: correction?.file || undefined,
      };

      await submitCorrectedAssignment(assignmentId, params);

      setAssignments((prev) =>
        prev.map((a) =>
          a.assignmentId === assignmentId
            ? {
                ...a,
                score,
                remarks,
                correctedDate: Math.floor(Date.now() / 1000),
              }
            : a
        )
      );

      setCorrectionData((prev) => ({
        ...prev,
        [assignmentId]: { ...(prev[assignmentId] || {}), file: null },
      }));

      setSelectedAssignmentId(null);
      addToast("Evaluation saved successfully!", "success");
    } catch (err: any) {
      console.error("Error saving evaluation:", err);
      addToast(err.message || "Failed to save evaluation", "error");
    } finally {
      setSubmitting(null);
    }
  };

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

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTableDate = (timestamp?: number) => {
    if (!timestamp) return "--";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "2-digit"
    });
  };

  const getStatusBadge = (assignment: CohortAssignment) => {
    const isCorrected = Boolean(assignment.correctedDate);
    
    if (isCorrected) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3" />
          Graded
        </span>
      );
    }
    
    if (assignment.submittedDate) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1">
          <ClockIcon className="h-3 w-3" />
          Pending Review
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
        Yet to Start
      </span>
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderFileInfo = () => {
    const allowed = [
      `PDF (${formatBytes(MAX_FILE_SIZES.PDF)})`,
      `Images (${formatBytes(MAX_FILE_SIZES.IMAGE)})`,
      `Audio (${formatBytes(MAX_FILE_SIZES.AUDIO)})`,
      `Video (${formatBytes(MAX_FILE_SIZES.VIDEO)})`,
      `Docs (${formatBytes(MAX_FILE_SIZES.DOCUMENT)})`,
    ].join(", ");

    return (
      <div className="mt-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1 flex items-center gap-1">
        <InformationCircleIcon className="h-3 w-3" />
        <span>
          <b>Allowed:</b> {allowed}
        </span>
      </div>
    );
  };

  const handlePageClick = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
    const tableElement = document.querySelector('.assignments-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        <ArrowPathRoundedSquareIcon className="w-8 h-8 animate-spin mr-3" />
        <span>Loading submissions...</span>
      </div>
    );
  }

  if (!cohortId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">No cohort selected</h2>
        <p className="text-sm text-gray-600 mt-2">
          Please select a cohort to view assignments.
        </p>
        <div className="mt-4">
          <button
            onClick={() => navigate("/select-cohort")}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Select Cohort
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer notifications={toasts} onClose={removeToast} />
      
      {previewImage && (
        <SimpleImagePopup
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
      
      {previewContent && (
        <ContentViewerModal
          url={previewContent}
          onClose={() => setPreviewContent(null)}
        />
      )}

      <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#0EA5E9] tracking-tight mb-1">
              Review Assignments
            </h1>

            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 text-xs sm:text-sm">
              <span className="text-gray-600">
                Cohort: <span className="font-medium">{cohortName}</span>
              </span>
              {/* <span className="text-gray-300">•</span>
              <span className="text-gray-600">
                Total: {stats.totalAssignments}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-orange-600 font-medium">
                Pending: {stats.pendingAssignments}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-green-600 font-medium">
                Corrected: {stats.correctedAssignments}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-blue-600 font-medium">
                Users: {stats.cohortUserCount}
              </span> */}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-blue-600 font-medium">Total Assignments</div>
                    <div className="text-lg font-bold text-gray-800">{stats.totalAssignments}</div>
                  </div>
                  <DocumentIcon className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-600 font-medium">Corrected</div>
                    <div className="text-lg font-bold text-gray-800">{stats.totalAssignments - stats.pendingAssignments}</div>
                  </div>
                  <DocumentArrowUpIcon className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-yellow-600 font-medium">Pending Review</div>
                    <div className="text-lg font-bold text-gray-800">{stats.pendingAssignments}</div>
                  </div>
                  <ClockIcon className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
              {/* <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-purple-600 font-medium">Graded</div>
                    <div className="text-lg font-bold text-gray-800">{stats.correctedAssignments}</div>
                  </div>
                  <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                </div>
              </div> */}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user ID, name, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setSortOrderAsc(true);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="userName">User Name</option>
                  <option value="topic">Topic</option>
                  <option value="submittedDate">Submitted Date</option>
                  <option value="status">Status</option>
                  <option value="score">Score</option>
                </select>

                <button
                  onClick={() => toggleSort(sortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap min-w-[40px]"
                >
                  {sortOrderAsc ? "↑" : "↓"}
                </button>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPageNumber(0);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value={10}>10/page</option>
                  <option value={25}>25/page</option>
                  <option value={50}>50/page</option>
                  <option value={100}>100/page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            {/* Assignments Table */}
            <div className="overflow-x-auto assignments-table">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">USER</th>
                    <th className="px-4 py-3 min-w-[200px]">TOPIC</th>
                    <th className="px-4 py-3 min-w-[100px]">Submitted Date</th>
                    <th className="px-4 py-3 min-w-[100px]">SCORE</th>
                    <th className="px-4 py-3 min-w-[120px]">STATUS</th>
                    <th className="px-4 py-3 min-w-[80px]">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <DocumentIcon className="h-8 w-8 text-gray-400" />
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
                      const isCorrected = Boolean(assignment.correctedDate);
                      const correction = correctionData[assignment.assignmentId] || {
                        score: "",
                        remarks: "",
                        file: null,
                      };

                      return (
                        <React.Fragment key={assignment.assignmentId}>
                          {/* Main table row */}
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`transition-colors ${isExpanded ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}
                          >
                            {/* USER Column */}
                            <td className="px-4 py-3">
                              <div className="max-w-[150px]">
                                <div className="font-medium text-gray-800 text-sm">
                                  {assignment.user.userId}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {assignment.user.userName}
                                </div>
                              </div>
                            </td>

                            {/* TOPIC Column */}
                            <td className="px-4 py-3">
                              <div className="max-w-[200px]">
                                <div className="font-medium text-gray-800 text-sm line-clamp-2">
                                  {assignment.subconcept.subconceptDesc}
                                </div>
                              </div>
                            </td>

                            {/* Submitted Date Column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                                {formatTableDate(assignment.submittedDate)}
                              </div>
                            </td>

                            {/* SCORE Column */}
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium">
                                {isCorrected ? (
                                  <div className="flex items-center gap-2">
                                    <div className="text-gray-800">
                                      {assignment.score || 0}/{assignment.subconcept.subconceptMaxscore || 5}
                                    </div>
                                    {assignment.subconcept.subconceptMaxscore > 0 && (
                                      <div className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                        {(((assignment.score || 0) / (assignment.subconcept.subconceptMaxscore || 5)) * 100).toFixed(0)}%
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-- / {assignment.subconcept.subconceptMaxscore || 5}</span>
                                )}
                              </div>
                            </td>

                            {/* STATUS Column */}
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                {getStatusBadge(assignment)}
                                {isCorrected && assignment.correctedDate && (
                                  <div className="text-xs text-gray-500">
                                    Graded: {formatTableDate(assignment.correctedDate)}
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
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUpIcon className="h-3 w-3" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDownIcon className="h-3 w-3" />
                                    {isCorrected ? 'View' : 'Evaluate'}
                                  </>
                                )}
                              </button>
                            </td>
                          </motion.tr>

                          {/* Expanded Correction Form */}
                          {isExpanded && (
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
                                      {isCorrected ? 'Evaluation Details' : 'Correct Assignment'}
                                    </h4>
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/mentor/${selected.cohortId}/${selected.program.programId}/assignments/${assignment.assignmentId}/ai-evaluate`,
                                          {
                                            state: {
                                              referenceUrl:
                                                assignment.subconcept?.dependencies?.[0]?.subconceptLink || "",
                                              mediaUrl: assignment.submittedFile?.downloadUrl || "",
                                              studentName: assignment.user.userName,
                                              topic: assignment.subconcept.subconceptDesc,
                                            },
                                          }
                                        )
                                      }
                                      className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                                    >
                                    Evaluate with AI
                                    </button>

                                    {isCorrected && (
                                      <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                        Already Graded
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Compact layout */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Column 1: Submitted File and References */}
                                    <div className="lg:col-span-1 space-y-3">
                                      {/* Submitted File */}
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
                                        <DependenciesRenderer
                                          dependencies={assignment.subconcept.dependencies || []}
                                          onViewReference={(url) => setPreviewContent(url)}
                                        />
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
                                            <span className="text-gray-500 text-xs"> (Max: {assignment.subconcept.subconceptMaxscore || 5})</span>
                                          </label>
                                          {isCorrected ? (
                                            <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">
                                              <span className="font-medium">{assignment.score}</span> / {assignment.subconcept.subconceptMaxscore || 5}
                                            </div>
                                          ) : (
                                            <input
                                              type="number"
                                              min="0"
                                              max={assignment.subconcept.subconceptMaxscore || 5}
                                              step="0.1"
                                              value={correction.score}
                                              onChange={(e) => handleCorrectionChange(assignment.assignmentId, "score", e.target.value)}
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
                                            {isCorrected && assignment.correctedDate 
                                              ? formatDate(assignment.correctedDate)
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
                                        {isCorrected ? (
                                          <div className="px-3 py-2 bg-gray-50 rounded text-sm text-gray-700 min-h-[60px]">
                                            {assignment.remarks || 'No remarks provided'}
                                          </div>
                                        ) : (
                                          <textarea
                                            value={correction.remarks}
                                            onChange={(e) => handleCorrectionChange(assignment.assignmentId, "remarks", e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            rows={2}
                                            placeholder="Enter remarks"
                                          />
                                        )}
                                      </div>

                                      {/* Correction File and Submit Row */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        {/* Correction File */}
                                        {!isCorrected && (
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Correction File (Optional)
                                            </label>
                                            <div className="space-y-2">
                                              <div className="flex items-center gap-2">
                                                <label className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                                                  <ArrowUpTrayIcon className="h-3 w-3" />
                                                  <span>Upload</span>
                                                  <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(assignment.assignmentId, e.target.files?.[0] || null)}
                                                    accept={ALLOWED_FILE_TYPES.join(',')}
                                                  />
                                                </label>
                                                {correction.file && (
                                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <span className="truncate max-w-[100px]">{correction.file.name}</span>
                                                    <button
                                                      onClick={() => handleFileUpload(assignment.assignmentId, null)}
                                                      className="text-red-500 hover:text-red-700"
                                                    >
                                                      <XMarkIcon className="h-3 w-3" />
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                              {renderFileInfo()}
                                            </div>
                                          </div>
                                        )}

                                        {/* Submit Button */}
                                        {!isCorrected && (
                                          <div>
                                            <button
                                              onClick={() => handleSave(assignment.assignmentId)}
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
                                                  <CheckIcon className="h-3 w-3" />
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
                                        {isCorrected && assignment.correctedFile && (
                                          <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Corrected File
                                            </label>
                                            <a
                                              href={assignment.correctedFile.downloadUrl}
                                              download
                                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                              <DocumentArrowDownIcon className="h-3 w-3" />
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
            {paginatedAssignments.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{offset + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(offset + itemsPerPage, filteredSorted.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredSorted.length}</span> assignments
                  </div>
                  
                  <ReactPaginate
                    previousLabel={
                      <span className="flex items-center gap-1 text-sm">
                        <ChevronDownIcon className="h-4 w-4 rotate-90" />
                        Previous
                      </span>
                    }
                    nextLabel={
                      <span className="flex items-center gap-1 text-sm">
                        Next
                        <ChevronDownIcon className="h-4 w-4 -rotate-90" />
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
            {/* {paginatedAssignments.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{filteredSorted.length}</span> assignments •
                    <span className="ml-2">
                      <span className="font-medium">{stats.totalAssignments - stats.pendingAssignments}</span> submitted •{' '}
                      <span className="font-medium">{stats.correctedAssignments}</span> graded •{' '}
                      <span className="font-medium">{stats.pendingAssignments}</span> pending
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
        </div>
      </div>
    </>
  );
};

export default ViewSubmissions;