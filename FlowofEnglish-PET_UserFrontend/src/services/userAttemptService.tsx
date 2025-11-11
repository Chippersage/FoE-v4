import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface UserAttemptPayload {
  cohortId: string;
  programId: string;
  sessionId: string;
  stageId: string;
  unitId: string;
  subconceptId: string;
  userId: string;
  userAttemptStartTimestamp: string;
  userAttemptEndTimestamp: string;
  userAttemptFlag: boolean;
  userAttemptScore: number;
}

/**
 * POST user attempt
 */
export const postUserAttempt = async (payload: UserAttemptPayload): Promise<any> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/user-attempts`, payload);
    return res.data;
  } catch (err) {
    console.error("Error posting user attempt:", err);
    throw err;
  }
};
