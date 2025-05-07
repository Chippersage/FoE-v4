export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  type: "single" | "multiple";
  marks: number;
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: Question[];
  selectedOptions: Record<string, string[]>;
  isChecked: boolean;
  score: number;
  timeRemaining: number;
  totalMarks: number;
}
