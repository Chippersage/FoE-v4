import type { LearnerSessionActivity,  MentorCohortProgressRow, LearnerDetailedProgress,  MentorCohortMetadata, MentorCohortUser, MentorCohortsResponse,
UserAssignmentsResponse, CohortAssignmentsResponse, SubmitCorrectionResponse, SubmitCorrectionParams, MentorCohortProgressResponse} from "./mentor.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const message = text || resp.statusText || `HTTP ${resp.status}`;
    throw new Error(message);
  }
  return resp.json();
}

// Get users from a cohort
export async function fetchMentorCohortUsers( mentorId: string, cohortId: string ): Promise<MentorCohortMetadata> {
  const url = `${API_BASE_URL}/user-cohort-mappings/mentor/${encodeURIComponent(mentorId)}/cohort/${encodeURIComponent(cohortId)}/users`;
  // console.log(" Fetch cohort users API:", url);
  const resp = await fetch(url, { credentials: "include" });
  return handleResponse<MentorCohortMetadata>(resp);
}

// Disable user from a cohort
export async function disableUserInCohort( userId: string, cohortId: string, reason: string ) {
  const url = `${API_BASE_URL}/user-cohort-mappings/user/${encodeURIComponent(userId)}/cohort/${encodeURIComponent(cohortId)}/disable`;
  const resp = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  return handleResponse(resp);
}

