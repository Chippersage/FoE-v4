// @ts-nocheck
import React, { useState } from "react";
import { UsersIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const CohortCard = ({
  cohort,
  onResume,
  onViewLearners,
  onViewAssessments,
  onGenerateReport,
  assignmentStatistics,
  userRole,
  onViewMentorDashboard
}) => {
  const {
    cohortName,
    progress = 0,
    completedSubconcepts = 0, // Add this prop
    cohortStartDate,
    cohortEndDate,
    cohortId,
    programId
  } = cohort;

  const navigate = useNavigate();

  const pendingCount =
    assignmentStatistics?.cohortDetails?.[cohortId]?.pendingAssignments || 0;

  const [isResuming, setIsResuming] = useState(false);

  const isCompleted = progress >= 100;
  const isFirstTime = completedSubconcepts === 0; // Check if it's first time (0 completed subconcepts)

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

  const handleResumeClick = async () => {
    if (isResuming) return;
    setIsResuming(true);
    
    try {
      localStorage.setItem("selectedCohort", JSON.stringify({
        cohortId,
        cohortName,
        programId
      }));
      
      if (!localStorage.getItem("sessionId")) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("sessionId", sessionId);
      }
      
      navigate(`/course/${programId}`);
      
      if (onResume) await onResume();
      
    } catch (error) {
      console.error("Error resuming course:", error);
    } finally {
      setTimeout(() => {
        setIsResuming(false);
      }, 3000);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-slate-200 
      flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow transition-all
      ${isCompleted ? "opacity-60" : ""}`}
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col flex-1">
        <h2 className="flex items-center gap-2 text-[15px] font-medium text-slate-800">
          <UsersIcon className="w-4 h-4 text-[#0EA5E9]" />
          {cohortName}
        </h2>

        <div className="mt-2 w-full h-[5px] bg-slate-200 rounded-md overflow-hidden">
          <div
            className="h-full bg-[#0EA5E9] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] text-slate-600 mt-1">
          {progress}% completed
        </span>
      </div>

      {/* DATES */}
      <div className="text-[11px] text-slate-600 leading-tight md:text-right">
        <div>Start: {formatDate(cohortStartDate)}</div>
        <div>End: {formatDate(cohortEndDate)}</div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2 justify-end">

        {userRole?.toLowerCase() === "mentor" && (
          <>
            {/* Mentor Dashboard Button */}
            <button
              onClick={() => onViewMentorDashboard(cohort)}
              className="px-3 py-[6px] bg-white border border-slate-300 rounded-md text-[11px] text-slate-700 cursor-pointer"
            >
              Mentor Dashboard
            </button>
          </>
        )}

        <button
          onClick={handleResumeClick}
          className={`px-3 py-[6px] rounded-md text-[11px] font-medium cursor-pointer
            ${isFirstTime 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-[#0EA5E9] text-white hover:bg-[#0284C7]"}`}
        >
          {isResuming 
            ? "Loading..." 
            : isFirstTime 
              ? "Start" 
              : "Resume"}
        </button>
      </div>
    </div>
  );
};

export default CohortCard;