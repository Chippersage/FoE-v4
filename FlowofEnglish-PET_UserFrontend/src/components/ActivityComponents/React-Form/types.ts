// features/react-form/types.ts

export interface Option {
  id: string;
  text: string;
  correct?: boolean;
}

export interface Question {
  id: string;
  type: string;
  marks: number;
  text?: string;
  mediaUrl?: string;
  audioUrl?: string;
  options?: Option[];
  correctAnswer?: string;
}

export interface Activity {
  instructions: string;
  maxPlaysPerAudio: number;
  media?: {
    type: string;
    url: string;
  };
  showScore?: boolean;
  questions: Question[];
  scriptUrl?: string;
}