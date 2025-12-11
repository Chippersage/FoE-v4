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
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

/*
  ViewSubmissions.tsx
  - Uses localStorage key `selectedCohort` to read cohortId/cohortName
  - Provides search, sort, pagination (page size select: 10/25/50/100)
  - Avoids hook-order violations by keeping hooks at top-level
  - Stores per-assignment editable values in `edits` state (no direct mutation of assignments)
  - Collapses less-important fields into a per-row "More" dropdown (Option A chosen):
      Visible columns: User ID, Topic, File, Score, Save
      Hidden inside "More": References, Max Score, Submitted Date, Remarks, Corrected On, Corrected File
  - Prevents horizontal overflow by truncating long text and hiding optional fields in dropdown
  - Responsive and constrained to a max width so it doesn't go under sidebar
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

  // Which row's "more" panel is open
  const [openMoreRow, setOpenMoreRow] = useState<string | null>(null);

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
          maxScore: a.subconcept?.subconceptMaxscore ?? null,
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
        // optimistic update: mark correctedDate and update assignment fields
        setAssignments((prev) =>
          prev.map((a) => (a.id === assignmentId ? { ...a, correctedDate: Math.floor(Date.now() / 1000), score: Number(score), remarks } : a))
        );
        // clear upload file for that row
        setEdits((prev) => ({ ...prev, [assignmentId]: { ...(prev[assignmentId] || {}), file: null } }));
      } else {
        alert("Failed to save. Try again.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. See console.");
    }
  };

  // Small helper formatting
  const formatDate = (ts) => {
    if (!ts) return "—";
    const n = Number(ts);
    // if it's likely seconds -> multiply
    const when = n > 1e12 ? n : n * 1000;
    return new Date(when).toLocaleString();
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-slate-800">
                <DocumentArrowDownIcon className="w-7 h-7 text-[#0EA5E9]" />
                Review Assignments
              </h1>
              <p className="text-sm text-slate-600 mt-1">{cohortName}</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="px-3 py-2 bg-slate-700 text-white rounded-md text-sm hover:bg-slate-800">
                Back
              </button>
            </div>
          </div>

          {/* Controls: search / stats / sort */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative w-full md:w-1/2">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search user or topic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#0EA5E9] outline-none"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">Total: {stats?.totalAssignments ?? assignments.length}</span>
                <span className="bg-orange-100 px-3 py-1 rounded-full text-orange-700">Pending: {stats?.pendingAssignments ?? "-"}</span>
                <span className="bg-green-100 px-3 py-1 rounded-full text-green-700">Corrected: {stats?.correctedAssignments ?? "-"}</span>
                <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700">Users: {stats?.cohortUserCount ?? "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSort("User ID")}
                  className="flex items-center gap-2 text-sm border px-3 py-1 rounded-lg hover:bg-gray-50"
                >
                  <ChevronUpDownIcon className="w-4 h-4" />
                  Sort ({sortOrderAsc ? "asc" : "desc"})
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full table-fixed text-sm text-left text-slate-700">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4 w-[150px]">User ID</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4 w-[90px] text-center">File</th>
                  <th className="py-3 px-4 w-[110px] text-center">Score</th>
                  <th className="py-3 px-4 w-[90px] text-center">Save</th>
                  <th className="py-3 px-4 w-[80px] text-center">More</th>
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-sm text-gray-600">
                      No assignments found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((a, idx) => {
                    const edit = edits[a.id] || { score: "", remarks: "", file: null };
                    const isCorrected = Boolean(a.correctedDate);
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        {/* USER ID */}
                        <td className="py-3 px-4 align-top font-medium max-w-[150px] truncate">{a.userId}</td>

                        {/* TOPIC */}
                        <td className="py-3 px-4 align-top max-w-[540px]">
                          <div className="truncate text-sm">{a.topic}</div>
                        </td>

                        {/* FILE */}
                        <td className="py-3 px-4 align-top text-center">
                          {a.fileUrl ? (
                            <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-[#0EA5E9] font-medium">
                              View
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* SCORE (editable) */}
                        <td className="py-3 px-4 align-top text-center">
                          <input
                            type="number"
                            value={edit.score ?? ""}
                            onChange={(e) => handleEditChange(a.id, { score: e.target.value === "" ? "" : Number(e.target.value) })}
                            className="w-20 text-center border rounded px-2 py-1 text-sm"
                            disabled={isCorrected}
                          />
                        </td>

                        {/* SAVE */}
                        <td className="py-3 px-4 align-top text-center">
                          {isCorrected ? (
                            <button className="bg-gray-200 px-3 py-1 rounded text-sm text-gray-600" disabled>
                              Done
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSave(a.id)}
                              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                          )}
                        </td>

                        {/* MORE (dropdown) */}
                        <td className="py-3 px-4 align-top text-center">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenMoreRow((cur) => (cur === a.id ? null : a.id))}
                              className="px-2 py-1 border rounded text-sm bg-white hover:bg-gray-50"
                              aria-expanded={openMoreRow === a.id}
                            >
                              ...
                            </button>

                            {openMoreRow === a.id && (
                              <div
                                className="absolute right-0 mt-2 w-[320px] bg-white border rounded shadow-lg z-40 text-sm"
                                onMouseLeave={() => setOpenMoreRow(null)}
                              >
                                <div className="p-3 border-b text-xs font-semibold text-slate-600">Details</div>

                                <div className="p-3 space-y-2">
                                  <div>
                                    <div className="text-xs text-gray-500">Reference</div>
                                    <div className="truncate">
                                      {a.referenceLink ? (
                                        <a href={a.referenceLink} target="_blank" rel="noreferrer" className="text-[#0EA5E9] font-medium">
                                          {a.reference} <ArrowTopRightOnSquareIcon className="inline w-3 h-3 ml-1" />
                                        </a>
                                      ) : (
                                        a.reference || "—"
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500">Max Score</div>
                                    <div>{a.maxScore ?? "—"}</div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500">Submitted Date</div>
                                    <div>{formatDate(a.submittedDate)}</div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500">Remarks</div>
                                    <textarea
                                      value={edit.remarks ?? ""}
                                      onChange={(e) => handleEditChange(a.id, { remarks: e.target.value })}
                                      className="w-full border rounded px-2 py-1 text-sm"
                                      rows={2}
                                      placeholder="Add remarks..."
                                    />
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500">Corrected On</div>
                                    <div>{a.correctedDate ? formatDate(a.correctedDate) : "—"}</div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500">Corrected File</div>
                                    <div>
                                      {a.correctedDate ? (
                                        <span className="text-gray-600">Uploaded</span>
                                      ) : (
                                        <label className="inline-flex items-center gap-2 cursor-pointer text-[#0EA5E9]">
                                          <ArrowUpTrayIcon className="w-4 h-4" />
                                          <span className="underline">Upload</span>
                                          <input
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.mp4,.pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0] ?? null;
                                              handleFileChange(a.id, file);
                                            }}
                                          />
                                        </label>
                                      )}
                                      {edits[a.id]?.file && (
                                        <div className="mt-1 text-xs text-green-700 truncate">{edits[a.id].file.name}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="p-3 border-t flex justify-end gap-2">
                                  <button onClick={() => setOpenMoreRow(null)} className="px-3 py-1 rounded border text-sm">
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
            <div className="text-sm text-slate-600">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredSorted.length)} of {filteredSorted.length}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              <div className="px-3 py-1 border rounded text-sm">
                Page {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;
