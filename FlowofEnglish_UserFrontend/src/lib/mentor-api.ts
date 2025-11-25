import type {
  LearnerSessionActivity,
  MentorCohortProgressRow,
  LearnerDetailedProgress,
} from "@/types/mentor.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const message = text || resp.statusText || `HTTP ${resp.status}`;
    throw new Error(message);
  }
  return resp.json();
}

export async function fetchLearnerSessionActivity(
  cohortId: string,
  mentorUserId: string
): Promise<LearnerSessionActivity[]> {
  const url = `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent(
    cohortId
  )}/mentor/${encodeURIComponent(mentorUserId)}`;
  const resp = await fetch(url, { credentials: "include" });
  const data = await handleResponse<any>(resp);
  
  // TRANSFORM the API response to match LearnerSessionActivity structure
  if (data && data.users) {
    return data.users.map((user: any) => ({
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail || "",
      lastLogin: user.recentSessions && user.recentSessions.length > 0 
        ? user.recentSessions[0].sessionStartTimestamp 
        : undefined,
      sessions: (user.recentSessions || []).map((session: any) => ({
        sessionId: session.sessionId,
        activityName: "Learning Session", // Default name since API doesn't provide
        timestamp: session.sessionStartTimestamp,
        durationSeconds: session.sessionEndTimestamp && session.sessionStartTimestamp
          ? (new Date(session.sessionEndTimestamp).getTime() - new Date(session.sessionStartTimestamp).getTime()) / 1000
          : undefined,
        status: "completed" // Default status
      }))
    }));
  }
  
  return [];
}


export async function fetchMentorCohortProgress(
  mentorId: string,
  programId: string,
  cohortId: string
): Promise<MentorCohortProgressRow[]> {

  if (!programId?.trim()) {
    throw new Error("Program ID missing");
  }

  const url = `${API_BASE_URL}/reports/mentor/${encodeURIComponent(
    mentorId
  )}/program/${encodeURIComponent(programId)}/cohort/${encodeURIComponent(
    cohortId
  )}/progress`;

  console.log("🔍 Mentor Progress API:", url);

  const resp = await fetch(url, { credentials: "include" });
  const data = await handleResponse<any>(resp);

  if (!data?.users) return [];

  // RETURN ALL RAW VALUES CLEANLY
  return data.users.map((user: any) => ({
    userId: user.userId,
    userName: user.userName,
    status: user.status,
    totalStages: user.totalStages ?? 0,
    completedStages: user.completedStages ?? 0,
    totalUnits: user.totalUnits ?? 0,
    completedUnits: user.completedUnits ?? 0,
    totalSubconcepts: user.totalSubconcepts ?? 0,
    completedSubconcepts: user.completedSubconcepts ?? 0,
    leaderboardScore: user.leaderboardScore ?? 0,
    overallProgress:
      user.totalSubconcepts > 0
        ? Math.round((user.completedSubconcepts / user.totalSubconcepts) * 100)
        : 0,
  }));
}


export async function fetchLearnerDetailedProgress(
  userId: string,
  programId: string
): Promise<LearnerDetailedProgress> {
  const url = `${API_BASE_URL}/reports/program/${encodeURIComponent(
    userId
  )}/${encodeURIComponent(programId)}`;
  const resp = await fetch(url, { credentials: "include" });
  return handleResponse<LearnerDetailedProgress>(resp);
}