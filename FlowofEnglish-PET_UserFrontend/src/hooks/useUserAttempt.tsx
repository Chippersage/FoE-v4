// -----------------------------------------------------------------------------
// useUserAttempt.ts
// -----------------------------------------------------------------------------
// Hook for creating and submitting user attempt records.
// Prepares attempt data, calculates score, and updates progress state.
// -----------------------------------------------------------------------------

import { useCourseContext } from "../context/CourseContext";
import { postUserAttempt } from "../services/userAttemptService";
import type { UserAttemptPayload } from "../services/userAttemptService";
import { useAttemptScore } from "./useAttemptScore";

export const useUserAttempt = () => {
  const { user, programId, currentContent } = useCourseContext();
  const { getScore } = useAttemptScore();

  const recordAttempt = async (): Promise<void> => {
    try {
      // Read identifiers and session info
      const selectedCohortRaw = localStorage.getItem("selectedCohort");
      const selectedCohort = selectedCohortRaw ? JSON.parse(selectedCohortRaw) : null;
      const cohortId = selectedCohort?.cohortId;
      const sessionId = localStorage.getItem("sessionId");

      const {
        stageId,
        unitId,
        subconceptId,
        type,
        subconceptMaxscore
      } = currentContent;

      // Validate essential fields
      if (!sessionId || !cohortId || !programId || !user?.userId) return;

      // Ensure subconceptMaxScore is a valid number
      const safeMaxScore = typeof subconceptMaxscore === "number" ? subconceptMaxscore : 0;

      if (typeof subconceptMaxscore !== "number") {
        console.warn("Missing subconceptMaxScore for subconcept:", subconceptId);
      }

      // Compute score for this attempt
      const userAttemptScore = getScore(type, safeMaxScore);

      // Build API payload
      const payload: UserAttemptPayload = {
        cohortId,
        programId,
        sessionId,
        stageId,
        unitId,
        subconceptId,
        userId: user.userId,
        userAttemptStartTimestamp: new Date().toISOString(),
        userAttemptEndTimestamp: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        userAttemptFlag: true,
        userAttemptScore
      };

      // Submit attempt to backend
      await postUserAttempt(payload);

      // Notify components of progress update
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId }
        })
      );

      console.log("User attempt recorded for:", subconceptId);
    } catch (err) {
      console.error("Error recording user attempt:", err);
    }
  };

  return { recordAttempt };
};
