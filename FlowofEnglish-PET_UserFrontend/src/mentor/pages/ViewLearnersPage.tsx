// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMentorProgress } from "../hooks/useMentorProgress";
import { Search, UserCheck, UserX, Users } from "lucide-react";
import ManageUserAccountModal from "../components/modals/ManageUserAccountModal";

export default function ViewLearnersPage() {
  const navigate = useNavigate();

  // Always load cohort from localStorage
  const cohort = JSON.parse(localStorage.getItem("selectedCohort"));

  const cohortId = cohort?.cohortId;
  const programId =
    cohort?.programId || cohort?.program?.programId || cohort?.programName;

  const { users, loading } = useMentorProgress(cohortId);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recentLogin");
  const [filterStatus, setFilterStatus] = useState("all");

  // MODAL STATES
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("disable");

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  const activeCount = users.filter(
    (u) => u.status?.toString().toLowerCase() === "active"
  ).length;

  const total = users.length;
  const disabledCount = total - activeCount;

  const normalizeDate = (v) => {
    const parsed = Date.parse(v);
    return isNaN(parsed) ? 0 : parsed;
  };

  let filteredUsers = [...users];

  // Search filter
  if (searchTerm.trim()) {
    filteredUsers = filteredUsers.filter((u) =>
      u.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Active / inactive filter
  if (filterStatus !== "all") {
    filteredUsers = filteredUsers.filter((u) =>
      filterStatus === "active"
        ? u.status?.toLowerCase() === "active"
        : u.status?.toLowerCase() !== "active"
    );
  }

  // Sorting options
  const sorter = {
    recentLogin: (a, b) =>
      normalizeDate(b.lastLogin) - normalizeDate(a.lastLogin),
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

      {/* Filters section */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm border border-[#0EA5E9]">
          <Search size={16} className="text-[#0EA5E9]" />
          <input
            placeholder="Search learner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm"
          />
        </div>

        {/* Active/Inactive filters */}
        <div className="flex gap-2">
          {["all", "active", "inactive"].map((option) => (
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

        {/* Sorting */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 bg-white rounded-full shadow-sm text-xs border border-[#0EA5E9]"
        >
          <option value="recentLogin">Latest Login</option>
          <option value="nameAsc">Name A → Z</option>
          <option value="nameDesc">Name Z → A</option>
          <option value="scoreHigh">Score High → Low</option>
          <option value="scoreLow">Score Low → High</option>
        </select>
      </div>

      {/* Learners Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full bg-white rounded-3xl shadow-sm border border-[#0EA5E9] overflow-hidden">
          <thead className="bg-[#0EA5E9]/10">
            <tr className="text-xs text-slate-600">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Last Login</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.userId}
                className="border-b border-[#0EA5E9]/20 hover:bg-[#0EA5E9]/5 cursor-pointer transition"
                onClick={() =>
                  navigate(
                    `/mentor/${cohortId}/${programId}/learner/${u.userId}`
                  )
                }
              >
                {/* User details */}
                <td className="px-4 py-3 text-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-semibold">
                    {u.userName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{u.userName}</p>
                    <p className="text-[10px] text-slate-500">@{u.userId}</p>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                      u.status?.toLowerCase() === "active"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                {/* Last login */}
                <td className="px-4 py-3 text-sm">{u.lastLogin}</td>

                {/* Score */}
                <td className="px-4 py-3 text-sm font-semibold">
                  {u.leaderboardScore}
                </td>

                {/* Toggle button */}
                <td
                  className="px-4 py-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                      u.status?.toLowerCase() === "active"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                    onClick={() => {
                      const fullUser = users.find((item) => item.userId === u.userId);
setSelectedUser(fullUser);
                      setModalMode(
                        u.status?.toLowerCase() === "active"
                          ? "disable"
                          : "reactivate"
                      ); 
                      setModalOpen(true);
                    }}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow transform transition ${
                        u.status?.toLowerCase() === "active"
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <ManageUserAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        cohortId={cohortId}
        mode={modalMode}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

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
