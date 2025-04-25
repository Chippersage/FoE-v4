// BackButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`group flex items-center gap-2 px-3 py-2 text-emerald-700 rounded-lg transition-all duration-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 ${className}`}
      aria-label="Go back"
    >
      <span className="relative overflow-hidden flex items-center justify-center">
        <ArrowLeft
          size={20}
          className="transform transition-transform duration-300 group-hover:-translate-x-1"
        />
      </span>
      <span className="font-medium transform transition-all duration-300 group-hover:translate-x-1">
        Back
      </span>
    </button>
  );
};

export default BackButton;
