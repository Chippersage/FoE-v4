// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";   // <-- Added Home icon

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const HomeExitIcon: React.FC = () => {
  const navigate = useNavigate();

  const handleExit = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    localStorage.removeItem("sessionId");
    localStorage.removeItem("selectedCohort");

    navigate("/select-cohort");
  };

  return (
    <button
      onClick={handleExit}
      className="text-[#0EA5E9] hover:text-[#0284c7] transition"
      title="Go Home"
    >
      <Home className="w-5 h-5" />   {/* Lucide Home icon */}
    </button>
  );
};

export default HomeExitIcon;
