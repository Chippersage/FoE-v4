// -----------------------------------------------------------------------------
// useUserAttempt.ts
// -----------------------------------------------------------------------------
// Custom hook to handle user-attempt creation and progress tracking.
// It sends an API request to record attempts and dispatches an event
// to update UI components (Sidebar) without causing global re-renders.
// -----------------------------------------------------------------------------

import { useCourseContext } from "../context/CourseContext";
import { postUserAttempt } from "../services/userAttemptService";
import type { UserAttemptPayload } from "../services/userAttemptService";

export const useUserAttempt = () => {
  const { user, programId, currentContent } = useCourseContext();

  const recordAttempt = async (): Promise<void> => {
    try {
      // -----------------------------------------------------------------------
      // Fetch necessary IDs and session info
      // -----------------------------------------------------------------------
      const selectedCohortRaw = localStorage.getItem("selectedCohort");
      const selectedCohort = selectedCohortRaw ? JSON.parse(selectedCohortRaw) : null;
      const cohortId = selectedCohort?.cohortId;
      const sessionId = localStorage.getItem("sessionId");
      const { stageId, unitId, subconceptId } = currentContent;

      // -----------------------------------------------------------------------
      // Validate required fields before proceeding
      // -----------------------------------------------------------------------
      if (!sessionId || !cohortId || !programId || !user?.userId) return;

      // -----------------------------------------------------------------------
      // Prepare payload for backend API
      // -----------------------------------------------------------------------
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
        userAttemptScore: 2,
      };

      // -----------------------------------------------------------------------
      // API call to save attempt
      // -----------------------------------------------------------------------
      await postUserAttempt(payload);

      // -----------------------------------------------------------------------
      // Dispatch event for Sidebar update (non-reactive)
      // -----------------------------------------------------------------------
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId },
        })
      );

      console.log("✅ User attempt recorded for:", subconceptId);
    } catch (err) {
      console.error("Error recording user attempt:", err);
    }
  };

  return { recordAttempt };
};
