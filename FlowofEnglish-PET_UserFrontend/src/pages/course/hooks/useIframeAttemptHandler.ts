// @ts-nocheck
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

  const [iframeScore, setIframeScore] = useState<number | null>(null);
  const [scoreData, setScoreData] = useState<{ score: number; total: number } | null>(null);
  const [showScore, setShowScore] = useState(false);

  const submittedRef = useRef(false);
  const fallbackTimerRef = useRef<any>(null);
  const lastScoreRef = useRef<number | null>(null);

  // Create a unique identifier for the current subconcept
  const subconceptKey = useMemo(() => {
    return subconcept?.subconceptId || 'no-subconcept';
  }, [subconcept?.subconceptId]);

  // ------------------------------------------------------
  // Reset all states when subconcept changes
  // ------------------------------------------------------
  useEffect(() => {
    // Reset all state variables
    setShowSubmit(false);
    setAttemptRecorded(false);
    setIsSubmitting(false);
    setIframeScore(null);
    setScoreData(null);
    setShowScore(false);
    
    // Reset refs
    submittedRef.current = false;
    lastScoreRef.current = null;
    
    // Clear any pending timeout
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, [subconceptKey]); // Reset when subconceptId changes

  const recordAttempt = useCallback(
    async (score: number, total?: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      const cohort = JSON.parse(localStorage.getItem("selectedCohort") || "{}");
      const sessionId = localStorage.getItem("sessionId");

      const totalQuestions =
        total ??
        (typeof subconcept?.subconceptMaxscore === "number" && subconcept.subconceptMaxscore > 0
          ? subconcept.subconceptMaxscore
          : 1);

      try {
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

        setScoreData({ score, total: totalQuestions });
        setIframeScore(score);
        setShowScore(true);
        setAttemptRecorded(true);
        setShowSubmit(false);
        setIsSubmitting(false);

        markSubconceptCompleted(subconcept.subconceptId);

        window.dispatchEvent(
          new CustomEvent("updateSidebarCompletion", {
            detail: { subconceptId: subconcept.subconceptId },
          })
        );
      } catch (error) {
        // Fallback: UI still proceeds even if backend fails
        setScoreData({ score, total: totalQuestions });
        setIframeScore(score);
        setShowScore(true);
        setAttemptRecorded(true);
        setShowSubmit(false);
        setIsSubmitting(false);
      }
    },
    [user, programId, stageId, unitId, subconcept, markSubconceptCompleted]
  );

  // ------------------------------------------------------
  // Listen to iframe messages
  // ------------------------------------------------------
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MessageEvent) => {
      if (attemptRecorded) return;

      // Enable submit
      if (event.data === "enableSubmit") {
        setShowSubmit(true);
        return;
      }

      // Disable submit
      if (event.data === "disableSubmit") {
        setShowSubmit(false);
        return;
      }

      // Unified score formats
      if (event.data?.type === "score") {
        clearTimeout(fallbackTimerRef.current);
        lastScoreRef.current = event.data.score;
        recordAttempt(event.data.score, event.data.total);
        return;
      }

      if (event.data?.type === "scoreData") {
        clearTimeout(fallbackTimerRef.current);
        const score = event.data.payload?.userAttemptScore ?? 0;
        const total = event.data.payload?.totalQuestions;
        lastScoreRef.current = score;
        recordAttempt(score, total);
        return;
      }

      if (event.data?.type === "quizResults") {
        clearTimeout(fallbackTimerRef.current);
        lastScoreRef.current = event.data.correct ?? 0;
        recordAttempt(event.data.correct ?? 0, event.data.total);
        return;
      }

      if (event.data?.score !== undefined) {
        clearTimeout(fallbackTimerRef.current);
        lastScoreRef.current = event.data.score;
        recordAttempt(event.data.score, event.data.total);
        return;
      }

      // Absolute fallback
      if (event.data === "confirmSubmission") {
        clearTimeout(fallbackTimerRef.current);
        const fallbackScore =
          lastScoreRef.current ??
          (typeof subconcept?.subconceptMaxscore === "number" && subconcept.subconceptMaxscore > 0
            ? subconcept.subconceptMaxscore
            : 1);
        recordAttempt(fallbackScore);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [enabled, attemptRecorded, recordAttempt, subconcept]);

  // ------------------------------------------------------
  // Triggered by CoursePage submit button
  // ------------------------------------------------------
  const onSubmitClicked = () => {
    if (isSubmitting || attemptRecorded) return;

    setIsSubmitting(true);

    fallbackTimerRef.current = setTimeout(() => {
      if (submittedRef.current) return;

      const fallbackScore =
        lastScoreRef.current ??
        (typeof subconcept?.subconceptMaxscore === "number" && subconcept.subconceptMaxscore > 0
          ? subconcept.subconceptMaxscore
          : 1);

      recordAttempt(fallbackScore);
    }, 2000);
  };

  const closeScoreDisplay = () => {
    setShowScore(false);
  };

  // Optional: Expose a manual reset function
  const reset = useCallback(() => {
    setShowSubmit(false);
    setAttemptRecorded(false);
    setIsSubmitting(false);
    setIframeScore(null);
    setScoreData(null);
    setShowScore(false);
    submittedRef.current = false;
    lastScoreRef.current = null;
    
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  return {
    showSubmit,
    attemptRecorded,
    isSubmitting,
    onSubmitClicked,
    iframeScore,
    scoreData,
    showScore,
    setShowScore,
    closeScoreDisplay,
    reset, // Expose reset for manual control
  };
};