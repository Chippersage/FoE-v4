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
  // overallProgress: number; // 0-100
  leaderboardScore?: number;
  leaderboardRank?: number;
  programName: string;
  moduleProgress?: ModuleProgress[];
  totalStages?: number;
  completedStages?: number;
  totalUnits?: number;
  completedUnits?: number;
  totalSubconcepts?: number;
  completedSubconcepts?: number;
  totalAssignments?: number;
  completedAssignments?: number;
  recentAttemptDate?: number;
  createdAt?: number;
  status?: string;
}

export interface MentorCohortProgressResponse {
  programId: string;
  programName: string;
  cohortId: string;
  cohortName?: string;
  overallProgressPercentage: number;
  users: MentorCohortProgressRow[];
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

export interface Attempt {
  attemptId: number;
  startTimestamp: number;
  endTimestamp: number;
  score: number;
  successful: boolean;
}

export interface Content {
  contentId: number;
  contentName: string;
  contentDesc: string;
  contentOrigin: string;
  contentTopic: string;
}

export interface Concept {
  conceptId: string;
  conceptName: string;
  conceptDesc: string;
  conceptSkill1: string;
  conceptSkill2: string;
  content: Content;
}

export interface ConceptProgress {
  conceptId: string;
  conceptName: string;
  conceptDesc: string;
  'conceptSkill-1': string;
  'conceptSkill-2': string;
  totalMaxScore: number;
  userTotalScore: number;
  completedSubconcepts: number;
  totalSubconcepts: number;
}

export interface ConceptsProgressResponse {
  concepts: ConceptProgress[];
  userId: string;
  userName: string;
  programId: string;
  programName: string;
}

export interface Subconcept {
  subconceptId: string;
  subconceptDesc: string;
  highestScore: number;
  attemptCount: number;
  lastAttemptDate: number;
  attempts: Attempt[];
  concept: Concept;
  completed: boolean;
  subconceptType?: string;
  subconceptMaxscore?: number;
}

export interface Unit {
  unitId: string;
  unitName: string;
  unitDesc: string;
  totalSubconcepts: number;
  completedSubconcepts: number;
  completionPercentage: number;
  averageScore: number;
  subconcepts: Subconcept[];
  completionStatus: string;
  enabled: boolean;
}

export interface Stage {
  stageId: string;
  stageName: string;
  stageDesc: string;
  totalUnits: number;
  completedUnits: number;
  completionPercentage: number;
  averageScore: number;
  units: Unit[];
  completionStatus: string;
  enabled: boolean;
}

export interface ScoreDistribution {
  "0-20": number;
  "21-40": number;
  "41-60": number;
  "61-80": number;
  "81-100": number;
}

export interface LearnerDetailedProgress {
  programId: string;
  programName: string;
  programDesc: string;
  totalStages: number;
  completedStages: number;
  totalUnits: number;
  completedUnits: number;
  totalSubconcepts: number;
  completedSubconcepts: number;
  stageCompletionPercentage: number;
  unitCompletionPercentage: number;
  subconceptCompletionPercentage: number;
  averageScore: number;
  firstAttemptDate: number;
  lastAttemptDate: number;
  stages: Stage[];
  scoreDistribution: ScoreDistribution;
  userId?: string;
  userName?: string;
  totalAssignments?: number;
  assignmentCompletionPercentage?: number;
  overallScore?: number;
  subconcepts?: SubconceptAttempt[];
}

// Fetch mentor's cohorts with assignment statistics
export interface CohortWithProgram {
  cohortId: string;
  cohortName: string;
  cohortStartDate: number;
  cohortEndDate: number;
  showLeaderboard: boolean;
  delayedStageUnlock: boolean;
  delayInDays: number;
  enableAiEvaluation: boolean;
  program: {
    programId: string;
    programName: string;
    programDesc: string;
    stagesCount: number;
    unitCount: number;
  };
}

export interface MentorCohortsResponse {
  userDetails: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhoneNumber: string;
    userAddress: string;
    userType: string;
    status: string;
    createdAt: number;
    organization: {
      organizationId: string;
      organizationName: string;
      organizationAdminName: string;
      organizationAdminEmail: string;
      organizationAdminPhone: string;
    };
    allCohortsWithPrograms: CohortWithProgram[];
  };
  assignmentStatistics: {
    correctedAssignments: number;
    totalAssignments: number;
    pendingAssignments: number;
    totalCohortUserCount: number;
    cohortDetails: {
      [cohortId: string]: {
        correctedAssignments: number;
        totalAssignments: number;
        pendingAssignments: number;
        cohortUserCount: number;
      };
    };
  };
}

