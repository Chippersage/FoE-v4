// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNowStrict, isBefore, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

const CohortCard = ({ cohort }) => {
  const {
    cohortName,
    programName,
    cohortStartDate,
    cohortEndDate,
    progress,
    isActive,
  } = cohort;

  const navigate = useNavigate();

  const start = cohortStartDate ? parseISO(cohortStartDate) : null;
  const end = cohortEndDate ? parseISO(cohortEndDate) : null;

  const remainingDays =
    end && isBefore(new Date(), end)
      ? formatDistanceToNowStrict(end)
      : "Completed";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:border-orange-300 p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">
          {programName}
        </h2>
        <p className="text-sm text-slate-500">{cohortName}</p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span>{progress || 0}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Dates + Remaining Days */}
      {cohortEndDate && (
        <div className="mt-4 flex flex-col text-sm text-slate-600">
          <p>Start: {new Date(cohortStartDate).toLocaleDateString()}</p>
          <p>End: {new Date(cohortEndDate).toLocaleDateString()}</p>
          <p className="text-orange-600 mt-1 font-medium">
            {remainingDays === "Completed"
              ? "Cohort Ended"
              : `${remainingDays} left`}
          </p>
        </div>
      )}

      
      {/* Status Badge
      <div className="mt-3">
        {isActive ? (
          <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            Active
          </span>
        ) : (
          <span className="inline-block text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
            Inactive
          </span>
        )}
      </div>
      */}

      {/* Resume Button */}
      <button
        onClick={() => navigate("/course")}
        className="mt-5 py-2.5 w-full text-center font-medium text-white bg-orange-600 
                   hover:bg-orange-700 rounded-xl transition-all duration-200"
      >
        Resume
      </button>
    </motion.div>
  );
};

export default CohortCard;