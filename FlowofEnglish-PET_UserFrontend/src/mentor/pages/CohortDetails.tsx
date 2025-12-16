// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CohortDetails() {
  const cohort = JSON.parse(localStorage.getItem("selectedCohort"));
  const user = JSON.parse(localStorage.getItem("user"));

  const cohortId = cohort?.cohortId;
  const programId = cohort?.programId;

  const [assignmentStats, setAssignmentStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cohortId || !user?.userId) return;

    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/users/${user.userId}/cohorts`
        );

        const details =
          res.data?.assignmentStatistics?.cohortDetails?.[cohortId];

        setAssignmentStats(details || null);
      } catch (err) {
        console.error("Failed to load cohort stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [cohortId]);

  if (!cohort) {
    return (
      <div className="p-6 text-sm text-slate-500">
        No cohort selected.
      </div>
    );
  }

  const startDate = new Date(cohort.cohortStartDate);
  const endDate = new Date(cohort.cohortEndDate);

  const status =
    Date.now() < startDate.getTime()
      ? "Yet to Start"
      : Date.now() > endDate.getTime()
      ? "Completed"
      : "Active";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0EA5E9] tracking-tight">
          Cohort Details
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          <span className="font-medium">{cohort.cohortName}</span> ·{" "}
          {cohort.programName}
        </p>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-3">
        <Badge
          icon={<BarChart3 size={14} />}
          label="Progress"
          value={`${cohort.progress ?? 0}%`}
          color="bg-[#0EA5E9]"
        />
        <Badge
          icon={<Calendar size={14} />}
          label="Status"
          value={status}
          color="bg-blue-500"
        />
        <Badge
          icon={<Users size={14} />}
          label="Learners"
          value={assignmentStats?.cohortUserCount ?? "-"}
          color="bg-indigo-500"
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          icon={<Calendar size={16} />}
          label="Start Date"
          value={startDate.toLocaleDateString()}
        />
        <InfoCard
          icon={<Calendar size={16} />}
          label="End Date"
          value={endDate.toLocaleDateString()}
        />
        <InfoCard
          icon={<BarChart3 size={16} />}
          label="Stages"
          value={cohort.stagesCount}
        />
        <InfoCard
          icon={<BarChart3 size={16} />}
          label="Units"
          value={cohort.unitCount}
        />
      </div>

      {/* Assignment Snapshot */}
      <div className="bg-white rounded-3xl border border-[#0EA5E9] shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#0EA5E9] mb-4 flex items-center gap-2">
          <FileText size={16} />
          Assignment Overview
        </h2>

        {loading ? (
          <p className="text-xs text-slate-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Total Assignments" value={assignmentStats?.totalAssignments ?? 0} />
            <Stat label="Corrected" value={assignmentStats?.correctedAssignments ?? 0} />
            <Stat label="Pending" value={assignmentStats?.pendingAssignments ?? 0} />
          </div>
        )}
      </div>

      {/* Cohort Rules */}
      <div className="bg-white rounded-3xl border border-[#0EA5E9] shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#0EA5E9] mb-4 flex items-center gap-2">
          <Settings size={16} />
          Cohort Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <Rule label="Leaderboard" value={cohort.showLeaderboard ? "Enabled" : "Disabled"} />
          <Rule label="AI Evaluation" value={cohort.enableAiEvaluation ? "Enabled" : "Disabled"} />
          <Rule
            label="Stage Unlock"
            value={
              cohort.delayedStageUnlock
                ? `Delayed (${cohort.delayInDays} days)`
                : "Immediate"
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reusable UI ---------------- */

const Badge = ({ icon, value, label, color }) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm ${color}`}
  >
    {icon}
    <div>
      <p className="text-[10px] uppercase opacity-80">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl border border-[#0EA5E9] shadow-sm p-4 flex items-center gap-3">
    <div className="text-[#0EA5E9]">{icon}</div>
    <div>
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="bg-[#0EA5E9]/10 rounded-xl p-4 text-center">
    <p className="text-[11px] text-slate-600">{label}</p>
    <p className="text-lg font-semibold text-[#0EA5E9]">{value}</p>
  </div>
);

const Rule = ({ label, value }) => (
  <div>
    <p className="text-[11px] text-slate-500">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);