export interface AssignmentFile {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: number;
  downloadUrl: string;
}

export interface SubconceptDependency {
  subconceptId: string;
  subconceptDesc: string;
  subconceptLink: string;
  subconceptMaxscore: number;
  subconceptType: string;
}

export interface SubconceptInfo {
  subconceptId: string;
  showTo: string;
  subconceptDesc: string;
  subconceptLink: string;
  subconceptType: string;
  numQuestions: number;
  subconceptMaxscore: number;
  dependencies?: SubconceptDependency[];
}

export interface Assignment {
  assignmentId: string;
  program: {
    programId: string;
    programName: string;
  };
  stage: {
    stageId: string;
    stageName: string;
  };
  unit: {
    unitId: string;
    unitName: string;
  };
  subconcept: SubconceptInfo;
  submittedFile?: AssignmentFile;
  correctedFile?: AssignmentFile;
  submittedDate: number;
  correctedDate?: number;
  score?: number;
  remarks?: string;
}

export interface UserInfo {
  userId: string;
  userName: string;
  userType: string;
  userEmail?: string;
  userAddress?: string;
  userPhoneNumber?: string;
  status: string;
  leaderboardScore: number;
  createdAt: number;
}

export interface ProgramInfo {
  programId: string;
  programName: string;
}

export interface CohortInfo {
  cohortId: string;
  cohortName: string;
  cohortStartDate: number;
  cohortEndDate: number;
  program: ProgramInfo;
}

export interface UserAssignmentsResponse {
  user: UserInfo;
  cohort: CohortInfo;
  submitted: number;
  evaluated: number;
  pendingReview: number;
  assignments: Assignment[];
}

export interface CohortAssignment {
  assignmentId: string;
  submittedDate: number;
  correctedDate: number | null;
  score: number | null;
  remarks: string | null;
  user: {
    userId: string;
    userName: string;
  };
  program: {
    programId: string;
    programName: string;
  };
  stage: {
    stageId: string;
    stageName: string;
  };
  unit: {
    unitId: string;
    unitName: string;
  };
  subconcept: {
    subconceptId: string;
    subconceptDesc: string;
    subconceptMaxscore: number;
    subconceptLink: string;
    subconceptType: string;
    dependencies?: Array<{
      subconceptId: string;
      subconceptDesc: string;
      subconceptLink: string;
      subconceptMaxscore: number;
      subconceptType: string;
    }>;
  };
  submittedFile?: {
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    downloadUrl: string;
  };
  correctedFile?: {
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    downloadUrl: string;
  };
}

export interface CohortAssignmentStatistics {
  cohortUserCount: number;
  totalAssignments: number;
  correctedAssignments: number;
  pendingAssignments: number;
}

export interface CohortAssignmentsResponse {
  assignments: CohortAssignment[];
  statistics: CohortAssignmentStatistics;
}

export interface SubmitCorrectionParams {
  score?: number;
  remarks?: string;
  correctedDate?: string;
  file?: File;
}

export interface SubmitCorrectionResponse {
  assignmentId: string;
  correctedDate?: number;
  score?: number;
  remarks?: string;
}