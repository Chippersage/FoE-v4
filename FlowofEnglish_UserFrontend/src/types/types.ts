export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  headerText?: string; // Optional field for headertext
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
  scoredQuestions: Record<string, boolean>; // key is question ID
}
