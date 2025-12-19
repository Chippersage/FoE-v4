// src/mentor/pages/MentorDashboard.tsx
// Mentor dashboard (Tailwind + TypeScript)
// Updated with colored stat cards, pagination, and mobile responsiveness

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ArrowPathRoundedSquareIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";

/* -------- Type definitions (minimal) -------- */
type ProgramInfo = {
  programId?: string;
  programName?: string;
  totalStages?: number;
  totalUnits?: number;
  totalSubconcepts?: number;
};

type CohortWithProgram = {
  cohortId: string;
  cohortName?: string;
  cohortStartDate?: number | string;
  cohortEndDate?: number | string;
  program?: ProgramInfo;
};

type MentorCohortsResponse = {
  userDetails?: {
    userId?: string;
    userName?: string;
    allCohortsWithPrograms?: CohortWithProgram[];
  };
  assignmentStatistics?: any;
};

type Session = {
  sessionId?: string;
  sessionStartTimestamp?: string;
  sessionEndTimestamp?: string;
};

type LearnerAPIUser = {
  userId: string;
  userName?: string;
  userType?: string;
  userEmail?: string;
  status?: string;
  leaderboardScore?: number;
  createdAt?: string | number;
  recentSessions?: Session[];
};

type LearnerActivityResponse = {
  organization?: any;
  cohort?: {
    cohortId?: string;
    cohortName?: string;
    program?: ProgramInfo;
    totalUsers?: number;
    activeUsers?: number;
    deactivatedUsers?: number;
  };
  users?: LearnerAPIUser[];
};

type ProgressUser = {
  userId: string;
  userName?: string;
  totalStages?: number;
  completedStages?: number;
  totalUnits?: number;
  completedUnits?: number;
  totalSubconcepts?: number;
  completedSubconcepts?: number;
  leaderboardScore?: number;
  status?: string;
};

type MentorProgressResponse = {
  programName?: string;
  programId?: string;
  cohortId?: string;
  cohortName?: string;
  users?: ProgressUser[];
};

/* -------- Helper functions -------- */

function safeJsonParse<T = any>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function computeDuration(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return "—";
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const diffMs = e.getTime() - s.getTime();
    if (isNaN(diffMs) || diffMs <= 0) return "—";
    const mins = Math.floor(diffMs / (60 * 1000));
    const secs = Math.floor((diffMs % (60 * 1000)) / 1000);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  } catch {
    return "—";
  }
}

/* -------- Pagination Component with TypeScript types -------- */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages: (number | string)[] = [];
  
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

/* -------- Component -------- */

