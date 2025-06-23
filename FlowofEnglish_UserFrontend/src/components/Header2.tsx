"use client";

import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Home,
  User,
  BarChart2,
  Building2,
  Info,
  LogOut,
  HelpCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useUserContext, INITIAL_USER_STATE } from "@/context/AuthContext";
import LoadingOverlay from "./LoadingOverlay";

export default function Header() {
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // const { resetSession } = useSession();

  // Update current path when component mounts
  // useEffect(() => {
  //   setCurrentPath(window.location.pathname);
  // }, []);

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
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  // Menu items configuration
  const menuItems = [
    {
      id: "profile",
      title: "Profile",
      description: "View your details",
      icon: <User className="w-4 h-4" />,
      bgColor: "bg-teal-100",
      textColor: "text-teal-600",
      onClick: () => navigateTo("/profile"),
      disabled: true, // 👈 disable this item
    },
    {
      id: "analytics",
      title: "View Progress",
      description: "Check your analytics",
      icon: <BarChart2 className="w-4 h-4" />,
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      onClick: () => navigateTo("/view-progress"),
    },
    {
      id: "about-program",
      title: "About Program",
      description: "Learn more about our program",
      icon: <Info className="w-4 h-4" />,
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      onClick: () => navigateTo("/about-program"),
      disabled: true, // 👈 disable this item
    },
    {
      id: "help",
      title: "Help",
      description: "Get assistance with your questions",
      icon: <HelpCircle className="w-4 h-4" />, // More intuitive
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      onClick: () => navigateTo("/help"),
      disabled: true, // 👈 disable this item
    },
    {
      id: "terms-of-use",
      title: "Terms of use",
      description: "Read our terms of use",
      icon: <FileText className="w-4 h-4" />, // Represents documents or terms
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      onClick: () => navigateTo("/terms-of-use"),
      disabled: true, // 👈 disable this item
    },
    {
      id: "logout",
      title: "Logout",
      description: "Sign out of your account",
      icon: <LogOut className="w-4 h-4" />,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <motion.div
      className="fixed top-14 left-0 right-0 z-50 py-2 bg-[#64CE80]"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container mx-auto px-3 flex items-center justify-between">
        {/* Left section - Home icon and welcome message */}
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            {(isSelectCohortPage || isLoading) ? (
              <Home
                className="w-6 h-6 text-white"
                aria-label="Go to Select Cohort"
              />
            ) : (
              <button
                onClick={!isLoading ? handleNavigation : undefined}
                className="disabled:opacity-50"
                disabled={isLoading}
                aria-label="Go to Home"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
            )}
          </motion.div>

          <motion.h2
            className="text-white font-medium text-sm md:text-base"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user ? `Welcome, ${user.userName}` : "Welcome, Guest"}
          </motion.h2>
        </div>

        {/* Center section - Program name */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white font-semibold text-lg">
            {isSelectCohortPage
              ? "Let's get started!"
              : selectedCohortWithProgram
              ? `${selectedCohortWithProgram?.program?.programName}`
              : ""}
          </h3>
        </motion.div>

        {/* Right section - User menu */}
        <div className="relative">
          {user && (
            <>
              <motion.div
                ref={avatarRef}
                onClick={toggleMenu}
                className="flex items-center cursor-pointer bg-white/10 rounded-full pl-2 pr-3 py-1 hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                  {user.userName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="ml-2 text-white text-sm hidden sm:inline-block">
                  {user.userName?.split(" ")[0]}
                </span>
                <motion.div
                  animate={{ rotate: menuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 ml-1 text-white" />
                </motion.div>
              </motion.div>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    ref={menuRef}
                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      borderTop: "3px solid #14b8a6",
                    }}
                  >
                    {/* User Profile Section */}
                    <motion.div
                      // className="p-4 bg-gradient-to-r from-teal-500 to-cyan-400 text-white"
                      className="p-4 bg-teal-500 text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-white text-teal-600 flex items-center justify-center font-bold text-xl">
                          {user.userName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-lg">{user.userName}</p>
                          <p className="text-xs opacity-90">
                            {user.userEmail || "No email provided"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Menu Links */}
                    <div className="py-2">
                      {menuItems.map((item, index) => {
                        const isDisabled = item.disabled;

                        return (
                          <motion.div
                            key={item.id}
                            className={`
        flex items-center px-4 py-3 transition-colors
        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${!isDisabled && item.danger ? "hover:bg-red-50 text-red-600" : ""}
        ${!isDisabled && !item.danger ? "hover:bg-gray-50" : ""}
      `}
                            onClick={() => {
                              if (!isDisabled && item.onClick) item.onClick();
                            }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={isDisabled ? {} : { x: 5 }}
                          >
                            <div
                              className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${item.bgColor} ${item.textColor}
          ${isDisabled ? "opacity-40" : ""}
        `}
                            >
                              {item.icon}
                            </div>
                            <div className="ml-3">
                              <p
                                className={`font-medium ${
                                  isDisabled ? "text-gray-400" : ""
                                }`}
                              >
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
