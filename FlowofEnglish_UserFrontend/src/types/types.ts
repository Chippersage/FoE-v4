export interface Word {
  term: string;
  meaning: string;
  example?: string;
}

export interface VocabularyData {
  type: "flashcard" | "slider";
  words: Word[];
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  headerText: string;
  options: Option[];
  type: "single" | "multiple";
  marks: number;
  reference: string | null; // Reference to the question, can be null if not provided
  img?: string | null; // Optional image attribute for the question
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: Question[];
  selectedOptions: Record<string, string[]>;
  isChecked: boolean;
  score: number;
  timeRemaining: number;
  totalMarks: number;
  scoredQuestions: Record<string, boolean>;
}

// API response types
export interface UserProgressData {
  conceptName: string;
  totalMaxScore: number;
  userTotalScore: number;
  conceptId: string;
  totalSubconcepts: number;
  conceptSkill2: string;
  completedSubconcepts: number;
  conceptSkill1: string;
}

// Processed data types
export interface ConceptProgress {
  id: string;
  name: string;
  userScore: number;
  maxScore: number;
  completedSubconcepts: number;
  totalSubconcepts: number;
  skill1: string;
  skill2: string;
}

// In your types.ts file, update the ProcessedUserData interface
export interface ProcessedUserData {
  overallCompletion: number;
  totalScore: number;
  totalMaxScore: number;
  conceptProgress: ConceptProgress[];
  skillScores: SkillScore[];
  skillDistribution: SkillDistribution[];
  strengths: ConceptProgress[];
  areasToImprove: ConceptProgress[];
  skillBasedConceptGroups?: ConceptProgress[]; // Add this optional property
}

// Update SkillScore interface to include additional properties
export interface SkillScore {
  skill: string;
  score: number;
  rawScore?: number;
  rawMaxScore?: number;
  conceptCount?: number;
}


export interface SkillDistribution {
  name: string;
  value: number;
}