// Reactivate a user in a cohort
export async function reactivateUserInCohort( userId: string, cohortId: string ) {
  const url = `${API_BASE_URL}/user-cohort-mappings/user/${encodeURIComponent(userId)}/cohort/${encodeURIComponent(cohortId)}/reactivate`;
  const resp = await fetch(url, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(resp);
}


export async function fetchLearnerSessionActivity( cohortId: string, mentorUserId: string ): Promise<LearnerSessionActivity[]> {
  const url = `${API_BASE_URL}/user-session-mappings/cohort/${encodeURIComponent( cohortId)}/mentor/${encodeURIComponent(mentorUserId)}`;
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

export async function fetchLatestSessions(mentorUserId: string, cohortId: string, targetUserId?: string ): Promise<LearnerSessionActivity[]> {
  if (!mentorUserId || !cohortId) {
    throw new Error("mentorUserId and cohortId are required");
  }
  const params = new URLSearchParams({ mentorUserId, cohortId, });
  if (targetUserId) { params.append("targetUserId", targetUserId); }

  const url = `${API_BASE_URL}/user-session-mappings/latest?${params.toString()}`;
 // console.log("📊 Fetch Latest Sessions API:", url);
  const resp = await fetch(url, { credentials: "include" });
  const data = await handleResponse<any>(resp);

   // Transform backend response → LearnerSessionActivity[]
  if (!data?.users) return [];

  return data.users.map((user: any): LearnerSessionActivity => ({
    userId: user.userId,
    userName: user.userName,
    userEmail: user.userEmail || "",
    userType: user.userType,
    status: user.status,
    lastLogin:
      user.recentSessions?.length > 0
        ? user.recentSessions[0].sessionStartTimestamp
        : undefined,

    sessions: (user.recentSessions || []).map((session: any) => ({
      sessionId: session.sessionId,
      activityName: "Learning Session", // backend doesn’t send name
      timestamp: session.sessionStartTimestamp,
      sessionStartTimestamp: session.sessionStartTimestamp,
      sessionEndTimestamp: session.sessionEndTimestamp,
      durationSeconds:
        session.sessionStartTimestamp && session.sessionEndTimestamp
          ? (new Date(session.sessionEndTimestamp).getTime() -
            new Date(session.sessionStartTimestamp).getTime()) / 1000
          : undefined,
      status: "completed",
    })),
  }));
}


export async function fetchMentorCohortProgress( mentorId: string, programId: string, cohortId: string ): Promise<MentorCohortProgressResponse> {
  if (!programId?.trim()) {
    throw new Error("Program ID missing");
  }
  const url = `${API_BASE_URL}/reports/mentor/${encodeURIComponent(mentorId)}/program/${encodeURIComponent(programId)}/cohort/${encodeURIComponent(cohortId)}/progress`;
 // console.log("🔍 Mentor Progress API:", url);
  const resp = await fetch(url, { credentials: "include" });
  const data = await handleResponse<any>(resp);

  if (!data?.users) {
    throw new Error("Invalid mentor cohort progress response");
  }

  const programName = data.programName ?? programId;

  return {
    programId: data.programId ?? programId,
    programName,
    cohortId: data.cohortId ?? cohortId,
    cohortName: data.cohortName,
    overallProgressPercentage: data.overallProgressPercentage ?? 0,

    users: data.users.map((user: any) => ({
      userId: user.userId,
      userName: user.userName,
      programName,
      status: user.status,

      totalStages: user.totalStages ?? 0,
      completedStages: user.completedStages ?? 0,
      totalUnits: user.totalUnits ?? 0,
      completedUnits: user.completedUnits ?? 0,
      totalSubconcepts: user.totalSubconcepts ?? 0,
      completedSubconcepts: user.completedSubconcepts ?? 0,
      totalAssignments: user.totalAssignments ?? 0,
      completedAssignments: user.completedAssignments ?? 0,
      createdAt: user.createdAt,
      recentAttemptDate : user.recentAttemptDate,

      leaderboardScore: user.leaderboardScore ?? 0,
      // overallProgress:
      //   user.totalSubconcepts > 0
      //     ? Math.round(
      //         (user.completedSubconcepts / user.totalSubconcepts) * 100
      //       )
      //     : 0,
    })),
  };
}


export async function fetchLearnerDetailedProgress( userId: string, programId: string ): Promise<LearnerDetailedProgress> {
  const url = `${API_BASE_URL}/reports/program/${encodeURIComponent(userId)}/${encodeURIComponent(programId)}`;
  const resp = await fetch(url, { credentials: "include" });
  return handleResponse<LearnerDetailedProgress>(resp);
}

export async function fetchProgramReport(userId: string, programId: string): Promise<LearnerDetailedProgress> {
  const url = `${API_BASE_URL}/reports/program/${encodeURIComponent(userId)}/${encodeURIComponent(programId)}`;
 // console.log("📊 Fetching program report from:", url);
  const resp = await fetch(url, {  credentials: "include",
    headers: {  'Accept': 'application/json',  'Content-Type': 'application/json' } });
  if (!resp.ok) {
    throw new Error(`Failed to fetch program report: ${resp.status} ${resp.statusText}`);
  }
  
  return handleResponse<LearnerDetailedProgress>(resp);
}

// Fetch all assignments for a user in a specific cohort
export async function fetchUserAssignments( cohortId: string, userId: string, programId: string): Promise<UserAssignmentsResponse> {
  if (!cohortId || !userId || !programId) {
    throw new Error("cohortId, userId, and programId are required");
  }
  const url = `${API_BASE_URL}/assignments/cohort/${encodeURIComponent(cohortId)}/user/${encodeURIComponent(userId)}/assignments?programId=${encodeURIComponent(programId)}`;
  
  const resp = await fetch(url, { credentials: "include",
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
  });
  
  if (!resp.ok) {
    const errorText = await resp.text().catch(() => '');
    throw new Error(`Failed to fetch assignments: ${resp.status} ${resp.statusText} - ${errorText}`);
  }
  return handleResponse<UserAssignmentsResponse>(resp);
}

// Fetch all assignments for a cohort
export async function fetchCohortAssignments(cohortId: string): Promise<CohortAssignmentsResponse> {
  if (!cohortId) {
    throw new Error("cohortId is required");
  }
  const url = `${API_BASE_URL}/assignments/cohort/${encodeURIComponent(cohortId)}`;

  const resp = await fetch(url, {
    credentials: "include",
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
  });

  if (!resp.ok) {
    const errorText = await resp.text().catch(() => '');
    throw new Error(`Failed to fetch cohort assignments: ${resp.status} ${resp.statusText} - ${errorText}`);
  }
  return handleResponse<CohortAssignmentsResponse>(resp);
}



// Submit corrected assignment
export async function submitCorrectedAssignment( assignmentId: string, params: SubmitCorrectionParams ): Promise<SubmitCorrectionResponse> {
  if (!assignmentId) {
    throw new Error("assignmentId is required");
  }
  const url = `${API_BASE_URL}/assignments/${encodeURIComponent(assignmentId)}/correct`;
  
  // Create FormData for multipart request
  const formData = new FormData();
  
  if (params.score !== undefined) {
    formData.append('score', params.score.toString());
  }
  
  if (params.remarks) {
    formData.append('remarks', params.remarks);
  }
  
  if (params.correctedDate) {
    formData.append('correctedDate', params.correctedDate);
  }
  
  if (params.file) {
    formData.append('file', params.file);
  }
  
  const resp = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
    // Note: Don't set Content-Type header for FormData - browser will set it with boundary
  });
  
  if (!resp.ok) {
    const errorText = await resp.text().catch(() => '');
    throw new Error(`Failed to submit correction: ${resp.status} ${resp.statusText} - ${errorText}`);
  }
  
  return handleResponse<SubmitCorrectionResponse>(resp);
}

// Alternative submit correction with typed params (if you prefer explicit parameter passing)
export async function submitAssignmentCorrection(assignmentId: string, score?: number, remarks?: string, correctedDate?: string, file?: File
): Promise<SubmitCorrectionResponse> {
  return submitCorrectedAssignment(assignmentId, { score, remarks, correctedDate, file });
}

//Fetching all assigned mentor cohorts
export async function fetchMentorCohorts(mentorId: string): Promise<MentorCohortsResponse> {
  const url = `${API_BASE_URL}/users/${encodeURIComponent(mentorId)}/cohorts`;
 // console.log("🔍 Fetching mentor cohorts:", url);
  const resp = await fetch(url, { credentials: "include" });
  return handleResponse<MentorCohortsResponse>(resp);
}

// Feching user's concepts progress in a program
export async function fetchUserConceptsProgress( programId: string, userId: string ): Promise<any> {
  const url = `${API_BASE_URL}/programs/${programId}/concepts/progress/${userId}`;
  const resp = await fetch(url, {
    credentials: "include",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  if (!resp.ok) {
    throw new Error(`Failed to fetch concepts progress: ${resp.status} ${resp.statusText}`);
  }
  return handleResponse<any>(resp);
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
    const response = await fetch(testUrl, { method: 'GET',
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