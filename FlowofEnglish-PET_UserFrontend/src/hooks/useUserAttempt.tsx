// @ts-nocheck
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

interface RecordAttemptParams {
  userId: string;
  programId: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
  subconceptType: string;
  subconceptMaxscore: number;
  score?: number; // Optional override score (for quizzes, etc.)
}

export const useUserAttempt = () => {
  
  const recordAttempt = async (params: RecordAttemptParams): Promise<void> => {
    try {
      const {
        userId,
        programId,
        stageId,
        unitId,
        subconceptId,
        subconceptType,
        subconceptMaxscore,
        score
      } = params;

      // Read from localStorage
      const selectedCohortRaw = localStorage.getItem("selectedCohort");
      const selectedCohort = selectedCohortRaw
        ? JSON.parse(selectedCohortRaw)
        : null;
      const cohortId = selectedCohort?.cohortId;
      const sessionId = localStorage.getItem("sessionId");

      // Validate
      if (!sessionId || !cohortId || !programId || !userId) {
        console.warn("Missing required fields for attempt recording");
        return;
      }

      // Calculate score
      const getAttemptScore = () => {
        if (typeof score === 'number') return score;
        
        const type = subconceptType.toLowerCase();
        if (type === "video") return subconceptMaxscore;
        if (type === "pdf" || type === "image" || type === "assignment") return subconceptMaxscore;
        return 0; // Default for other types
      };

      const userAttemptScore = getAttemptScore();

      // Build payload
      const payload = {
        cohortId,
        programId,
        sessionId,
        stageId,
        unitId,
        subconceptId,
        userId,
        userAttemptStartTimestamp: new Date().toISOString(),
        userAttemptEndTimestamp: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        userAttemptFlag: true,
        userAttemptScore
      };

      // Submit to backend
      await axios.post(`${API_BASE_URL}/user-attempts`, payload);

      // Dispatch event for sidebar updates
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId }
        })
      );

      console.log("Attempt recorded for:", subconceptId);
    } catch (error: any) {
      console.error("Error recording user attempt:", error);
      throw error; // Re-throw for component error handling
    }
  };

  return { recordAttempt };
};