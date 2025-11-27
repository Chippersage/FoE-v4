export interface SessionRecord {
  sessionId: string;
  activityName?: string;
  score?: number;
  status?: "completed" | "in_progress" | "not_started";
  timestamp: string;
  durationSeconds?: number;
  sessionStartTimestamp?: string;
  sessionEndTimestamp?: string;
}

export interface LearnerSessionActivity {
  userId: string;
  userName: string;
  userEmail?: string;
  lastLogin?: string;
  sessions: SessionRecord[]; // last 5 sessions usually
  userType?: string;
  status?: string;
}

export interface ConceptAttempt {
  attemptId: string;
  score: number;
  maxScore?: number;
  percentage?: number;
  attemptDate: string;
  durationSeconds?: number;
  status?: "pass" | "fail";
}

export interface SubconceptAttempt {
  subconceptId: string;
  subconceptName: string;
  attempts: ConceptAttempt[];
  bestScore?: number;
  latestAttemptDate?: string;
}

export interface LearnerDetailedProgress {
  userId: string;
  userName?: string;
  programId: string;
  programName?: string;
  completedStages?: number;
  totalStages?: number;
  overallScore?: number;
  subconcepts: SubconceptAttempt[];
}

export interface UnitProgress {
  unitId: string;
  unitName: string;
  progress: number;
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  progress: number;
  unitProgress?: UnitProgress[];
}

export interface MentorCohortProgressRow {
  userId: string;
  userName: string;
  email?: string;
  overallProgress: number; // 0-100
  leaderboardScore?: number;
  leaderboardRank?: number;
  moduleProgress?: ModuleProgress[];
  totalStages?: number;
  completedStages?: number;
  totalUnits?: number;
  completedUnits?: number;
  totalSubconcepts?: number;
  completedSubconcepts?: number;
  status?: string;
}

export interface MentorCohortUser {
  userId: string;
  userName: string;
  userEmail?: string;
  userPhoneNumber?: string;
  userAddress?: string;
  userType: string;
  status: string;
  createdAt: number;
  deactivatedAt?: number;
  deactivatedReason?: string;
  leaderboardScore: number;
}

export interface MentorCohortMetadata {
  organization: {
    organizationId: string;
    organizationName: string;
    organizationAdminName: string;
    organizationAdminEmail: string;
    organizationAdminPhone: string;
    createdAt: number;
    updatedAt?: number;
    deletedAt?: number;
  };
  cohort: {
    cohortId: string;
    cohortName: string;
    program: {
      programId: string;
      programName: string;
      totalStages: number;
      totalUnits: number;
      totalSubconcepts: number;
    };
    totalUsers: number;
    activeUsers: number;
    deactivatedUsers: number;
  };
  users: MentorCohortUser[];
}
