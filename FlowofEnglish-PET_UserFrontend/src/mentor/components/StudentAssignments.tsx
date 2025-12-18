// @ts-nocheck
import React, { useEffect, useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ArrowPathRoundedSquareIcon,
  ChevronUpDownIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ChevronDownIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Assignment {
  id: string;
  userId: string;
  userName: string;
  topic: string;
  reference: string;
  referenceLink: string;
  maxScore: number | null;
  score: number | null;
  remarks: string;
  fileUrl: string | null;
  submittedDate: number | null;
  correctedDate: number | null;
  stageName?: string;
  unitName?: string;
  submittedFile?: any;
  correctedFile?: any;
}

interface StudentAssignmentsProps {
  cohortId: string;
  userId: string;
  cohortName?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Dropdown content that slides down (updated with asterisks and reset button)
const DropdownContent = ({ assignment, edit, isCorrected, onEditChange, onFileChange, onSave, onReset }) => {
  const formatDate = (ts) => {
    if (!ts) return "—";
    const n = Number(ts);
    const when = n > 1e12 ? n : n * 1000;
    return new Date(when).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-blue-50 border-t border-blue-100 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Reference */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Reference ID</label>
          {assignment.referenceLink ? (
            <a
              href={assignment.referenceLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              {assignment.reference || "View Reference"}
              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            </a>
          ) : (
            <div className="text-sm text-gray-600">{assignment.reference || "—"}</div>
          )}
        </div>

        {/* Submitted Date */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Submitted Date</label>
          <div className="text-sm">{formatDate(assignment.submittedDate)}</div>
        </div>

        {/* Corrected Date */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Corrected On</label>
          <div className="text-sm">{assignment.correctedDate ? formatDate(assignment.correctedDate) : "—"}</div>
        </div>

        {/* Stage */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
          <div className="text-sm font-medium">{assignment.stageName || "—"}</div>
        </div>

        {/* Unit */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
          <div className="text-sm">{assignment.unitName || "—"}</div>
        </div>

        {/* Max Score */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Score</label>
          <div className="text-sm font-medium">{assignment.maxScore || 5}</div>
        </div>

        {/* Score Input - Mandatory field with asterisk */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Score <span className="text-red-500">*</span>
            <span className="text-gray-500 ml-1">/ {assignment.maxScore || 5}</span>
          </label>
          <input
            type="number"
            value={edit.score ?? ""}
            onChange={(e) => onEditChange(assignment.id, { 
              score: e.target.value === "" ? "" : Number(e.target.value) 
            })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            min="0"
            max={assignment.maxScore || 5}
            placeholder="Enter score"
            disabled={isCorrected}
          />
          <div className="text-xs text-red-500 mt-1">
            {!edit.score && !isCorrected ? "Required field" : ""}
          </div>
        </div>

        {/* Corrected File Upload */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Corrected File</label>
          {assignment.correctedFile?.downloadUrl ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                <CheckCircleIcon className="w-4 h-4" />
                File uploaded
              </div>
              <a
                href={assignment.correctedFile.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View File
              </a>
            </div>
          ) : assignment.correctedDate ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
              <CheckCircleIcon className="w-4 h-4" />
              Graded (no file)
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <ArrowUpTrayIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Upload File</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.mp4,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    onFileChange(assignment.id, file);
                  }}
                  disabled={isCorrected}
                />
              </label>
              {edit?.file && (
                <div className="text-sm text-green-700 truncate">
                  ✓ {edit.file.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remarks - Mandatory field with asterisk */}
        <div className="space-y-1 lg:col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={edit.remarks ?? ""}
            onChange={(e) => onEditChange(assignment.id, { remarks: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={2}
            placeholder="Add remarks or feedback..."
            disabled={isCorrected}
          />
          <div className="text-xs text-red-500 mt-1">
            {(!edit.remarks || edit.remarks.trim() === "") && !isCorrected ? "Required field" : ""}
          </div>
        </div>

        {/* Action Buttons - Reset and Save - Only show for uncorrected assignments */}
        {!isCorrected && (
          <div className="lg:col-span-3 flex justify-end gap-3">
            <button
              onClick={() => onReset(assignment.id)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => onSave(assignment.id)}
              disabled={!edit.score || edit.score === "" || !edit.remarks || edit.remarks.trim() === ""}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Evaluation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Pagination component with numbered pages
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Always show first page
  pages.push(1);
  
  // Calculate page range to show
  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);
  
  // Adjust if near start
  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages - 1);
  }
  
  // Adjust if near end
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(2, totalPages - 4);
  }
  
  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push("...");
  }
  
  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push("...");
  }
  
  // Always show last page if there is more than one page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-1 flex-wrap justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {pages.map((pageNum, idx) => (
            <button
              key={idx}
              onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
              disabled={pageNum === "..."}
              className={`min-w-[36px] h-9 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : pageNum === "..."
                  ? 'text-gray-400 cursor-default'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const StudentAssignments: React.FC<StudentAssignmentsProps> = ({
  cohortId,
  userId,
  cohortName = "Cohort",
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Data states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    correctedAssignments: 0,
    pendingAssignments: 0,
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Submitted Date");
  const [sortOrderAsc, setSortOrderAsc] = useState(false); // newest first by default

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Per-row edits
  const [edits, setEdits] = useState<{ 
    [id: string]: { 
      score?: number | string; 
      remarks?: string; 
      file?: File | null 
    } 
  }>({});

  // Which row's dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fetch assignments
  useEffect(() => {
    if (!cohortId || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/assignments/cohort/${cohortId}`);
        const { assignments: rawAssignments = [], statistics = {} } = res.data || {};

        // Filter by userId and format
        const userAssignments = rawAssignments
          .filter(a => a.user?.userId === userId)
          .map((a) => ({
            id: a.assignmentId,
            userId: a.user?.userId || "",
            userName: a.user?.userName || "",
            topic: a.subconcept?.subconceptDesc || "",
            reference: a.subconcept?.subconceptId || "",
            referenceLink: a.subconcept?.subconceptLink || "",
            maxScore: a.subconcept?.subconceptMaxscore ?? 5,
            score: a.score ?? null,
            remarks: a.remarks ?? "",
            fileUrl: a.submittedFile?.downloadUrl ?? null,
            submittedDate: a.submittedDate ?? null,
            correctedDate: a.correctedDate ?? null,
            stageName: a.stage?.stageName || "",
            unitName: a.unit?.unitName || "",
            submittedFile: a.submittedFile || null,
            correctedFile: a.correctedFile || null,
          }));

        if (!cancelled) {
          setAssignments(userAssignments);
          setStats({
            totalAssignments: userAssignments.length,
            correctedAssignments: userAssignments.filter(a => a.score !== null && a.score !== undefined).length,
            pendingAssignments: userAssignments.filter(a => a.score === null || a.score === undefined).length,
          });
          
          // Initialize edits with existing scores/remarks
          const initialEdits = {};
          userAssignments.forEach((f) => {
            initialEdits[f.id] = { 
              score: f.score ?? "", 
              remarks: f.remarks ?? "", 
              file: null 
            };
          });
          setEdits(initialEdits);
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssignments();
    return () => {
      cancelled = true;
    };
  }, [cohortId, userId, API_BASE_URL]);

  // Derived: filtered + sorted list
  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = assignments.filter((a) => {
      if (!q) return true;
      return (
        String(a.topic).toLowerCase().includes(q) ||
        String(a.reference).toLowerCase().includes(q) ||
        String(a.stageName).toLowerCase().includes(q) ||
        String(a.unitName).toLowerCase().includes(q)
      );
    });

    const fieldMap = {
      "Submitted Date": "submittedDate",
      "Topic": "topic",
      "Stage": "stageName",
      "Score": "score",
    };

    const field = fieldMap[sortBy] || "submittedDate";

    list.sort((x, y) => {
      const A = x[field] ?? "";
      const B = y[field] ?? "";
      
      // Handle dates specially
      if (field === "submittedDate" || field === "correctedDate") {
        const dateA = A ? Number(A) : 0;
        const dateB = B ? Number(B) : 0;
        return sortOrderAsc ? dateA - dateB : dateB - dateA;
      }
      
      if (A < B) return sortOrderAsc ? -1 : 1;
      if (A > B) return sortOrderAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [assignments, searchQuery, sortBy, sortOrderAsc]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page, pageSize]);

  // Handlers
  const toggleSort = (fieldLabel?: string) => {
    if (fieldLabel) setSortBy(fieldLabel);
    setSortOrderAsc((s) => !s);
  };

  const handleFileChange = (assignmentId: string, file: File | null) => {
    setEdits((prev) => ({
      ...prev,
      [assignmentId]: { ...(prev[assignmentId] || {}), file },
    }));
  };

  const handleEditChange = (assignmentId: string, data: Partial<{ score: number | string; remarks: string }>) => {
    setEdits((prev) => ({
      ...prev,
      [assignmentId]: { ...(prev[assignmentId] || {}), ...data },
    }));
  };

  // Reset handler - clears all user-entered data
  const handleReset = (assignmentId: string) => {
    // Reset to original values from the assignment
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      setEdits((prev) => ({
        ...prev,
        [assignmentId]: { 
          score: assignment.score ?? "", 
          remarks: assignment.remarks ?? "", 
          file: null 
        }
      }));
    } else {
      // If no assignment found, reset to empty
      setEdits((prev) => ({
        ...prev,
        [assignmentId]: { score: "", remarks: "", file: null }
      }));
    }
  };

  const handleSave = async (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return alert("Assignment not found");

    const edit = edits[assignmentId] || {};
    const score = edit.score;
    const remarks = edit.remarks || "";

    if (score === "" || score === null || typeof score === "undefined") {
      alert("Please enter a score before saving.");
      return;
    }

    if (!remarks || remarks.trim() === "") {
      alert("Please enter remarks before saving.");
      return;
    }

    // Validate score is within maxScore range
    if (assignment.maxScore && Number(score) > assignment.maxScore) {
      alert(`Score cannot exceed maximum score of ${assignment.maxScore}.`);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("score", String(score));
    formData.append("remarks", remarks);
    formData.append("correctedDate", new Date().toISOString());
    if (edit.file) {
      if (!ALLOWED_FILE_TYPES.includes(edit.file.type)) {
        alert("Invalid file type. Allowed: images, mp4, pdf, doc/docx.");
        return;
      }
      if (edit.file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      formData.append("file", edit.file);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/assignments/${assignmentId}/correct`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.status === 200) {
        // Optimistic update
        setAssignments((prev) =>
          prev.map((a) => 
            a.id === assignmentId 
              ? { 
                  ...a, 
                  correctedDate: Math.floor(Date.now() / 1000), 
                  score: Number(score), 
                  remarks 
                } 
              : a
          )
        );
        // Clear upload file for that row
        setEdits((prev) => ({ 
          ...prev, 
          [assignmentId]: { ...(prev[assignmentId] || {}), file: null } 
        }));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          correctedAssignments: prev.correctedAssignments + 1,
          pendingAssignments: Math.max(0, prev.pendingAssignments - 1)
        }));
        
        // Close dropdown
        setOpenDropdown(null);
      } else {
        alert("Failed to save. Try again.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. See console.");
    }
  };

  // Handler for toggling dropdown via Evaluate button
  const handleEvaluateClick = (assignmentId: string) => {
    // Toggle dropdown for any assignment (both evaluated and pending)
    setOpenDropdown(openDropdown === assignmentId ? null : assignmentId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        <ArrowPathRoundedSquareIcon className="w-8 h-8 animate-spin mr-3" />
        <span>Loading assignments...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        {/* Compact Header - Mobile responsive */}
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0EA5E9] tracking-tight mb-1">Student Assignments</h1>
          
          {/* Cohort info and stats - Mobile responsive with dots */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 text-xs sm:text-sm">
            <span className="text-gray-600">
              Cohort: <span className="font-medium">{cohortName}</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">Student: <span className="font-medium">{userId}</span></span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">Total: {stats.totalAssignments}</span>
            <span className="text-gray-300">•</span>
            <span className="text-orange-600 font-medium">Pending: {stats.pendingAssignments}</span>
            <span className="text-gray-300">•</span>
            <span className="text-green-600 font-medium">Graded: {stats.correctedAssignments}</span>
          </div>

          {/* Search and Controls - Mobile responsive */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by topic, stage, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSort(sortBy)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap"
              >
                <ChevronUpDownIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span> {sortOrderAsc ? "↑" : "↓"}
              </button>
              
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
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

        {/* Main Content - Mobile responsive */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table - Mobile responsive with vertical scrolling */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                  <tr>
                    <th className="py-3 px-2 sm:px-4 w-auto min-w-[200px]">TOPIC</th>
                    <th className="py-3 px-2 sm:px-4 w-auto min-w-[100px] text-center">STAGE</th>
                    <th className="py-3 px-2 sm:px-4 w-auto min-w-[80px] text-center">SCORE</th>
                    <th className="py-3 px-2 sm:px-4 w-auto min-w-[100px] text-center">STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                          <DocumentArrowDownIcon className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-gray-500">No assignments found for this student</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((a) => {
                      const isCorrected = Boolean(a.correctedDate);
                      const isDropdownOpen = openDropdown === a.id;
                      
                      return (
                        <React.Fragment key={a.id}>
                          <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                            {/* TOPIC - Mobile responsive */}
                            <td className="py-3 px-2 sm:px-4 align-middle">
                              <div className="font-medium text-gray-900 text-xs sm:text-sm">{a.topic}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[180px] sm:max-w-[300px] mt-1">
                                {a.unitName || "No unit specified"}
                              </div>
                              <div className="mt-1">
                                {a.fileUrl ? (
                                  <a
                                    href={a.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                                    title="View submitted file"
                                  >
                                    <EyeIcon className="w-3 h-3" />
                                    <span>View Submitted File</span>
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-xs">No file submitted</span>
                                )}
                              </div>
                            </td>

                            {/* STAGE - Mobile responsive */}
                            <td className="py-3 px-2 sm:px-4 align-middle text-center">
                              <div className="text-xs sm:text-sm truncate" title={a.stageName}>
                                {a.stageName || "—"}
                              </div>
                            </td>

                            {/* SCORE - Mobile responsive */}
                            <td className="py-3 px-2 sm:px-4 align-middle text-center">
                              <div className="text-xs sm:text-sm">
                                {isCorrected ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="font-medium text-gray-900">{a.score ?? "—"}</span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-gray-500">{a.maxScore || 5}</span>
                                  </div>
                                ) : (
                                  <span className="text-orange-600 font-medium">Pending</span>
                                )}
                              </div>
                            </td>

                            {/* STATUS - Mobile responsive */}
                            <td className="py-3 px-2 sm:px-4 align-middle text-center">
                              {/* Evaluate button - always visible, toggles dropdown for both evaluated and pending */}
                              <button
                                onClick={() => handleEvaluateClick(a.id)}
                                className={`px-3 sm:px-4 py-1.5 text-white rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                                  isDropdownOpen 
                                    ? 'bg-blue-700 hover:bg-blue-800' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {isDropdownOpen ? "Close" : "Evaluate"}
                              </button>
                            </td>
                          </tr>

                          {/* DROPDOWN CONTENT - Mobile responsive - Shows for both evaluated and pending when clicked */}
                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <td colSpan={4} className="p-0">
                                  <DropdownContent
                                    assignment={a}
                                    edit={edits[a.id] || { score: a.score ?? "", remarks: a.remarks ?? "", file: null }}
                                    isCorrected={isCorrected}
                                    onEditChange={handleEditChange}
                                    onFileChange={handleFileChange}
                                    onSave={handleSave}
                                    onReset={handleReset}
                                  />
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls with numbered pages - Mobile responsive */}
          {paginated.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredSorted.length)} of {filteredSorted.length} entries
              </div>

              <Pagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;