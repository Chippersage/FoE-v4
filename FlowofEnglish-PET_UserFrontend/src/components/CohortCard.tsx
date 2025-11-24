// @ts-nocheck
import React, { useState } from "react";
import { UsersIcon } from "@heroicons/react/24/solid";

const CohortCard = ({
  cohort,
  onResume,
  onViewLearners,
  onViewAssessments,
  onGenerateReport,
  assignmentStatistics,
  userRole
}) => {
  const {
    cohortName,
    programName,
    progress = 0,
    cohortStartDate,
    cohortEndDate,
    cohortId
  } = cohort;

  const pendingCount =
    assignmentStatistics?.cohortDetails?.[cohortId]?.pendingAssignments || 0;

  const [isResuming, setIsResuming] = useState(false);

  const isCompleted = progress >= 100;

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

  const handleResumeClick = async () => {
    if (isResuming) return;
    setIsResuming(true);
    try {
      if (onResume) await onResume();
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl p-4 shadow-sm border border-slate-200 
        w-full flex flex-col md:flex-row 
        md:items-center md:justify-between gap-4
        hover:shadow-md transition-all relative mb-4
        ${isCompleted ? "opacity-60" : ""}
      `}
    >
      {/* TOP LABEL */}
      <div className="absolute -top-3 left-4 bg-slate-100 border border-slate-300 
        rounded-md px-3 py-1 flex items-center gap-1 text-[13px] font-medium text-slate-700 shadow-sm">
        <UsersIcon className="w-4 h-4 text-[#0EA5E9]" />
        {cohortName}
      </div>

      {/* LEFT CONTENT */}
      <div className="flex flex-col flex-1 mt-4">
        <h2 className="text-[18px] font-semibold text-slate-800 leading-tight">
          {programName}
        </h2>

        <div className="mt-2 w-full h-[6px] bg-slate-200 rounded-md overflow-hidden">
          <div
            className="h-full bg-[#0EA5E9]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[13px] text-slate-600 mt-1 font-medium">
          {progress}% completed
        </span>
      </div>

      {/* DATE SIDE */}
      <div className="text-[13px] text-slate-600 md:text-right">
        <div>Start: {formatDate(cohortStartDate)}</div>
        <div>End: {formatDate(cohortEndDate)}</div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-3 justify-end">

        {userRole?.toLowerCase() === "mentor" && (
          <>
            <button
              onClick={() => onViewLearners(cohort)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-md text-[13px] text-slate-700 cursor-pointer"
            >
              View Learners
            </button>

            <button
              onClick={onViewAssessments}
              className="relative px-3 py-2 bg-white border border-slate-300 rounded-md text-[13px] text-slate-700 cursor-pointer"
            >
              Assessments
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={onGenerateReport}
              className="px-3 py-2 bg-white border border-slate-300 rounded-md text-[13px] text-slate-700 cursor-pointer"
            >
              Reports
            </button>
          </>
        )}

        <button
          onClick={handleResumeClick}
          className="
            px-3 py-2 bg-[#0EA5E9] text-white rounded-md text-[13px] cursor-pointer
          "
        >
          {isResuming ? "Resuming..." : "Resume"}
        </button>
      </div>
    </div>
  );
};

export default CohortCard;
