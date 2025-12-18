// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Users,
  FileText,
  BarChart,
  PieChart,
  List,
  ChevronDown,
} from "lucide-react";
import { useUserContext } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function MentorSideNav({ onNavigate = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useUserContext();

  const mentorId = user?.userId;

  const [cohorts, setCohorts] = useState([]);
  const [showCohortDropdown, setShowCohortDropdown] = useState(false);

  /** -------------------------------
   * Read selected cohort from LS
   -------------------------------- */
  const stored = localStorage.getItem("selectedCohort");
  const selected = stored ? JSON.parse(stored) : null;

  const lsCohortId = selected?.cohortId || params.cohortId;
  const lsProgramId = selected?.programId || params.programId;
  const cohortNameLS = selected?.cohortName || "Select Cohort";
  const programNameLS = selected?.programName || "";

  const mentorName = user?.userName || mentorId || "Mentor";

  /** -------------------------------
   * Redirect if cohort missing
   -------------------------------- */
  useEffect(() => {
    if (!lsCohortId || !lsProgramId) {
      navigate("/select-cohort");
    }
  }, [lsCohortId, lsProgramId]);

  /** -------------------------------
   * Fetch cohorts + progress
   -------------------------------- */
  useEffect(() => {
    if (!mentorId) return;

    const fetchCohorts = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/users/${mentorId}/cohorts`
        );

        const userDetails = res.data?.userDetails;
        const list = userDetails?.allCohortsWithPrograms || [];

        const formatted = await Promise.all(
          list.map(async (c) => {
            let progress = 0;

            try {
              const progressRes = await axios.get(
                `${API_BASE_URL}/reports/program/${c.program?.programId}/user/${mentorId}/progress`
              );

              const total = progressRes.data?.totalSubconcepts || 0;
              const completed = progressRes.data?.completedSubconcepts || 0;

              progress =
                total > 0 ? Math.round((completed / total) * 100) : 0;
            } catch {
              progress = 0;
            }

            return {
              cohortId: c.cohortId,
              cohortName: c.cohortName,
              cohortStartDate: new Date(c.cohortStartDate * 1000).toISOString(),
              cohortEndDate: new Date(c.cohortEndDate * 1000).toISOString(),
              showLeaderboard: c.showLeaderboard,
              delayedStageUnlock: c.delayedStageUnlock,
              delayInDays: c.delayInDays,
              enableAiEvaluation: c.enableAiEvaluation,
              organization: userDetails.organization,
              programId: c.program?.programId,
              programName: c.program?.programName,
              programDesc: c.program?.programDesc,
              stagesCount: c.program?.stagesCount,
              unitCount: c.program?.unitCount,
              progress,
            };
          })
        );

        setCohorts(formatted);
      } catch (err) {
        console.error("Failed to load mentor cohorts", err);
      }
    };

    fetchCohorts();
  }, [mentorId]);

  /** -------------------------------
   * Handle cohort switch
   -------------------------------- */
  const handleSelectCohort = (cohort) => {
    localStorage.setItem("selectedCohort", JSON.stringify(cohort));
    setShowCohortDropdown(false);
    navigate(`/mentor/${cohort.cohortId}/${cohort.programId}/dashboard`);
    onNavigate();
  };

  /** -------------------------------
   * Sidebar nav config
   -------------------------------- */
  const navItems = [
    { label: "Dashboard", icon: BarChart3, path: "dashboard", needsProgram: true },
    { label: "Learners", icon: Users, path: "learners", needsProgram: true },
    { label: "Assignments", icon: FileText, path: "assignments", needsProgram: true },
    { label: "Reports", icon: BarChart, path: "reports", needsProgram: true },
    { label: "Cohort Details", icon: List, path: "cohort-details", needsProgram: true },
  ];

  const makePath = (p, needsProgram) =>
    needsProgram
      ? `/mentor/${lsCohortId}/${lsProgramId}/${p}`
      : `/mentor/${lsCohortId}/${p}`;

  const isDirectDashboard = location.pathname === "/mentor/dashboard";

  return (
    <aside className="fixed top-14 left-0 h-[calc(100vh-56px)] w-64 bg-white p-4 flex flex-col z-40">
      {/* Mentor info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            {mentorName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-800 truncate">
              {mentorName}
            </h1>
            <p className="text-xs text-gray-500">Mentor</p>
          </div>
        </div>

        {/* Cohort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCohortDropdown(!showCohortDropdown)}
            className="w-full bg-blue-50 rounded-lg px-3 py-2 border border-blue-200 text-sm"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <p className="text-xs font-medium text-blue-800">Current Cohort</p>
                <p className="text-[11px] text-blue-600 truncate">
                  {cohortNameLS}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-blue-600 transition ${
                  showCohortDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {showCohortDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow max-h-60 overflow-y-auto z-50">
              {cohorts.map((c) => (
                <button
                  key={c.cohortId}
                  onClick={() => handleSelectCohort(c)}
                  className="w-full p-3 text-left hover:bg-blue-50"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {c.cohortName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {c.programName} • {c.progress}%
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const path = makePath(item.path, item.needsProgram);

          const active =
            location.pathname.startsWith(path) ||
            (item.label === "Dashboard" && isDirectDashboard);

          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(path);
                onNavigate();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
