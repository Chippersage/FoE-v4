// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

/*
  ViewSubmissions.tsx
  - Dropdown slides down below row when clicked
  - Numbered pagination (1, 2, 3, ... 8, 9, Next)
  - Reduced top gap
  - Clean design matching image
*/

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

// Dropdown content that slides down
const DropdownContent = ({ assignment, edit, isCorrected, onEditChange, onFileChange }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reference */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Reference</label>
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

        {/* Max Score */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Score</label>
          <div className="text-sm font-medium">{assignment.maxScore || 5}</div>
        </div>

        {/* Remarks */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            value={edit.remarks ?? ""}
            onChange={(e) => onEditChange(assignment.id, { remarks: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={2}
            placeholder="Add remarks..."
            disabled={isCorrected}
          />
        </div>

        {/* Corrected File Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Corrected File</label>
          {assignment.correctedDate ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
              <CheckCircleIcon className="w-4 h-4" />
              File uploaded
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
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      
      <div className="flex items-center gap-1">
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
  );
};

const ViewSubmissions: React.FC = () => {
  const navigate = useNavigate();

  // Read cohort from localStorage
  const selected = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedCohort") || "{}");
    } catch {
      return {};
    }
  }, []);

  const cohortId = selected?.cohortId;
  const cohortName = selected?.cohortName;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Data states
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("User ID");
  const [sortOrderAsc, setSortOrderAsc] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Per-row edits (stored by assignment id)
  const [edits, setEdits] = useState<{ [id: string]: { score?: number; remarks?: string; file?: File | null } }>({});

  // Which row's dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fetch assignments once cohortId is known
  useEffect(() => {
    if (!cohortId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/assignments/cohort/${cohortId}`);
        const { assignments: rawAssignments = [], statistics = {} } = res.data || {};

        const formatted = rawAssignments.map((a) => ({
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
        }));

        if (!cancelled) {
          setAssignments(formatted);
          setStats(statistics);
          // initialize edits with existing scores/remarks
          const initialEdits = {};
          formatted.forEach((f) => {
            initialEdits[f.id] = { score: f.score ?? "", remarks: f.remarks ?? "", file: null };
          });
          setEdits(initialEdits);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAssignments();
    return () => {
      cancelled = true;
    };
  }, [cohortId, API_BASE_URL]);

  // Derived: filtered + sorted list
  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = assignments.filter((a) => {
      if (!q) return true;
      return (
        String(a.userId).toLowerCase().includes(q) ||
        String(a.userName).toLowerCase().includes(q) ||
        String(a.topic).toLowerCase().includes(q) ||
        String(a.reference).toLowerCase().includes(q)
      );
    });

    const fieldMap = {
      "User ID": "userId",
      "Submitted Date": "submittedDate",
      Reference: "reference",
    };

    const field = fieldMap[sortBy] || "userId";

    list.sort((x, y) => {
      const A = x[field] ?? "";
      const B = y[field] ?? "";
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

    // prepare form
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
        setAssignments((prev) =>
          prev.map((a) => (a.id === assignmentId ? { ...a, correctedDate: Math.floor(Date.now() / 1000), score: Number(score), remarks } : a))
        );
        setEdits((prev) => ({ ...prev, [assignmentId]: { ...(prev[assignmentId] || {}), file: null } }));
        setOpenDropdown(null);
      } else {
        alert("Failed to save. Try again.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. See console.");
    }
  };

  // UI: loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        <ArrowPathRoundedSquareIcon className="w-8 h-8 animate-spin mr-3" />
        <span>Loading submissions...</span>
      </div>
    );
  }

  // UI: no cohort selected fallback
  if (!cohortId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">No cohort selected</h2>
        <p className="text-sm text-gray-600 mt-2">Please select a cohort to view assignments.</p>
        <div className="mt-4">
          <button onClick={() => navigate("/select-cohort")} className="px-3 py-2 bg-blue-600 text-white rounded">Select Cohort</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        {/* Compact Header - Reduced top spacing */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-[#0EA5E9] tracking-tight mb-1">Review Assignments</h1>
          
          {/* Cohort info and stats - compact like image */}
          <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
            <span className="text-gray-600">
              Cohort: <span className="font-medium">{cohortName}</span>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">Total: {stats?.totalAssignments ?? assignments.length}</span>
            <span className="text-gray-300">•</span>
            <span className="text-orange-600 font-medium">Pending: {stats?.pendingAssignments ?? "-"}</span>
            <span className="text-gray-300">•</span>
            <span className="text-green-600 font-medium">Corrected: {stats?.correctedAssignments ?? "-"}</span>
            <span className="text-gray-300">•</span>
            <span className="text-blue-600 font-medium">Users: {stats?.cohortUserCount ?? "-"}</span>
          </div>

          {/* Search and Controls - Compact */}
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
              <button
                onClick={() => toggleSort("User ID")}
                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <ChevronUpDownIcon className="w-4 h-4" />
                Sort {sortOrderAsc ? "↑" : "↓"}
              </button>
              
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                <tr>
                  <th className="py-3 px-4 w-[140px]">USER ID</th>
                  <th className="py-3 px-4">TOPIC</th>
                  <th className="py-3 px-4 w-[80px] text-center">FILE</th>
                  <th className="py-3 px-4 w-[120px] text-center">SCORE</th>
                  <th className="py-3 px-4 w-[100px] text-center">STATUS</th>
                  <th className="py-3 px-4 w-[100px] text-center">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center">
                      <div className="flex flex-col items-center justify-center py-4">
                        <DocumentArrowDownIcon className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-gray-500">No assignments found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((a) => {
                    const edit = edits[a.id] || { score: "", remarks: "", file: null };
                    const isCorrected = Boolean(a.correctedDate);
                    const isDropdownOpen = openDropdown === a.id;
                    const currentScore = edit.score !== "" && edit.score !== null ? Number(edit.score) : a.score;
                    
                    return (
                      <React.Fragment key={a.id}>
                        <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50">
                          {/* USER ID */}
                          <td className="py-3 px-4 align-middle">
                            <div className="font-medium text-gray-900">{a.userId}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[140px]">{a.userName}</div>
                          </td>

                          {/* TOPIC */}
                          <td className="py-3 px-4 align-middle">
                            <div className="text-sm line-clamp-2 max-w-[400px]">{a.topic}</div>
                          </td>

                          {/* FILE */}
                          <td className="py-3 px-4 align-middle text-center">
                            {a.fileUrl ? (
                              <a
                                href={a.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 mx-auto"
                                title="View submitted file"
                              >
                                <EyeIcon className="w-4 h-4" />
                                <span>View</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>

                          {/* SCORE */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex items-center justify-center gap-2">
                              {!isCorrected ? (
                                <input
                                  type="number"
                                  value={edit.score ?? ""}
                                  onChange={(e) => handleEditChange(a.id, { score: e.target.value === "" ? "" : Number(e.target.value) })}
                                  className="w-16 text-center border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  min="0"
                                  max={a.maxScore || 5}
                                  placeholder="Score"
                                />
                              ) : (
                                <span className="font-medium text-gray-900">{currentScore ?? "—"}</span>
                              )}
                              <span className="text-gray-500">/</span>
                              <span className="text-gray-500">{a.maxScore || 5}</span>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="py-3 px-4 align-middle text-center">
                            {isCorrected ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                <CheckCircleIcon className="w-3 h-3" />
                                Corrected
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSave(a.id)}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                disabled={!edit.score || edit.score === ""}
                              >
                                Evaluate
                              </button>
                            )}
                          </td>

                          {/* ACTIONS DROPDOWN */}
                          <td className="py-3 px-4 align-middle text-center">
                            <button
                              onClick={() => setOpenDropdown(isDropdownOpen ? null : a.id)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-sm ${
                                isDropdownOpen 
                                  ? 'bg-blue-50 border-blue-300 text-blue-600' 
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {isDropdownOpen ? "Close" : "Actions"}
                              <ChevronDownIcon className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                        </tr>

                        {/* DROPDOWN CONTENT - Slides down below row */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <td colSpan={6} className="p-0">
                                <DropdownContent
                                  assignment={a}
                                  edit={edit}
                                  isCorrected={isCorrected}
                                  onEditChange={handleEditChange}
                                  onFileChange={handleFileChange}
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

          {/* Pagination controls with numbered pages */}
          {paginated.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
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

export default ViewSubmissions;