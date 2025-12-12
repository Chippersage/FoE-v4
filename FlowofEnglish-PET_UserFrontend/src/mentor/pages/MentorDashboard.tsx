// src/mentor/pages/MentorDashboard.tsx
// Mentor dashboard (Tailwind + TypeScript)
// Option A: mentorId from localStorage.user.userId and cohortId from localStorage.selectedCohort.cohortId
// Comments present, no emojis

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  // additional fields allowed
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

/* -------- Component -------- */

export default function MentorDashboard() {
  const navigate = useNavigate();

  // Option A: read mentorId and cohort from localStorage
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

  /* -------- UI -------- */

  return (
    <div className="p-5 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-sky-700">Cohort Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">
            {cohortMeta?.cohortName ?? cohortNameFromLS ?? "Cohort not found"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Program: {cohortMeta?.program?.programName ?? programId ?? "—"}
          </p>
        </div>

        <div className="text-sm text-right">
          <div className="font-medium text-slate-700">{organization?.organizationName ?? "-"}</div>
          <div className="text-slate-500 text-xs mt-1">Org. Admin Name: {organization?.organizationAdminName ?? ""}</div>
          <div className="text-slate-500 text-xs mt-1">Org. Admin Email: {organization?.organizationAdminEmail ?? ""}</div>
          <div className="text-slate-400 text-xs mt-1">Mentor: {storedUser?.userName ?? storedUser?.userId ?? "-"}</div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 p-4 rounded-xl shadow-sm">
          <div className="text-sm text-sky-700 font-semibold">Total Learners</div>
          <div className="text-3xl font-bold mt-2 text-sky-800">{totals.total}</div>
          <div className="text-xs text-slate-500 mt-2">Users enrolled in cohort</div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 p-4 rounded-xl shadow-sm">
          <div className="text-sm text-emerald-700 font-semibold">Active Learners</div>
          <div className="text-3xl font-bold mt-2 text-emerald-800">{totals.active}</div>
          <div className="text-xs text-slate-500 mt-2">Currently active users</div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 p-4 rounded-xl shadow-sm">
          <div className="text-sm text-amber-700 font-semibold">Assignments Pending</div>
          <div className="text-3xl font-bold mt-2 text-amber-800">{assignmentsPending}</div>
          <div className="text-xs text-slate-500 mt-2">Assignments awaiting review</div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-violet-100 border border-violet-200 p-4 rounded-xl shadow-sm">
          <div className="text-sm text-violet-700 font-semibold">Cohort Progress</div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-3xl font-bold text-violet-800">{overallProgress}%</div>
            <div className="w-full">
              <div className="w-full bg-violet-100 h-2 rounded overflow-hidden">
                <div
                  className="h-2 bg-violet-600"
                  style={{ width: `${Math.max(0, Math.min(100, overallProgress))}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">{loadingProgress ? "Updating..." : "Overall completion"}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search learners by name, id or email"
            className="flex-1 p-2 border rounded-md outline-none focus:ring-1 focus:ring-sky-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="p-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
      </section>

      <section className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Learners Activity</h2>
          <div className="text-sm text-slate-500">Showing {filtered.length} learners</div>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-sm font-medium">Learner</th>
                <th className="p-3 text-sm font-medium">Status</th>
                <th className="p-3 text-sm font-medium">Last Activity</th>
                <th className="p-3 text-sm font-medium">Duration</th>
                <th className="p-3 text-sm font-medium">Score</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-slate-500" colSpan={5}>
                    No learners found. Try changing your filters.
                  </td>
                </tr>
              )}

              {filtered.map((l) => {
                const isDisabled = (l.status ?? "").toUpperCase() === "DISABLED";
                const last = (l as any).latestActivity as string | undefined | null;
                const duration = (l as any).duration as string | undefined;
                return (
                  <tr
                    key={l.userId}
                    className={`border-t hover:bg-slate-50 ${isDisabled ? "opacity-60" : "cursor-pointer"}`}
                    onClick={() =>
                      navigate(
                        `/mentor/${encodeURIComponent(cohortId)}/${encodeURIComponent(
                          cohortMeta?.program?.programId ?? programId ?? ""
                        )}/learner/${encodeURIComponent(l.userId)}`
                      )
                    }
                  >
                    <td className="p-3 align-top">
                      <div className="font-semibold text-slate-800">{l.userName ?? "-"}</div>
                      <div className="text-xs text-slate-500 mt-1">{l.userId}</div>
                      {l.userEmail && <div className="text-xs text-slate-400 mt-1">{l.userEmail}</div>}
                    </td>

                    <td className="p-3 align-top">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          (l.status ?? "").toUpperCase() === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {l.status ?? "UNKNOWN"}
                      </span>
                    </td>

                    <td className="p-3 align-top text-sm text-slate-700">
                      {last ? new Date(last).toLocaleString() : "Not Available"}
                    </td>

                    <td className="p-3 align-top text-sm text-slate-700">{duration ?? "—"}</td>

                    <td className="p-3 align-top text-sm font-semibold text-sky-700">{l.leaderboardScore ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
