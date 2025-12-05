import type { LearnerSessionActivity,  MentorCohortProgressRow, LearnerDetailedProgress,  MentorCohortMetadata, MentorCohortUser,
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

export async function fetchMentorCohortUsers(
  mentorId: string,
  cohortId: string
): Promise<MentorCohortMetadata> {

  const url = `${API_BASE_URL}/user-cohort-mappings/mentor/${encodeURIComponent(
    mentorId
  )}/cohort/${encodeURIComponent(cohortId)}/users`;

  console.log(" Fetch cohort users API:", url);

  const resp = await fetch(url, { credentials: "include" });
  return handleResponse<MentorCohortMetadata>(resp);
}

// Disable user from a cohort
export async function disableUserInCohort(
  userId: string,
  cohortId: string,
  reason: string
) {
  const url = `${API_BASE_URL}/user-cohort-mappings/user/${encodeURIComponent(
    userId
  )}/cohort/${encodeURIComponent(cohortId)}/disable`;

  const resp = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  return handleResponse(resp);
}

// Reactivate a user in a cohort
export async function reactivateUserInCohort(
  userId: string,
  cohortId: string
) {
  const url = `${API_BASE_URL}/user-cohort-mappings/user/${encodeURIComponent(
    userId
  )}/cohort/${encodeURIComponent(cohortId)}/reactivate`;

  const resp = await fetch(url, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(resp);
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

export async function fetchProgramReport(
  userId: string,
  programId: string
): Promise<LearnerDetailedProgress> {
  const url = `${API_BASE_URL}/reports/program/${encodeURIComponent(userId)}/${encodeURIComponent(programId)}`;
  
  console.log("📊 Fetching program report from:", url);
  
  const resp = await fetch(url, { 
    credentials: "include",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  if (!resp.ok) {
    throw new Error(`Failed to fetch program report: ${resp.status} ${resp.statusText}`);
  }
  
  return handleResponse<LearnerDetailedProgress>(resp);
}

 // Export data in various formats
export const exportAPI = {
  exportAsPDF: (data: any, filename: string) => {
    // PDF export implementation
    console.log("Exporting as PDF:", filename);
  },
  
  exportAsExcel: (data: any, filename: string) => {
    // Excel export implementation
    console.log("Exporting as Excel:", filename);
  },
  
  exportAsCSV: (data: any, filename: string) => {
    // CSV export implementation
    console.log("Exporting as CSV:", filename);
  }
};


 // Test API connection
export async function testAPIConnection(): Promise<boolean> {
  try {
    const testUrl = `${API_BASE_URL}/health`;
    const response = await fetch(testUrl, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.error("API Connection Test Failed:", error);
    return false;
  }
}


 // Helper function to format API URL
export function getAPIUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${API_BASE_URL}/${endpoint}`;
  
  if (params) {
    const queryParams = new URLSearchParams(params);
    url += `?${queryParams.toString()}`;
  }
  
  return url;
}