// @ts-nocheck
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMentorProgress } from "../hooks/useMentorProgress";
import { Search, UserCheck, UserX, Users, ArrowRight } from "lucide-react";

import LearnersProgressChart from "../components/charts/LearnersProgressChart";
import LineProgressChart from "../components/charts/LineProgressChart";
import ProgressDataTable from "../components/charts/ProgressDataTable";

export default function MentorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const cohort = location.state?.cohort;
  const cohortId = cohort?.cohortId || location.state?.cohortId;
  const programId =
    cohort?.programId || cohort?.program?.programId || location.state?.programId;

  const { users, loading } = useMentorProgress(cohortId);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recentLogin");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("bar chart");

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  // Stats
  const activeCount = users.filter(u => u.status?.toString().toLowerCase() === "active").length;
  const total = users.length;
  const disabledCount = total - activeCount;

  const normalizeDate = (v) => {
    const parsed = Date.parse(v);
    return isNaN(parsed) ? 0 : parsed;
  };

  // --- Filtering & Sorting ---
  let filteredUsers = [...users];

  if (searchTerm.trim()) {
    filteredUsers = filteredUsers.filter(u =>
      u.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterStatus !== "all") {
    filteredUsers = filteredUsers.filter(u =>
      filterStatus === "active" ? u.status?.toString().toLowerCase() === "active" : u.status?.toString().toLowerCase() !== "active"
    );
  }

  const sorter = {
    recentLogin: (a, b) => normalizeDate(b.lastLogin) - normalizeDate(a.lastLogin),
    nameAsc: (a, b) => a.userName.localeCompare(b.userName),
    nameDesc: (a, b) => b.userName.localeCompare(a.userName),
    scoreHigh: (a, b) => b.leaderboardScore - a.leaderboardScore,
    scoreLow: (a, b) => a.leaderboardScore - b.leaderboardScore,
  };

  filteredUsers.sort(sorter[sortOption]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0EA5E9] tracking-tight">
          Learners Overview
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Cohort:&nbsp;
          <span className="font-medium">{cohort?.cohortName}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        <Badge icon={<Users size={16} />} label="Total" value={total} color="bg-[#0EA5E9]" />
        <Badge icon={<UserCheck size={16} />} label="Active" value={activeCount} color="bg-blue-500" />
        <Badge icon={<UserX size={16} />} label="Inactive" value={disabledCount} color="bg-gray-400" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        {/* Search */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-[#0EA5E9]">
          <Search size={16} className="text-[#0EA5E9]" />
          <input
            placeholder="Search learner..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="outline-none text-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2">
          {["all", "active", "inactive"].map(option => (
            <button
              key={option}
              className={`px-4 py-1.5 rounded-full text-xs shadow-sm transition 
                ${
                  filterStatus === option
                    ? "bg-[#0EA5E9] text-white"
                    : "bg-white border border-[#0EA5E9] text-[#0EA5E9]"
                }`}
              onClick={() => setFilterStatus(option)}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          className="px-4 py-2 bg-white rounded-full shadow-sm text-xs border border-[#0EA5E9]"
        >
          <option value="recentLogin">Latest Login</option>
          <option value="nameAsc">Name A → Z</option>
          <option value="nameDesc">Name Z → A</option>
          <option value="scoreHigh">Score High → Low</option>
          <option value="scoreLow">Score Low → High</option>
        </select>
      </div>

      {/* Users */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {filteredUsers.map(u => (
          <div
            key={u.userId}
            onClick={() =>
              navigate(`/mentor/student/${u.userId}`, { state: { cohortId, programId } })
            }
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all cursor-pointer border border-[#0EA5E9]"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-sm font-semibold">
                  {u.userName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{u.userName}</p>
                  <p className="text-[10px] text-slate-500">@{u.userId}</p>
                </div>
              </div>
              <span
                className={`w-3 h-3 rounded-full ${
                  u.status?.toString().toLowerCase() === "active" ? "bg-blue-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="text-[11px] text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Last Login</span>
                <span className="font-medium">{u.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span>Score</span>
                <span className="font-semibold">{u.leaderboardScore}</span>
              </div>
            </div>

            <div className="flex items-center justify-end text-[#0EA5E9] text-[11px] font-medium gap-1 mt-3">
              View Details <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="pt-4 space-y-3">
        <div className="flex gap-2">
          {["bar chart", "line chart", "table"].map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-2 rounded-full text-xs transition 
              ${
                viewMode === m
                  ? "bg-[#0EA5E9] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {viewMode === "bar chart" && <LearnersProgressChart users={users} programId={programId} />}
        {viewMode === "line chart" && <LineProgressChart users={users} />}
        {viewMode === "table" && <ProgressDataTable users={users} />}
      </div>
    </div>
  );
}

/* ---- Minimal Stat Badge Component ---- */
const Badge = ({ icon, value, label, color }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm ${color}`}>
    {icon}
    <div>
      <p className="text-[10px] uppercase opacity-80">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  </div>
);
