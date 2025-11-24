export interface UserSummary {
  userId: string;
  userName: string;
  completedStages: number;
  totalStages: number;
  score: number;
  status: string;
  lastLogin: string | null;
}

export interface StudentProgress {
  programId: string;
  programName: string;
  programDesc: string;
  cohortId: string;
  cohortName: string;

  totalStages: number;
  completedStages: number;
  totalUnits: number;
  completedUnits: number;
  totalSubconcepts: number;
  completedSubconcepts: number;

  stages: Stage[];
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
}

export interface Subconcept {
  subconceptId: string;
  subconceptDesc: string;
  highestScore: number;
  attemptCount: number;
  lastAttemptDate: number;
  completionStatus: string | null;
}
