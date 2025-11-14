// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { cohortId, cohortName } = (location.state as any) || {};

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("User ID");
  const [sortOrder, setSortOrder] = useState("asc");
  const [stats, setStats] = useState({});
  const [maxScore, setMaxScore] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch all assignments
  useEffect(() => {
    if (!cohortId) return;
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/assignments/cohort/${cohortId}`);
        const { assignments, statistics } = res.data;

        const formatted = assignments.map((a) => ({
          id: a.assignmentId,
          userId: a.user?.userId,
          userName: a.user?.userName,
          topic: a.subconcept?.subconceptDesc,
          reference: a.subconcept?.subconceptId,
          referenceLink: a.subconcept?.subconceptLink,
          maxScore: a.subconcept?.subconceptMaxscore,
          score: a.score,
          remarks: a.remarks,
          fileUrl: a.submittedFile?.downloadUrl,
          submittedDate: a.submittedDate,
          correctedDate: a.correctedDate,
          program: a.program?.programName,
          correctedFile: null,
        }));

        setAssignments(formatted);
        setFilteredAssignments(formatted);
        setStats(statistics);

        if (formatted.length > 0) {
          setMaxScore(formatted[0].maxScore);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [cohortId]);

  // Search functionality
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = assignments.filter(
      (a) =>
        a.userId?.toLowerCase().includes(q) ||
        a.userName?.toLowerCase().includes(q) ||
        a.topic?.toLowerCase().includes(q) ||
        a.reference?.toLowerCase().includes(q)
    );
    setFilteredAssignments(filtered);
  }, [searchQuery, assignments]);

  // Sorting logic
  const handleSort = () => {
    const sorted = [...filteredAssignments].sort((a, b) => {
      const field =
        sortBy === "User ID"
          ? "userId"
          : sortBy === "Submitted Date"
          ? "submittedDate"
          : "reference";
      const valA = a[field];
      const valB = b[field];
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredAssignments(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // API call with FormData
  const handleSave = async (assignment) => {
    const { id, score, remarks, correctedFile } = assignment;

    if (!score) {
      alert("Please enter a score before saving.");
      return;
    }

    if (correctedFile) {
      if (!ALLOWED_FILE_TYPES.includes(correctedFile.type)) {
        alert("Invalid file type. Please upload an image, video, PDF, or document file.");
        return;
      }
      if (correctedFile.size > MAX_FILE_SIZE) {
        alert("File size exceeds 10MB limit. Please upload a smaller file.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("score", score);
    formData.append("remarks", remarks || "");
    formData.append("correctedDate", new Date().toISOString());
    if (correctedFile) formData.append("file", correctedFile);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/assignments/${id}/correct`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      if (res.status === 200) {
        setFilteredAssignments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, correctedDate: Date.now() / 1000, score, remarks } : a
          )
        );
      }
    } catch (err) {
      console.error("Error saving correction:", err);
      alert("Failed to save correction.");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-[#0EA5E9]">
        <ArrowPathRoundedSquareIcon className="w-10 h-10 animate-spin mb-3" />
        <p className="font-medium">Loading Submissions...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <DocumentArrowDownIcon className="w-7 h-7 text-[#0EA5E9]" />
              Review Assignments
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-medium text-[#0EA5E9]">{cohortName}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Search + Stats + Sort */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div className="relative w-full md:w-1/3">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments by user, topic, or reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-sm">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
              Total: {stats?.totalAssignments || 0}
            </span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
              Pending: {stats?.pendingAssignments || 0}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Corrected: {stats?.correctedAssignments || 0}
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              Users: {stats?.cohortUserCount || 0}
            </span>
          </div>

          <button
            onClick={handleSort}
            className="flex items-center justify-center gap-2 text-sm border border-slate-300 rounded-lg px-4 py-2 hover:bg-slate-50 transition"
          >
            <ChevronUpDownIcon className="w-4 h-4 text-slate-500" />
            Sort by: {sortBy} ({sortOrder === "asc" ? "↑" : "↓"})
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm text-left text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b">
              <tr>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">References</th>
                <th className="py-3 px-4 text-center">Max Score</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-center">Submitted File</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-center">Corrected On</th>
                <th className="py-3 px-4 text-center">Corrected File</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a, idx) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-slate-50 transition border-b border-slate-100"
                >
                  <td className="py-2.5 px-4 font-medium text-slate-800">{a.userId}</td>
                  <td className="py-2.5 px-4 max-w-[250px] truncate" title={a.topic}>
                    {a.topic}
                  </td>
                  <td className="py-2.5 px-4">
                    {a.referenceLink ? (
                      <a
                        href={a.referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#0EA5E9] font-medium"
                      >
                        {a.reference}
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    ) : (
                      a.reference
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">{a.maxScore}</td>
                  <td className="py-2.5 px-4">
                    {a.submittedDate
                      ? new Date(a.submittedDate * 1000).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {a.fileUrl ? (
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0EA5E9] font-semibold"
                      >
                        VIEW
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Editable fields */}
                  <td className="py-2.5 px-4 text-center">
                    <input
                      type="number"
                      defaultValue={a.score ?? ""}
                      className="w-12 text-center border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-[#0EA5E9]"
                      onChange={(e) => (a.score = Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      defaultValue={a.remarks ?? ""}
                      className="w-full border border-slate-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-[#0EA5E9]"
                      onChange={(e) => (a.remarks = e.target.value)}
                    />
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-600">
                    {a.correctedDate
                      ? new Date(a.correctedDate * 1000).toLocaleString()
                      : "—"}
                  </td>

                  {/* File Upload */}
                  <td className="py-2.5 px-4">
                    {a.correctedDate ? (
                      <div className="flex items-center gap-2 text-slate-600">
                        <ArrowUpTrayIcon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">Uploaded</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-5 h-5 text-[#0EA5E9]" />

                        <span className="text-[#0EA5E9] font-medium hover:underline">
                          {a.correctedFile ? "Change File" : "Upload"}
                        </span>

                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.mp4,.pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            a.correctedFile = file;

                            // Trigger UI re-render
                            setFilteredAssignments((prev) => [...prev]);
                          }}
                        />
                      </label>
                    )}

                    {a.correctedFile && (
                      <div className="mt-1 text-xs text-green-600">
                        <span className="font-semibold">Selected:</span> {a.correctedFile.name}
                      </div>
                    )}
                  </td>

                  {/* Save button */}
                  <td className="py-2.5 px-4 text-center">
                    {a.correctedDate ? (
                      <button
                        disabled
                        className="bg-slate-200 text-slate-600 px-3 py-1 rounded-md text-sm cursor-not-allowed"
                      >
                        Corrected
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSave(a)}
                        className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-3 py-1 rounded-md text-sm transition"
                      >
                        Save
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;