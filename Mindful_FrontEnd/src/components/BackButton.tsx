// BackButton.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const match = /^\/subconcepts\/[^/]+$/.test(location.pathname);
    if (match) {
      navigate("/dashboard");
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`group flex items-center gap-2 px-3 py-2 text-emerald-700 rounded-lg transition-all duration-300 hover:bg-emerald-50 outline-none ring-2 ring-emerald-500 ring-opacity-50 ${className}`}
      aria-label="Go back"
    >
      <span className="relative overflow-hidden flex items-center justify-center">
        <ArrowLeft
          size={20}
          className="transform transition-transform duration-300 group-hover:-translate-x-1"
        />
      </span>
      <span className="font-medium transform transition-all duration-300 group-hover:translate-x-1 hidden sm:block">
        Back
      </span>
    </button>
  );
};

export default BackButton;