export default function MentorDashboard() {
  const navigate = useNavigate();

  // Read mentorId and cohort from localStorage
  const storedUser = safeJsonParse<{ userId?: string; userName?: string }>(
    localStorage.getItem("user")
  );
  const storedCohort = safeJsonParse<any>(localStorage.getItem("selectedCohort"));

  const mentorId = storedUser?.userId ?? "";
  const cohortId = storedCohort?.cohortId ?? "";
  const cohortNameFromLS = storedCohort?.cohortName ?? "";

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [organization, setOrganization] = useState<any | null>(null);
  const [cohortMeta, setCohortMeta] = useState<CohortWithProgram | null>(null);
  const [programId, setProgramId] = useState<string>("");

  const [learners, setLearners] = useState<Array<LearnerAPIUser & { latestActivity?: string | null; duration?: string }>>([]);
  const [assignmentsPending, setAssignmentsPending] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // Validate localStorage values
    if (!mentorId || !cohortId) {
      setError("Missing mentorId or cohortId in localStorage. Please select a cohort and sign in.");
      return;
    }
    setError(null);
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId, cohortId]);

  useEffect(() => {
    // fetch progress when programId is available
    if (mentorId && cohortId && programId) {
      fetchProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  /* -------- Fetch functions -------- */

  async function loadInitial() {
    setLoading(true);
    try {
      await Promise.all([fetchMentorCohorts(), fetchLearnerActivity()]);
    } catch (err: any) {
      console.error("Initial load error:", err);
      setError(err?.message ?? "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // GET /users/{mentorId}/cohorts
  async function fetchMentorCohorts() {
    if (!mentorId) return;
    const url = `${API_BASE}/users/${encodeURIComponent(mentorId)}/cohorts`;
    const resp = await fetch(url, { credentials: "include" });
    if (!resp.ok) {
      const text = await resp.text().catch(() => resp.statusText);
      throw new Error(`Cohorts API error: ${text}`);
    }
    const data = (await resp.json()) as MentorCohortsResponse;

    if (data.userDetails) {
      const cohorts = data.userDetails.allCohortsWithPrograms ?? [];
      const selected = cohorts.find((c) => c.cohortId === cohortId) ?? cohorts[0] ?? null;
      if (selected) {
        setCohortMeta(selected);
        if (selected.program?.programId) setProgramId(selected.program.programId);
      }
    }

    const pending = Number(
      data.assignmentStatistics?.cohortDetails?.[cohortId]?.pendingAssignments ??
        data.assignmentStatistics?.pendingAssignments ??
        0
    );
    setAssignmentsPending(Number.isFinite(pending) ? pending : 0);
  }

  // GET /user-session-mappings/cohort/{cohortId}/mentor/{mentorId}
  async function fetchLearnerActivity() {
    if (!mentorId || !cohortId) return;
    const url = `${API_BASE}/user-session-mappings/cohort/${encodeURIComponent(
      cohortId
    )}/mentor/${encodeURIComponent(mentorId)}`;
    const resp = await fetch(url, { credentials: "include" });
    if (!resp.ok) {
      const text = await resp.text().catch(() => resp.statusText);
      throw new Error(`Learner activity API error: ${text}`);
    }
    const data = (await resp.json()) as LearnerActivityResponse;

    if (data.organization) setOrganization(data.organization);
    if (data.cohort && !cohortMeta) {
      setCohortMeta({
        cohortId: data.cohort.cohortId ?? cohortId,
        cohortName: data.cohort.cohortName,
        program: data.cohort.program ?? undefined,
      });
      if (data.cohort.program?.programId) setProgramId(data.cohort.program.programId);
    }

    const users = Array.isArray(data.users) ? data.users : [];
    const mapped = users.map((u) => {
      const sessions = u.recentSessions ?? [];
      const latest = sessions.length > 0 ? sessions[0] : null;
      const latestActivity = latest?.sessionEndTimestamp ?? latest?.sessionStartTimestamp ?? null;
      const duration =
        latest?.sessionStartTimestamp && latest?.sessionEndTimestamp
          ? computeDuration(latest.sessionStartTimestamp, latest.sessionEndTimestamp)
          : "—";
      return { ...u, latestActivity, duration };
    });

    // Disabled users to bottom; recent activity first within groups
    mapped.sort((a, b) => {
      const aStatus = (a.status ?? "").toUpperCase();
      const bStatus = (b.status ?? "").toUpperCase();
      if (aStatus === "DISABLED" && bStatus !== "DISABLED") return 1;
      if (bStatus === "DISABLED" && aStatus !== "DISABLED") return -1;
      const aTs = (a as any).latestActivity ? new Date((a as any).latestActivity).getTime() : 0;
      const bTs = (b as any).latestActivity ? new Date((b as any).latestActivity).getTime() : 0;
      return bTs - aTs;
    });

    setLearners(mapped);
  }

  // GET /reports/mentor/{mentorId}/program/{programId}/cohort/{cohortId}/progress
  async function fetchProgress() {
    if (!mentorId || !programId || !cohortId) return;
    setLoadingProgress(true);
    try {
      const url = `${API_BASE}/reports/mentor/${encodeURIComponent(
        mentorId
      )}/program/${encodeURIComponent(programId)}/cohort/${encodeURIComponent(cohortId)}/progress`;
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) {
        const text = await resp.text().catch(() => resp.statusText);
        throw new Error(`Progress API error: ${text}`);
      }
      const data = (await resp.json()) as MentorProgressResponse;
      const users = Array.isArray(data.users) ? data.users : [];
      const totalSub = users.reduce((acc, u) => acc + (u.totalSubconcepts ?? 0), 0);
      const completedSub = users.reduce((acc, u) => acc + (u.completedSubconcepts ?? 0), 0);
      const pct = totalSub > 0 ? (completedSub / totalSub) * 100 : 0;
      setOverallProgress(Number(pct.toFixed(1)));
    } catch (err) {
      console.error("Progress fetch error:", err);
      setOverallProgress(0);
    } finally {
      setLoadingProgress(false);
    }
  }

  /* -------- Derived values & filtered list -------- */

  const totals = useMemo(() => {
    const total = learners.length;
    const active = learners.filter((l) => (l.status ?? "").toUpperCase() === "ACTIVE").length;
    const disabled = total - active;
    return { total, active, disabled };
  }, [learners]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return learners.filter((l) => {
      const matchesQ =
        !q ||
        (l.userName ?? "").toLowerCase().includes(q) ||
        (l.userId ?? "").toLowerCase().includes(q) ||
        (l.userEmail ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || (l.status ?? "").toUpperCase() === statusFilter;
      return matchesQ && matchesStatus;
    });
  }, [learners, searchTerm, statusFilter]);

  /* -------- Pagination logic -------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  /* -------- UI -------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">
        <ArrowPathRoundedSquareIcon className="w-8 h-8 animate-spin mr-3" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Header - Mobile responsive */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0EA5E9] tracking-tight mb-1">Cohort Dashboard</h1>
          
          {/* Cohort info and stats - Mobile responsive */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 text-xs sm:text-sm">
            <span className="text-gray-600">
              Cohort: <span className="font-medium">{cohortMeta?.cohortName ?? cohortNameFromLS ?? "—"}</span>
            </span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="text-gray-600">
              Program: <span className="font-medium">{cohortMeta?.program?.programName ?? programId ?? "—"}</span>
            </span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="text-gray-600">
              Organization: <span className="font-medium">{organization?.organizationName ?? "—"}</span>
            </span>
          </div>

          {/* Search and Filters - Mobile responsive */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search learners by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="ALL">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>

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

        {/* Stats Cards - 2 per row on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Total Learners Card - Blue theme */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700">Total Learners</div>
                <div className="text-2xl font-bold text-blue-900">{totals.total}</div>
              </div>
            </div>
            <div className="text-xs text-blue-600 mt-2">Users enrolled in cohort</div>
          </div>

          {/* Active Learners Card - Green theme */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-700">Active Learners</div>
                <div className="text-2xl font-bold text-green-900">{totals.active}</div>
              </div>
            </div>
            <div className="text-xs text-green-600 mt-2">Currently active users</div>
          </div>

          {/* Assignments Pending Card - Orange theme */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-orange-700">Assignments Pending</div>
                <div className="text-2xl font-bold text-orange-900">{assignmentsPending}</div>
              </div>
            </div>
            <div className="text-xs text-orange-600 mt-2">Awaiting review</div>
          </div>

          {/* Cohort Progress Card - Purple theme */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-700">Cohort Progress</div>
                <div className="text-2xl font-bold text-purple-900">{overallProgress}%</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-purple-100 h-2 rounded overflow-hidden">
                <div
                  className="h-2 bg-purple-600 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, overallProgress))}%` }}
                />
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {loadingProgress ? "Updating..." : "Overall completion"}
              </div>
            </div>
          </div>
        </div>

        {/* Learners Table with Pagination - Mobile responsive */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Learners Activity</h2>
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} learners
              </div>
            </div>
          </div>

          {/* Table - Mobile responsive with vertical scrolling */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Learner</th>
                    <th className="py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider text-center">Status</th>
                    <th className="py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Activity</th>
                    <th className="py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                          <UserGroupIcon className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-gray-500">No learners found</p>
                          <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((learner) => {
                      const isDisabled = (learner.status ?? "").toUpperCase() === "DISABLED";
                      const lastActivity = (learner as any).latestActivity as string | undefined | null;
                      const duration = (learner as any).duration as string | undefined;
                      
                      return (
                        <tr 
                          key={learner.userId}
                          className={`border-t border-gray-100 hover:bg-gray-50/50 ${
                            isDisabled ? "opacity-60" : "cursor-pointer"
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              navigate(
                                `/mentor/${encodeURIComponent(cohortId)}/${encodeURIComponent(
                                  cohortMeta?.program?.programId ?? programId ?? ""
                                )}/learner/${encodeURIComponent(learner.userId)}`
                              );
                            }
                          }}
                        >
                          {/* Learner Info - Mobile responsive */}
                          <td className="py-3 px-2 sm:px-4 align-middle">
                            <div className="font-medium text-gray-900 text-xs sm:text-sm">{learner.userName ?? "-"}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[200px]">
                              {learner.userId}
                            </div>
                            {learner.userEmail && (
                              <div className="text-xs text-gray-400 truncate max-w-[100px] sm:max-w-[200px]">
                                {learner.userEmail}
                              </div>
                            )}
                          </td>

                          {/* Status - Mobile responsive */}
                          <td className="py-3 px-2 sm:px-4 align-middle text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                (learner.status ?? "").toUpperCase() === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {learner.status === "ACTIVE" ? (
                                <CheckCircleIcon className="w-3 h-3" />
                              ) : null}
                              <span className="hidden sm:inline">{learner.status ?? "UNKNOWN"}</span>
                              <span className="sm:hidden">{learner.status === "ACTIVE" ? "Active" : "Disabled"}</span>
                            </span>
                          </td>

                          {/* Last Activity - Mobile responsive */}
                          <td className="py-3 px-2 sm:px-4 align-middle">
                            <div className="text-xs sm:text-sm text-gray-900">
                              {lastActivity ? new Date(lastActivity).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "Not Available"}
                            </div>
                          </td>

                          {/* Duration - Mobile responsive */}
                          <td className="py-3 px-2 sm:px-4 align-middle">
                            <div className="text-xs sm:text-sm text-gray-900">{duration ?? "—"}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls - Mobile responsive */}
          {paginated.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Page {page} of {totalPages}
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
}