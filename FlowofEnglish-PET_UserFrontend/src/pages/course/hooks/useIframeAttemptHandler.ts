// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useIframeAttemptHandler = ({
  enabled,
  user,
  programId,
  stageId,
  unitId,
  subconcept,
  markSubconceptCompleted,
}) => {
  const [showSubmit, setShowSubmit] = useState(false);
  const [attemptRecorded, setAttemptRecorded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scoreRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const fallbackTimerRef = useRef<any>(null);

  const recordAttempt = useCallback(
    async (score: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      const cohort = JSON.parse(
        localStorage.getItem("selectedCohort") || "{}"
      );
      const sessionId = localStorage.getItem("sessionId");

      await axios.post(`${API_BASE_URL}/user-attempts`, {
        cohortId: cohort.cohortId,
        programId,
        sessionId,
        stageId,
        unitId,
        subconceptId: subconcept.subconceptId,
        userId: user.userId,
        userAttemptFlag: true,
        userAttemptScore: score,
        userAttemptStartTimestamp: new Date().toISOString(),
        userAttemptEndTimestamp: new Date().toISOString(),
      });

      markSubconceptCompleted(subconcept.subconceptId);

      setAttemptRecorded(true);
      setShowSubmit(false);
      setIsSubmitting(false);

      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId: subconcept.subconceptId },
        })
      );
    },
    [
      user,
      programId,
      stageId,
      unitId,
      subconcept,
      markSubconceptCompleted,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MessageEvent) => {
      if (attemptRecorded) return;

      // last slide reached
      if (event.data === "enableSubmit") {
        setShowSubmit(true);
        return;
      }

      if (event.data === "disableSubmit") {
        setShowSubmit(false);
        return;
      }

      // ✅ score wins always
      if (event.data?.type === "scoreData") {
        clearTimeout(fallbackTimerRef.current);

        const score = event.data.payload?.userAttemptScore;
        scoreRef.current = score;

        recordAttempt(score);
        return;
      }

      // confirm without score
      if (event.data === "confirmSubmission") {
        clearTimeout(fallbackTimerRef.current);

        const fallback =
          typeof subconcept.subconceptMaxscore === "number" &&
          subconcept.subconceptMaxscore > 0
            ? subconcept.subconceptMaxscore
            : 1;

        recordAttempt(scoreRef.current ?? fallback);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [enabled, attemptRecorded, recordAttempt, subconcept]);

  // 🔥 THIS WAS MISSING BEFORE
  const onSubmitClicked = () => {
    if (isSubmitting || attemptRecorded) return;

    setIsSubmitting(true);

    // fallback if iframe stays silent
    fallbackTimerRef.current = setTimeout(() => {
      if (submittedRef.current) return;

      const fallback =
        typeof subconcept.subconceptMaxscore === "number" &&
        subconcept.subconceptMaxscore > 0
          ? subconcept.subconceptMaxscore
          : 1;

      recordAttempt(scoreRef.current ?? fallback);
    }, 2000); // same feel as old page
  };

  return {
    showSubmit,
    attemptRecorded,
    isSubmitting,
    onSubmitClicked,
  };
};
