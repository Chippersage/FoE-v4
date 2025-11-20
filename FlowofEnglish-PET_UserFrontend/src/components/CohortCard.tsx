// @ts-nocheck
import React, { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNowStrict, isBefore, parseISO } from "date-fns";

const CohortCard = ({ cohort, onResume }) => {
  const {
    cohortName,
    cohortId,
    programName,
    cohortStartDate,
    cohortEndDate,
    progress,
    programId,
  } = cohort;

  const [isResuming, setIsResuming] = useState(false);

  const start = cohortStartDate ? parseISO(cohortStartDate) : null;
  const end = cohortEndDate ? parseISO(cohortEndDate) : null;

  const remainingDays =
    end && isBefore(new Date(), end)
      ? formatDistanceToNowStrict(end)
      : "Completed";

  const handleResumeClick = async (e) => {
    e.stopPropagation();
    if (isResuming) return;

    setIsResuming(true);

    try {
      if (onResume) await onResume();
    } finally {
      setIsResuming(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-[#0EA5E9] p-5 flex flex-col justify-between"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">
          {programName}
        </h2>
        <p className="text-sm text-slate-500">{cohortName}</p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span>{progress || 0}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-[#0EA5E9] rounded-full transition-all duration-500"
            style={{ width: `${progress || 0}%` }}
          ></div>
        </div>
      </div>

      {cohortEndDate && (
        <div className="mt-4 flex flex-col text-sm text-slate-600">
          <p>Start: {new Date(cohortStartDate).toLocaleDateString()}</p>
          <p>End: {new Date(cohortEndDate).toLocaleDateString()}</p>
          <p className="text-[#0EA5E9] mt-1 font-medium">
            {remainingDays === "Completed"
              ? "Cohort Ended"
              : `${remainingDays} left`}
          </p>
        </div>
      )}

      <button
        onClick={handleResumeClick}
        disabled={isResuming}
        style={{ cursor: "pointer" }}
        className={`mt-5 py-2.5 w-full text-center font-medium text-white rounded-xl transition-all duration-200
          ${isResuming 
            ? "bg-[#0EA5E9] opacity-70" 
            : "bg-[#0EA5E9] hover:bg-[#0284C7]"
          }`}
      >
        {isResuming ? "Resuming..." : "Resume"}
      </button>
    </motion.div>
  );
};

export default CohortCard;
