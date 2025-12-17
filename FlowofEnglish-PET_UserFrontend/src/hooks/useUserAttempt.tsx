// -----------------------------------------------------------------------------
// useUserAttempt.ts
// -----------------------------------------------------------------------------
import { postUserAttempt } from "../services/userAttemptService";
import type { UserAttemptPayload } from "../services/userAttemptService";

interface RecordAttemptParams {
  user: any;
  programId: string | undefined; // Make undefined to match useParams
  currentContent: any;
  overrideScore?: number;
}

// Helper function (same logic as useAttemptScore but standalone)
const calculateScoreFromType = (type: string, maxScore?: number): number => {
  if (!type) return 0;
  
  const normalized = type.toLowerCase();
  
  const zeroTypes = [
    "assignment_image", 
    "assessment",
    "fib",
    "comprehension",
    "qna",
    "words",
    "listening",
    "writer",
    "mcq"
  ];
  
  const maxScoreTypes = ["video", "youtube", "image", "pdf"];
  
  if (zeroTypes.includes(normalized)) return 0;
  
  if (maxScoreTypes.includes(normalized)) {
    if (typeof maxScore === "number") return maxScore;
    console.warn("Missing maxScore for type:", type);
    return 0;
  }
  
  return 0;
};

export const useUserAttempt = () => {
  const recordAttempt = async ({
    user,
    programId,
    currentContent,
    overrideScore
  }: RecordAttemptParams): Promise<void> => {
    try {
      console.log("Starting recordAttempt with params:", {
        userId: user?.userId,
        programId,
        subconceptId: currentContent?.subconceptId,
        overrideScore
      });

      // Read identifiers and session info
      const selectedCohortRaw = localStorage.getItem("selectedCohort");
      const selectedCohort = selectedCohortRaw
        ? JSON.parse(selectedCohortRaw)
        : null;

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
      if (!sessionId || !cohortId || !programId || !user?.userId) {
        console.error("Missing required fields for user attempt:", {
          sessionId, cohortId, programId, userId: user?.userId
        });
        throw new Error("Missing required fields for user attempt");
      }

      // Ensure subconceptMaxScore is a valid number
      const safeMaxScore =
        typeof subconceptMaxscore === "number"
          ? subconceptMaxscore
          : 0;

      // SCORE RESOLUTION
      let userAttemptScore = 0;
      
      if (typeof overrideScore === "number") {
        // Use override score for iframes
        userAttemptScore = overrideScore;
        console.log("Using override score for iframe:", overrideScore);
      } else {
        // Calculate score based on type
        userAttemptScore = calculateScoreFromType(type, safeMaxScore);
        console.log("Calculated score for type:", type, "score:", userAttemptScore);
      }

      console.log("Recording user attempt with details:", {
        subconceptId,
        type,
        overrideScore,
        calculatedScore: userAttemptScore,
        maxScore: safeMaxScore
      });

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

      console.log("Sending payload to API:", payload);

      // Submit attempt to backend
      const response = await postUserAttempt(payload);
      console.log("API response:", response);

      // Notify components of progress update
      window.dispatchEvent(
        new CustomEvent("updateSidebarCompletion", {
          detail: { subconceptId }
        })
      );

      console.log("User attempt recorded successfully for:", subconceptId);
      
    } catch (err) {
      console.error("Error recording user attempt:", err);
      throw err;
    }
  };

  return { recordAttempt };
};