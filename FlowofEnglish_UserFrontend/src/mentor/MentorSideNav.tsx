import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Users, Activity, LogOut, FileText, BarChart, PieChart, ClipboardList, List } from "lucide-react";
import axios from "axios";
import { useUserContext } from "@/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";

interface MentorSideNavProps {
  cohortId: string;
  mentorId: string;
}

const navItems = [
  {
    label: "Dashboard",
    icon: BarChart3,
    path: "dashboard",
  },
  {
    label: "Learner Progress",
    icon: Users,
    path: "progress",
  },
  {
    label: "Activity Monitor",
    icon: Activity,
    path: "activity",
  },
  {
    label: "Assignments",
    icon: FileText,
    path: "assignments",
  },
  {
    label: "Reports",
    icon: BarChart,
    path: "reports",
  },
  {
    label: "Analytics",
    icon: PieChart,
    path: "analytics",
  },
  {
    label: "Session Logs",
    icon: ClipboardList,
    path: "session-logs",
  },
  {
    label: "Cohort Details",
    icon: List,
    path: "cohort-details",
  },

];

export default function MentorSideNav({ cohortId }: MentorSideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const basePath = `/mentor/${cohortId}`;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/users/logout`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      // Clear local storage and context
      clearAuth();
      localStorage.removeItem("selectedCohortWithProgram");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("userData");
      
      // Redirect to login page
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API call fails, clear local state and redirect
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

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
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
            const isActive = location.pathname.includes(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(`${basePath}/${item.path}`)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={confirmLogout}
          disabled={isLoading}
          className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}