// @ts-nocheck
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

type NavbarProps = {
  toggleSidebar?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setIsAuthenticated, setUser } = useUserContext();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const userName = user?.userName || "User";
  const isSelectCohortPage = location.pathname === "/select-cohort";

  const menuItems = [
    { title: "Profile" },
    { title: "View Progress" },
    { title: "About Program" },
    { title: "Help" },
    { title: "Terms of Use" },
  ];

  // Logout handler
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

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="flex items-center justify-between px-4 py-2 h-14">
        {/* Sidebar Toggle (Visible on Mobile) */}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            className="md:hidden text-[#0EA5E9] text-2xl font-bold"
          >
            ☰
          </button>
        )}

        {/* Branding */}
        <div
          className={`flex items-center gap-2 select-none ${
            isSelectCohortPage
              ? "cursor-default opacity-80"
              : "cursor-pointer hover:opacity-90"
          }`}
          onClick={() => {
            if (!isSelectCohortPage) navigate("/select-cohort");
          }}
        >
          <img
            src="/icons/FoE_logo.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-lg font-semibold text-black tracking-tight">
            Flow of English
          </h1>
        </div>

        {/* Right Section: Username + Avatar */}
        <div className="flex items-center gap-3 relative">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="text-sm font-medium text-[#0EA5E9] break-words max-w-[160px] text-right leading-tight">
              {userName}
            </span>
          </div>

          {/* Avatar */}
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white font-semibold shadow-md cursor-pointer select-none hover:scale-105 transition-all"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            {userName?.trim().charAt(0).toUpperCase()}
          </div>

          {/* Dropdown Menu */}
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
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#E0F4FD] hover:text-[#0EA5E9] transition-all cursor-pointer"
                  >
                    {item.title}
                  </button>
                ))}

                <div className="border-t border-gray-200 my-1" />

                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-all ${
                    isLoading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50 hover:text-red-700"
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
