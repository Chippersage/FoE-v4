import React, { useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { BarChart3, Users, Activity, LogOut, FileText, BarChart, PieChart, ClipboardList, List } from "lucide-react";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";

interface MentorSideNavProps {
  cohortId: string;
  mentorId: string;
}

const navItems = [
  { label: "Dashboard", icon: BarChart3, path: "dashboard", needsProgram: true },
  { label: "Learners Details", icon: Users, path: "Learners Details", needsProgram: false },
  { label: "Activity Monitor", icon: Activity, path: "activity", needsProgram: false },
  { label: "Assignments", icon: FileText, path: "assignments", needsProgram: false },
  { label: "Reports", icon: BarChart, path: "reports", needsProgram: true },
  { label: "Analytics", icon: PieChart, path: "analytics", needsProgram: false },
  { label: "Session Logs", icon: ClipboardList, path: "session-logs", needsProgram: false },
  { label: "Cohort Details", icon: List, path: "cohort-details", needsProgram: false },
];

export default function MentorSideNav({ cohortId: cohortIdProp }: MentorSideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // may contain cohortId and programId depending on route
  const cohortId = cohortIdProp ?? params.cohortId ?? "";
  const urlProgramId = params.programId ?? "";

  const { clearAuth, user, selectedCohortWithProgram } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const programId = useMemo(() => {
    if (urlProgramId) return urlProgramId;
    if (user?.selectedProgramId) return user.selectedProgramId;
    try {
      const stored = localStorage.getItem("selectedCohortWithProgram");
      if (stored) {
        const obj = JSON.parse(stored);
        if (obj?.program?.programId) return obj.program.programId;
        if (obj?.selectedProgramId) return obj.selectedProgramId;
      }
    } catch (e) {
      /* ignore parse errors */
    }
    return "";
  }, [urlProgramId, user]);

  // returns the correct path (includes programId if nav item needs it)
  const makePath = (itemPath: string, needsProgram: boolean) => {
    if (!cohortId) return `/mentor/${itemPath}`; // fallback
    if (needsProgram) {
      // prefer programId; if missing, we still build path without programId so navigation can fall back to redirect route
      return programId ? `/mentor/${cohortId}/${programId}/${itemPath}` : `/mentor/${cohortId}/${itemPath}`;
    }
    return `/mentor/${cohortId}/${itemPath}`;
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/users/logout`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      clearAuth();
      localStorage.removeItem("selectedCohortWithProgram");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userData");
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      clearAuth();
      localStorage.removeItem("selectedCohortWithProgram");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userData");
      navigate("/sign-in");
    } finally {
      setIsLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      {isLoading && <LoadingOverlay />}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelLogout} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">FoE Mentor</h1>
          <p className="text-sm text-gray-500">Cohort Management</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const target = makePath(item.path, !!item.needsProgram);
            const isActive = location.pathname.startsWith(target) || location.pathname.includes(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(target)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button onClick={confirmLogout} className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}