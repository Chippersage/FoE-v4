export interface LearnerSessionActivity {
  userId: string;
  userName: string;
  userEmail: string;
  lastLogin: string;
  lastLoginTime: string;
  sessions: SessionRecord[];
}

export interface SessionRecord {
  sessionId: string;
  activityName: string;
  score: number;
  completionStatus: "completed" | "in_progress" | "not_started";
  timestamp: string;
  duration: number; // in seconds
}

export interface MentorCohortProgress {
  userId: string;
  userName: string;
  email: string;
  moduleProgress: ModuleProgress[];
  overallProgress: number;
  leaderboardRank: number;
  leaderboardScore: number;
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  progress: number;
  unitProgress: UnitProgress[];
}

export interface UnitProgress {
  unitId: string;
  unitName: string;
  progress: number;
  conceptProgress: ConceptProgress[];
}

export interface ConceptProgress {
  conceptId: string;
  conceptName: string;
  progress: number;
  status: "completed" | "in_progress" | "not_started";
  score?: number;
}

export interface LearnerDetailedProgress {
  userId: string;
  userName: string;
  programId: string;
  programName: string;
  completedStages: number;
  totalStages: number;
  overallScore: number;
  subconcepts: SubconceptAttempt[];
}

export interface SubconceptAttempt {
  subconcptId: string;
  subconcptName: string;
  attempts: AttemptRecord[];
  bestScore: number;
  latestAttemptDate: string;
}

export interface AttemptRecord {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  attemptDate: string;
  duration: number;
  status: "pass" | "fail";
}

export interface MentorDashboardState {
  cohortId: string;
  programId: string;
  mentorId: string;
  selectedLearnerId?: string;
}