// @ts-nocheck
import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  BarChart3,
  Users,
  Activity,
  FileText,
  BarChart,
  PieChart,
  List,
  ChevronDown
} from "lucide-react";
import { useUserContext } from "../../context/AuthContext";

export default function MentorSideNav({ onNavigate = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useUserContext();

  // Read selected cohort from localStorage
  const stored = localStorage.getItem("selectedCohort");
  const selected = stored ? JSON.parse(stored) : null;

  // These must be used for navigation
  const lsCohortId = selected?.cohortId || params.cohortId || "123";
  const lsProgramId = selected?.programId || params.programId || "999";
  const cohortNameLS = selected?.cohortName || "Select Cohort";
  const programNameLS = selected?.programName || "";

  const mentorName = user?.userName || user?.userId || "Mentor";

  const [showCohortDropdown, setShowCohortDropdown] = useState(false);

  // Hardcoded list remains as received
  const cohorts = [
    { cohortId: "123", cohortName: "Cohort Alpha", programId: "999", programName: "English L1" },
    { cohortId: "456", cohortName: "Cohort Beta", programId: "888", programName: "English L2" }
  ];

  // Displaying currently selected cohort
  const selectedCohort = { cohortName: cohortNameLS, programName: programNameLS };

  // Updated: learners requires programId to match the route /mentor/:cohortId/:programId/learners
  const navItems = [
    { label: "Dashboard", icon: BarChart3, path: "dashboard", needsProgram: true },
    { label: "Learners", icon: Users, path: "learners", needsProgram: true },
    { label: "Assignments", icon: FileText, path: "assignments", needsProgram: true },
    { label: "Reports", icon: BarChart, path: "reports", needsProgram: true },
    { label: "Analytics", icon: PieChart, path: "analytics", needsProgram: false },
    { label: "Cohort Details", icon: List, path: "cohort-details", needsProgram: false, enabled: false },
  ];

  // Navigation builder using localStorage cohortId + programId
  const makePath = (p, needsProgram) =>
    needsProgram
      ? `/mentor/${lsCohortId}/${lsProgramId}/${p}`
      : `/mentor/${lsCohortId}/${p}`;

  const isDirectDashboard = location.pathname === "/mentor/dashboard";

  return (
    <aside
      className="
        fixed 
        top-14 
        left-0
        h-[calc(100vh-56px)]
        w-64 
        bg-white 
        p-4 
        flex flex-col 
        overflow-y-auto 
        z-40
      "
    >
      {/* Mentor info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-base">
            {mentorName.charAt(0).toUpperCase()}
          </div>

          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold text-gray-800 truncate">
              {mentorName}
            </h1>
            <p className="text-[12px] text-gray-500">Mentor</p>
          </div>
        </div>

        {/* Cohort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCohortDropdown(!showCohortDropdown)}
            className="
              w-full bg-blue-50 rounded-lg 
              px-3 py-2
              border border-blue-200 
              text-sm
              hover:bg-blue-100
            "
          >
            <div className="flex items-center justify-between">
              <div className="leading-tight">
                <p className="font-medium text-blue-800 text-[13px]">Current Cohort</p>
                <p className="text-blue-600 text-[12px] truncate">
                  {selectedCohort.cohortName}
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-blue-600 transition-transform ${
                  showCohortDropdown ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {showCohortDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto z-50">
              {cohorts.map((c) => (
                <button
                  key={c.cohortId}
                  onClick={() => {
                    navigate(`/mentor/${lsCohortId}/${lsProgramId}/dashboard`);
                    setShowCohortDropdown(false);
                    onNavigate();
                  }}
                  className="
                    w-full p-3 text-left text-sm
                    hover:bg-blue-50 leading-tight
                  "
                >
                  <p className="font-medium text-gray-800 truncate text-[13px]">{c.cohortName}</p>
                  <p className="text-gray-500 truncate text-[11px]">{c.programName}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          // Build final URL path
          const path = makePath(item.path, item.needsProgram);

          const active =
            location.pathname.startsWith(path) ||
            (item.label === "Dashboard" && isDirectDashboard);

          const disableClick = item.label === "Dashboard" && isDirectDashboard;

          return (
            <button
              key={item.path}
              onClick={() => {
                if (!disableClick) {
                  navigate(path);
                  onNavigate();
                }
              }}
              disabled={disableClick}
              className={`
                w-full flex items-center gap-3 
                px-3 py-2
                rounded-lg text-sm
                transition 
                ${
                  active
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${disableClick ? "cursor-default opacity-70" : ""}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>

              {item.enabled === false && (
                <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
