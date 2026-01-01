// @ts-nocheck
import React, { useState, useRef } from "react";
import useCourseStore from "../../../store/courseStore";
import { useUserContext } from "../../../context/AuthContext";

interface Props {
  subconceptId: string;
  completionStatus?: string;
  isMobile?: boolean;
}

const GoogleFormActions: React.FC<Props> = ({
  subconceptId,
  completionStatus,
  isMobile = false
}) => {
  const { user, cohort } = useUserContext();

  const {
    programId,
    markSubconceptCompleted,
    getSubconceptById,
  } = useCourseStore();

  const [loading, setLoading] = useState(false);
  // Add a ref to track if already submitting
  const isSubmittingRef = useRef(false);

  const isCompleted = completionStatus?.toLowerCase() === "yes";
  const sub = getSubconceptById(subconceptId);

  if (!user?.userId || !programId || !cohort?.cohortId || !sub) return null;

  const handleConfirmSubmit = async () => {
    // PREVENT DOUBLE CLICKING
    if (isSubmittingRef.current || loading) return;
    
    try {
      isSubmittingRef.current = true;
      setLoading(true);

      const sessionId = localStorage.getItem("sessionId") || "";

      const startTs = new Date().toISOString();
      const endTs = new Date().toISOString();

      const payload = {
        cohortId: cohort.cohortId,
        programId,
        sessionId,
        stageId: sub.stageId,
        unitId: sub.unitId,
        subconceptId: sub.subconceptId,
        userId: user.userId,
        userAttemptStartTimestamp: startTs,
        userAttemptEndTimestamp: endTs,
        userAttemptScore: 0,
        userAttemptFlag: true,
      };

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/user-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      markSubconceptCompleted(subconceptId);

      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId },
        })
      );
    } catch (err) {
      console.error("Google Form attempt failed", err);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  /* -------- Mobile UI -------- */
  if (isMobile) {
    if (isCompleted) {
      return (
        <div className="px-4 py-2 flex items-center justify-center bg-green-100 text-green-800 rounded-md text-sm font-medium">
          <span className="truncate">Submitted</span>
        </div>
      );
    }

    return (
      <button
        onClick={handleConfirmSubmit}
        disabled={loading || isSubmittingRef.current}
        className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-md text-sm font-medium transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Submit Form"}
      </button>
    );
  }

  /* -------- Desktop UI -------- */
  if (isCompleted) {
    return (
      <div className="h-[38px] flex items-center bg-green-100 text-green-800 px-4 rounded-md text-sm font-medium">
        Form submitted
      </div>
    );
  }

  return (
    <button
      onClick={handleConfirmSubmit}
      disabled={loading || isSubmittingRef.current}
      className="h-[38px] bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 rounded-md text-sm font-medium transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Submitting..." : "I have submitted the form"}
    </button>
  );
};

export default GoogleFormActions;