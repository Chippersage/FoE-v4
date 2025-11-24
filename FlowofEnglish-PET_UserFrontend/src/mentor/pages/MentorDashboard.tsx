// src/mentor/pages/MentorDashboard.tsx
// @ts-nocheck
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMentorProgress } from "../hooks/useMentorProgress";
import { ArrowRight } from "lucide-react";

// CHARTS
import LearnersProgressChart from "../components/charts/LearnersProgressChart";
import LineProgressChart from "../components/charts/LineProgressChart";
import ProgressDataTable from "../components/charts/ProgressDataTable";

export default function MentorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // From CohortSelectionPage → View Learners
  const cohort = location.state?.cohort;
  const cohortId = cohort?.cohortId || location.state?.cohortId;
  const programId =
    cohort?.programId || cohort?.program?.programId || location.state?.programId;

  const { users, loading } = useMentorProgress(cohortId);
  const [viewMode, setViewMode] = useState<"bar" | "line" | "table">("bar");

  if (!cohortId) {
    return (
      <p className="p-4 text-center text-lg font-medium text-red-600">
        Cohort information missing
      </p>
    );
  }

  if (loading) {
    return (
      <p className="p-4 text-center text-lg font-medium">
        Loading learners...
      </p>
    );
  }

  if (!users.length) {
    return (
      <p className="p-4 text-center text-lg font-medium">No learners found</p>
    );
  }

  const getStatusColor = (status: string) => {
    const lower = status?.toLowerCase();
    if (lower === "active") return "bg-green-500";
    if (lower === "disabled") return "bg-red-500";
    return "bg-gray-400";
  };

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Learners Progress</h1>
      <p className="text-sm text-gray-600">
        Cohort:{" "}
        <span className="font-medium text-blue-600">
          {cohort?.cohortName || cohortId}
        </span>
      </p>

      {/* LIST OF STUDENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {users.map((u) => (
          <div
            key={u.userId}
            className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
            onClick={() =>
              navigate(`/mentor/student/${u.userId}`, {
                state: { cohortId, programId },
              })
            }
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                  {u.userName?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <h2 className="font-semibold">{u.userName}</h2>
                  <p className="text-xs text-gray-500">@{u.userId}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(u.status)}`} />
            </div>

            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Last Login</span>
                <span className="font-medium">{u.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Score</span>
                <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold">
                  {u.leaderboardScore}
                </span>
              </div>
            </div>

            <div className="flex justify-end items-center text-blue-600 font-medium gap-1 mt-1">
              View Details
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* OVERALL ANALYTICS */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Cohort Analytics Overview</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setViewMode("bar")}
            className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
              viewMode === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode("line")}
            className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
              viewMode === "line"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-md text-sm cursor-pointer ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            Table View
          </button>
        </div>

        {viewMode === "bar" && (
          <LearnersProgressChart users={users} programId={programId} />
        )}
        {viewMode === "line" && <LineProgressChart users={users} />}
        {viewMode === "table" && <ProgressDataTable users={users} />}
      </div>
    </div>
  );
}
