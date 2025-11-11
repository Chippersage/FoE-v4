// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MagnifyingGlassIcon,
  ArrowPathRoundedSquareIcon,
  ChevronUpDownIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

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

  // Fetch API
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
        }));

        setAssignments(formatted);
        setFilteredAssignments(formatted);
        setStats(statistics);

        // Determine global max score (they’re same for all)
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

  // Search
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

  // Sort
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
          {/* Search */}
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

          {/* Stats */}
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

          {/* Sort */}
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
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {a.userId}
                  </td>

                  {/* Topic with hover tooltip */}
                  <td
                    className="py-2.5 px-4 max-w-[250px] truncate cursor-help"
                    title={a.topic}
                  >
                    {a.topic}
                  </td>

                  {/* Reference clickable */}
                  <td className="py-2.5 px-4">
                    {a.referenceLink ? (
                      <a
                        href={a.referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#0EA5E9] hover:text-[#0284C7] font-medium transition"
                      >
                        {a.reference}
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    ) : (
                      a.reference
                    )}
                  </td>

                  {/* Max score (common for all) */}
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      {maxScore || a.maxScore}
                    </span>
                  </td>

                  {/* Submitted Date */}
                  <td className="py-2.5 px-4">
                    {a.submittedDate
                      ? new Date(a.submittedDate * 1000).toLocaleString()
                      : "—"}
                  </td>

                  {/* File link */}
                  <td className="py-2.5 px-4 text-center">
                    {a.fileUrl ? (
                      <a
                        href={a.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0EA5E9] hover:text-[#0284C7] font-semibold text-sm"
                      >
                        VIEW
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Score */}
                  <td className="py-2.5 px-4 text-center">
                    <input
                      type="number"
                      defaultValue={a.score ?? ""}
                      className="w-12 text-center border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-[#0EA5E9] outline-none"
                    />
                  </td>

                  {/* Remarks */}
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      defaultValue={a.remarks ?? ""}
                      className="w-full border border-slate-300 rounded-md text-sm px-2 py-1 focus:ring-1 focus:ring-[#0EA5E9] outline-none"
                    />
                  </td>

                  {/* Corrected Date with time */}
                  <td className="py-2.5 px-4 text-center text-slate-600 text-sm">
                    {a.correctedDate
                      ? new Date(a.correctedDate * 1000).toLocaleString()
                      : "—"}
                  </td>

                  {/* Save / Corrected button */}
                    <td className="py-2.5 px-4 text-center">
                    {a.correctedDate ? (
                        <button
                        disabled
                        className="flex items-center justify-center gap-1 bg-slate-200 text-slate-600 px-3 py-1 rounded-md text-sm shadow-sm cursor-not-allowed"
                        >
                        Corrected
                        </button>
                    ) : (
                        <button className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-3 py-1 rounded-md text-sm shadow-sm transition">
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
