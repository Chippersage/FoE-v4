import LoadingOverlay from "@/components/LoadingOverlay";
import { useUserContext } from "@/context/AuthContext";
import { fetchMentorCohorts, type CohortWithProgram } from "@/mentor/mentor-api";
import axios from "axios";
import { BarChart, BarChart3, ChevronDown, FileText, List, LogOut, Menu, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface MentorSideNavProps {
  cohortId: string;
  mentorId: string;
}

const navItems = [
  { label: "Dashboard", icon: BarChart3, path: "dashboard", needsProgram: true, enabled: true },
  { label: "Learners Details", icon: Users, path: "learners", needsProgram: false, enabled: true },
  //{ label: "Activity Monitor", icon: Activity, path: "activity", needsProgram: false, enabled: true },
  { label: "Assignments", icon: FileText, path: "assignments", needsProgram: false, enabled: true },
  { label: "Reports", icon: BarChart, path: "reports", needsProgram: true, enabled: true },
  // { label: "Analytics", icon: PieChart, path: "analytics", needsProgram: false, enabled: true },
  { label: "Cohort Details", icon: List, path: "cohort-details", needsProgram: false, enabled: false },
  // { label: "Session Logs", icon: ClipboardList, path: "session-logs", needsProgram: false, enabled: true },
];

export default function MentorSideNav({ cohortId: cohortIdProp }: MentorSideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const cohortId = cohortIdProp ?? params.cohortId ?? "";
  const urlProgramId = params.programId ?? "";

  const { clearAuth, user, selectedCohortWithProgram, setSelectedCohortWithProgram, setIsChangingCohort } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCohortDropdown, setShowCohortDropdown] = useState(false);
  const [allCohorts, setAllCohorts] = useState<CohortWithProgram[]>([]);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

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

  // Get mentor name
  const mentorName = useMemo(() => {
    if (user?.userName) return user.userName;
    if (user?.userId) return user.userId;
    
    try {
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData?.userName || userData?.userId || "Mentor";
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }
    
    return "Mentor";
  }, [user]);

  // Fetch all cohorts on mount
  useEffect(() => {
    if (user?.userId) {
      fetchAllCohorts();
    }
  }, [user?.userId]);

  const fetchAllCohorts = async () => {
    if (!user?.userId) return;
    
    setLoadingCohorts(true);
    try {
      const data = await fetchMentorCohorts(user.userId);
      if (data.userDetails?.allCohortsWithPrograms) {
        setAllCohorts(data.userDetails.allCohortsWithPrograms);
      }
    } catch (error) {
      console.error("Error fetching cohorts:", error);
    } finally {
      setLoadingCohorts(false);
    }
  };

  const handleCohortChange = async (newCohort: CohortWithProgram) => {
  if (isChanging) return;
  
  setIsChanging(true);
  setIsChangingCohort(true);
  
  // Update context and localStorage
  if (setSelectedCohortWithProgram) {
    setSelectedCohortWithProgram(newCohort);
  }

  localStorage.setItem("selectedCohortWithProgram", JSON.stringify(newCohort));
  
  // Wait a bit to ensure state updates propagate
  await new Promise(resolve => setTimeout(resolve, 100));

  // Navigate to the dashboard of the new cohort
  const newPath = `/mentor/${newCohort.cohortId}/${newCohort.program.programId}/dashboard`;
  navigate(newPath);
  setShowCohortDropdown(false);
  setIsMobileMenuOpen(false);
  
  setTimeout(() => {
    setIsChangingCohort(false);
    setIsChanging(false);
  }, 500);
};
  // returns the correct path
  const makePath = (itemPath: string, needsProgram: boolean) => {
    if (!cohortId) return `/mentor/${itemPath}`;
    if (needsProgram) {
      return programId ? `/mentor/${cohortId}/${programId}/${itemPath}` : `/mentor/${cohortId}/${itemPath}`;
    }
    return `/mentor/${cohortId}/${itemPath}`;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
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
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white shadow-md border border-gray-200"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 p-4 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-8">
          {/* Mentor Profile Section */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {mentorName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">
                {mentorName}
              </h1>
              <p className="text-sm text-gray-500">Mentor</p>
            </div>
          </div>
          
          {/* Cohort Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCohortDropdown(!showCohortDropdown)}
              className="w-full bg-blue-50 rounded-lg p-3 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800">Current Cohort</p>
                  <p className="text-sm text-blue-600 truncate">
                    {selectedCohortWithProgram?.cohortName || "Select Cohort"}
                  </p>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-blue-600 transition-transform ${showCohortDropdown ? 'rotate-180' : ''}`} 
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showCohortDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                {loadingCohorts ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading cohorts...
                  </div>
                ) : allCohorts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No cohorts available
                  </div>
                ) : (
                  allCohorts.map((cohort) => (
                    <button
                      key={cohort.cohortId}
                      onClick={() => { handleCohortChange(cohort).catch(console.error) }}
                      className={`w-full p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        cohort.cohortId === cohortId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {cohort.cohortName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {cohort.program.programName}
                      </p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const target = makePath(item.path, !!item.needsProgram);
            const isActive = location.pathname.startsWith(target) || location.pathname.includes(item.path);
            const isEnabled = item.enabled;

            return (
              <button
                key={item.path}
                onClick={() => isEnabled && handleNavigation(target)}
                disabled={!isEnabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isEnabled 
                    ? isActive 
                      ? "bg-blue-50 text-blue-600 font-semibold border border-blue-200 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    : "text-gray-400 cursor-not-allowed opacity-60"
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-left truncate">{item.label}</span>
                {!isEnabled && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={confirmLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg w-full transition-all duration-200 mt-4"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}