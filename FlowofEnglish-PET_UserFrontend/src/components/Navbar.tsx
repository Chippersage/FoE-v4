// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { XCircle, Menu, Eye } from "lucide-react";

// Import demo user check
import { isDemoUser } from "../config/demoUsers";

type NavbarProps = {
  toggleSidebar?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCurrentUserDemo, setIsCurrentUserDemo] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, setIsAuthenticated, setUser } = useUserContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const userName = user?.userName || "User";
  const isSelectCohortPage = location.pathname === "/select-cohort";

  const isMentor = user?.userType === "Mentor";
  const isMentorRoute = location.pathname.startsWith("/mentor");
  const showMentorHamburger = isMentor && isMentorRoute;

  // Check if current user is a demo user
  useEffect(() => {
    if (user?.userId) {
      setIsCurrentUserDemo(isDemoUser(user.userId));
    }
  }, [user?.userId]);

  const menuItems = [
    { title: "Profile", path: "/profile", id: "profile", demoAccessible: false },
    { title: "View Progress", path: "/view-progress", id: "view-progress", demoAccessible: false },
    { title: "About Program", path: "/about-program", id: "about-program", demoAccessible: false },
    { title: "Help", path: "/help", id: "help", demoAccessible: false },
    { title: "Terms of Use", path: "/terms", id: "terms", demoAccessible: false },
  ];

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

      localStorage.clear();
      setIsAuthenticated(false);
      setUser({
        userId: "",
        userName: "",
        userEmail: "",
        userType: "",
      });

      toast.success("Logged out successfully");
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Logout failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleendCohortSession = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/users/logout`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Session cleanup failed:", err);
    }

    localStorage.removeItem("sessionId");
    localStorage.removeItem("selectedCohort");
  };

  const handleMenuClick = (item) => {
    // Demo users cannot access View Progress
    if (isCurrentUserDemo && item.id === "view-progress") {
      toast.error("View Progress is not available in Demo Mode");
      setMenuOpen(false);
      return;
    }

    if (item.id === "view-progress") {
      navigate(item.path);
      setMenuOpen(false);
      return;
    }

    // All other menu items show "Coming soon"
    toast("Coming soon...");
    setMenuOpen(false);
  };

  // Function to check if a menu item should be disabled
  const isMenuItemDisabled = (item) => {
    // For demo users: Disable View Progress and non-accessible items
    if (isCurrentUserDemo) {
      if (item.id === "view-progress") return true;
      if (!item.demoAccessible) return true;
    }
    
    // For all users: Only enable View Progress
    return item.id !== "view-progress";
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center justify-between px-4 py-2 h-14">

        <div
          className={`flex items-center gap-2 select-none ${
            isSelectCohortPage
              ? "cursor-default opacity-80"
              : "cursor-pointer hover:opacity-90"
          }`}
          onClick={async () => {
            await handleendCohortSession();
            if (!isSelectCohortPage) navigate("/select-cohort");
          }}
        >
          {showMentorHamburger && (
            <button
              className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar && toggleSidebar();
              }}
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <img
            src="/icons/chipper-sage-logo.png"
            alt="Logo"
            className={`w-14 h-14 sm:w-20 sm:h-20 object-contain ${
              showMentorHamburger ? "hidden lg:block" : ""
            }`}
          />
          <h1 className="text-lg font-semibold text-black tracking-tight">
            Professional English for Teachers
          </h1>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="text-sm font-medium text-[#0EA5E9] break-words max-w-[160px] text-right leading-tight">
              {userName}
            </span>
          </div>

          {/* Profile bubble - SAME YELLOW COLOR for demo users */}
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md cursor-pointer select-none hover:scale-105 transition-all"
            style={{
              backgroundColor: isCurrentUserDemo ? '#f59e0b' : '#0EA5E9' // Yellow for demo, blue for regular
            }}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            {userName?.trim().charAt(0).toUpperCase()}
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                className="absolute right-0 top-12 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
              >
                {/* Demo User Indicator - Inside menu only */}
                {isCurrentUserDemo && (
                  <div className="bg-yellow-50 border-b border-yellow-200 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Eye size={12} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-yellow-800">Demo Account</p>
                        <p className="text-xs text-yellow-600 mt-0.5">Limited features available</p>
                      </div>
                    </div>
                  </div>
                )}

                {menuItems.map((item, idx) => {
                  const isDisabled = isMenuItemDisabled(item);
                  const isHovered = hoveredItem === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMenuClick(item)}
                      onMouseEnter={() => setHoveredItem(idx)}
                      onMouseLeave={() => setHoveredItem(null)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-all ${
                        isDisabled
                          ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "text-gray-700 hover:bg-[#E0F4FD] hover:text-[#0EA5E9] cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.title}</span>
                        {isCurrentUserDemo && item.id === "view-progress" && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                            Restricted
                          </span>
                        )}
                      </div>

                      {isDisabled && isHovered && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <XCircle size={16} className="text-gray-400 transition-all duration-150" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}

                <div className="border-t border-gray-200 my-1" />

                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-all ${
                    isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                  }`}
                >
                  {isLoading ? "Logging out..." : "Logout"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;