"use client";

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Home,
  User,
  BarChart2,
  Info,
  LogOut,
  HelpCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useUserContext, INITIAL_USER_STATE } from "@/context/AuthContext";

interface UnifiedHeaderProps {
  variant?: "default" | "transparent" | "minimal";
  showBranding?: boolean;
}

export default function UnifiedHeader({ 
  variant = "default", 
  showBranding = true 
}: UnifiedHeaderProps) {
  const {
    user,
    selectedCohortWithProgram,
    setIsAuthenticated,
    setUser,
    setSelectedCohortWithProgram,
  } = useUserContext();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const currentPath = location.pathname;
  const [isLoading, setIsLoading] = useState(false);

  const isSelectCohortPage = currentPath === "/select-cohort";
  const isAuthPage = currentPath.includes("/sign-in") || currentPath.includes("/sign-up");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = async () => {
    if (currentPath === "/dashboard") {
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

        // First update the context
        setSelectedCohortWithProgram(null);

        // Then remove from localStorage
        const userDataStr = localStorage.getItem("user");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userData.selectedCohortWithProgram = null;
          localStorage.setItem("user", JSON.stringify(userData));
        }
        localStorage.removeItem("selectedCohortWithProgram");

        // Finally navigate
        navigate("/select-cohort", { replace: true });
      } catch (error) {
        console.error("Error during logout:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else if (
      selectedCohortWithProgram &&
      selectedCohortWithProgram !== "null"
    ) {
      navigate("/dashboard");
    } else {
      console.log("Cohort not selected or is null.");
    }
  };

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

      // Then clear localStorage
      localStorage.clear(); // This will clear all localStorage items

      // Clear context state after successful logout
      setIsAuthenticated(false);
      setUser(INITIAL_USER_STATE);

      // Navigate last
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
      setMenuOpen(false);
    }
  };

  // Menu items configuration
  const menuItems = [
    {
      id: "profile",
      title: "Profile",
      description: "View your details",
      icon: <User className="w-4 h-4" />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      onClick: () => navigateTo("/profile"),
      disabled: true,
    },
    {
      id: "analytics",
      title: "View Progress",
      description: "Check your analytics",
      icon: <BarChart2 className="w-4 h-4" />,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      onClick: () => navigateTo("/view-progress"),
    },
    {
      id: "about-program",
      title: "About Program",
      description: "Learn more about our program",
      icon: <Info className="w-4 h-4" />,
      bgColor: "bg-slate-50",
      textColor: "text-slate-600",
      onClick: () => navigateTo("/about-program"),
      disabled: true,
    },
    {
      id: "help",
      title: "Help",
      description: "Get assistance with your questions",
      icon: <HelpCircle className="w-4 h-4" />,
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      onClick: () => navigateTo("/help"),
      disabled: true,
    },
    {
      id: "terms-of-use",
      title: "Terms of use",
      description: "Read our terms of use",
      icon: <FileText className="w-4 h-4" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      onClick: () => navigateTo("/terms-of-use"),
      disabled: true,
    },
    {
      id: "logout",
      title: "Logout",
      description: "Sign out of your account",
      icon: <LogOut className="w-4 h-4" />,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Determine header styling based on variant and authentication
  const getHeaderClasses = () => {
    if (isAuthPage) {
      return "bg-white/95 backdrop-blur-lg border-b border-slate-200/50";
    }
    
    switch (variant) {
      case "transparent":
        return "bg-white/80 backdrop-blur-lg border-b border-slate-200/30";
      case "minimal":
        return "bg-transparent";
      default:
        return "bg-white/90 backdrop-blur-xl border-b border-slate-200/40 shadow-sm";
    }
  };

  const getTextClasses = () => {
    return "text-slate-800";
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 ${getHeaderClasses()}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        opacity: { duration: 0.3 }
      }}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Navigation Icon (for authenticated users) */}
            {user && !isAuthPage && (
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {(isSelectCohortPage || isLoading) ? (
                  <Home className="w-5 h-5 text-slate-600" />
                ) : (
                  <button
                    onClick={!isLoading ? handleNavigation : undefined}
                    className="disabled:opacity-50"
                    disabled={isLoading}
                    aria-label="Go to Home"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Brand/Logo Section */}
            {showBranding && (
              <Link 
                to={user ? "/dashboard" : "/"} 
                className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg group-hover:shadow-xl transition-shadow p-1">
                  <img 
                    src="/icons/mindful_logo_circle.png" 
                    alt="Chippersage Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <h1 className={`text-lg font-bold leading-tight tracking-tight ${getTextClasses()}`}>
                    mindfultalk.in
                  </h1>
                  <span className="text-xs uppercase tracking-wider font-medium text-slate-500">
                    Learning Platform
                  </span>
                </div>
              </Link>
            )}

            {/* Welcome Message (for authenticated users) */}
            {user && !isAuthPage && (
              <motion.div
                className="hidden md:block ml-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${getTextClasses()}`}>
                    Welcome, {user.userName}
                  </span>
                  {selectedCohortWithProgram && (
                    <span className="text-xs text-slate-500">
                      {selectedCohortWithProgram.program?.programName}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Branding (for non-authenticated users) */}
            {!user && showBranding && (
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm p-1">
                  <img 
                    src="/chipper-sage-logo.png" 
                    alt="Chippersage Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">Chippersage</span>
                  <span className="text-xs text-slate-500">Learning Platform</span>
                </div>
              </div>
            )}

            {/* User Menu (for authenticated users) */}
            {user && !isAuthPage && (
              <div className="relative">
                <motion.div
                  ref={avatarRef}
                  onClick={toggleMenu}
                  className="flex items-center cursor-pointer rounded-xl pl-3 pr-4 py-2.5 transition-all duration-200 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 hover:border-slate-300/60 shadow-sm hover:shadow-md"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.userName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="ml-3 text-sm font-medium hidden sm:inline-block text-slate-800">
                    {user.userName?.split(" ")[0]}
                  </span>
                  <motion.div
                    animate={{ rotate: menuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 ml-2 text-slate-600" />
                  </motion.div>
                </motion.div>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                      className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 py-3 z-50 overflow-hidden"
                    >
                      {menuItems.map((item, index) => (
                        <motion.button
                          key={item.id}
                          onClick={item.onClick}
                          disabled={item.disabled || isLoading}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50/80 rounded-xl mx-2 transition-all duration-200 flex items-center gap-3 ${
                            item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"
                          } ${item.danger ? "hover:bg-red-50/80" : ""}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                          whileHover={{ x: 2 }}
                        >
                          <div className={`p-2 rounded-lg ${item.bgColor}`}>
                            <div className={item.textColor}>{item.icon}</div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{item.title}</div>
                            <div className="text-xs text-slate-500">{item.description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
